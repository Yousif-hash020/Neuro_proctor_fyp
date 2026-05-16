import cv2
import asyncio
import socketio
import base64
import numpy as np
import time
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort

# COCO class IDs relevant to exam monitoring
PERSON_CLASS = 0
PHONE_CLASS  = 67  # cell phone
TARGET_CLASS_IDS = [PERSON_CLASS, PHONE_CLASS]
LABEL_BY_CLASS = {
    PERSON_CLASS: "person",
    PHONE_CLASS: "mobile phone",
}

class YoloDetector:
    def __init__(self, camera_id=0, stream_name="Camera", session_id=None):
        self.camera_id   = camera_id
        self.stream_name = stream_name
        self.session_id  = session_id  # linked exam session
        self.model       = YOLO('yolo26n.pt')
        self.running     = False
        self.tracker = DeepSort(
            max_age=30,
            n_init=2,
            max_cosine_distance=0.4,
            nn_budget=100
        )

        self.sio = socketio.AsyncClient(reconnection=True, reconnection_attempts=5)
        self.backend_url = 'http://localhost:5000'
        
        # State tracking for frame skipping and cooldowns
        self.last_detections = []
        self.last_counts = {"persons": 0, "phones": 0}
        self.last_confidence = 0
        self.last_alert_times = {}

    def run_detection(self, frame):
        """
        Run YOLO detection and save state to avoid running every frame.
        """
        # Optimized inference with reduced image size, conf threshold, specific classes, and forced CPU.
        results = self.model.predict(
            frame,
            classes=[PERSON_CLASS, PHONE_CLASS],
            imgsz=640,
            conf=0.30,
            iou=0.55,
            verbose=False,
            device='cpu' # Safely keeping 'cpu' instead of '0' to avoid the CUDA crash seen earlier
        )
        detections = []
        person_detections = []
        raw_person_boxes = []
        raw_person_scores = []
        counts = {"persons": 0, "phones": 0}

        for r in results:
            if hasattr(r, "boxes") and r.boxes is not None:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                    label = LABEL_BY_CLASS.get(cls)
                    if not label:
                        continue

                    if cls == PERSON_CLASS:
                        w = x2 - x1
                        h = y2 - y1
                        if w < 35 or h < 70:
                            continue
                        raw_person_boxes.append([x1, y1, w, h])
                        raw_person_scores.append(conf)
                    elif cls == PHONE_CLASS:
                        counts["phones"] += 1
                        detections.append({
                            "label": label,
                            "confidence": round(conf * 100, 1),
                            "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                            "cls": cls
                        })

        # Apply OpenCV NMS to person boxes before DeepSORT
        if len(raw_person_boxes) > 0:
            indices = cv2.dnn.NMSBoxes(
                raw_person_boxes,
                raw_person_scores,
                score_threshold=0.30,
                nms_threshold=0.55
            )
            if len(indices) > 0:
                for i in indices.flatten():
                    box = raw_person_boxes[i]
                    conf = raw_person_scores[i]
                    person_detections.append((box, conf, "person"))
        
        counts["persons"] = len(person_detections)

        # Update DeepSORT tracker
        tracks = self.tracker.update_tracks(person_detections, frame=frame)
        
        # Avoid duplicate IDs by filtering confirmed tracks
        tracked_boxes = []
        tracked_scores = []
        tracked_ids = []
        
        for track in tracks:
            if not track.is_confirmed():
                continue
            
            track_id = track.track_id
            ltrb = track.to_ltrb()
            tx1, ty1, tx2, ty2 = [int(v) for v in ltrb]
            w = tx2 - tx1
            h = ty2 - ty1
            det_conf = track.det_conf if track.det_conf is not None else 0.99
            
            tracked_boxes.append([tx1, ty1, w, h])
            tracked_scores.append(det_conf)
            tracked_ids.append(track_id)
            
        if len(tracked_boxes) > 0:
            indices = cv2.dnn.NMSBoxes(
                tracked_boxes,
                tracked_scores,
                score_threshold=0.0,
                nms_threshold=0.5
            )
            if len(indices) > 0:
                for i in indices.flatten():
                    tx1, ty1, w, h = tracked_boxes[i]
                    detections.append({
                        "id": tracked_ids[i],
                        "label": "person",
                        "confidence": round(tracked_scores[i] * 100, 1),
                        "bbox": {"x1": tx1, "y1": ty1, "x2": tx1 + w, "y2": ty1 + h},
                        "cls": PERSON_CLASS
                    })

        mean_confidence = round(
            sum(item["confidence"] for item in detections) / len(detections), 1
        ) if detections else 0

        self.last_detections = detections
        self.last_counts = counts
        self.last_confidence = mean_confidence

    def draw_boxes(self, frame):
        """
        Manually draw bounding boxes using OpenCV instead of slower r.plot().
        """
        annotated_frame = frame.copy()
        for det in self.last_detections:
            box = det["bbox"]
            x1, y1, x2, y2 = box["x1"], box["y1"], box["x2"], box["y2"]
            
            # Colors and labels based on class
            if det["cls"] == PERSON_CLASS:
                color = (0, 255, 0)
                label_text = f"Person ID {det.get('id', '?')}"
            else:
                color = (0, 0, 255)
                label_text = "Mobile Phone"
            
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(annotated_frame, label_text, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
        return annotated_frame

    @staticmethod
    def encode_frame_to_base64(frame):
        _, buffer = cv2.imencode(
            '.jpg', frame,
            [int(cv2.IMWRITE_JPEG_QUALITY), 55]
        )
        return base64.b64encode(buffer).decode('utf-8')

    def detect_from_image_bytes(self, image_bytes):
        """
        For REST API usage: decode incoming bytes and return structured detections.
        """
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Invalid image bytes")

        self.run_detection(frame)
        return {
            "detections": self.last_detections,
            "counts": self.last_counts,
            "confidence": self.last_confidence,
        }

    async def connect_to_backend(self):
        try:
            await self.sio.connect(self.backend_url)
            print(f"[AI] Connected to backend at {self.backend_url}")
        except Exception as e:
            print(f"[AI] Failed to connect to backend: {e}")

    async def start(self):
        self.running = True
        await self.connect_to_backend()

        cap = cv2.VideoCapture(self.camera_id)
        # Optimized Webcam Settings
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if not cap.isOpened():
            print(f"[AI] Error opening camera {self.camera_id}")
            return

        print(f"[AI] Detection started — {self.stream_name}")

        frame_count  = 0
        frame_skip   = 2   # run inference every 2nd frame

        while self.running:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            # 1) Run YOLO inference only every few frames to save CPU load
            if frame_count % frame_skip == 0:
                self.run_detection(frame)

            # 2) Draw boxes manually on EVERY frame to maintain smooth 30 FPS video
            annotated_frame = self.draw_boxes(frame)

            persons_detected = self.last_counts["persons"]
            phones_detected = self.last_counts["phones"]

            # 3) Risk logic
            risk_level = "low"
            if phones_detected > 0:
                risk_level = "high"
                await self.send_alert("Phone / Device Detected", "Red")
            elif persons_detected == 0:
                risk_level = "medium"
                await self.send_alert("Student Missing From Frame", "Orange")
            # Multiple persons do not trigger high risk/alert (counted but not flagged yet)

            # 4) Always send base64 frame so UI video is perfectly smooth
            frame_b64 = self.encode_frame_to_base64(annotated_frame)

            payload = {
                "cameraId":   str(self.camera_id),
                "name":       self.stream_name,
                "sessionId":  self.session_id,
                "students":   persons_detected,
                "phones":     phones_detected,
                "risk":       risk_level,
                "confidence": self.last_confidence,
                "detections": self.last_detections,
                "status":     "active",
                "frame":      frame_b64,
            }

            if self.sio.connected:
                await self.sio.emit('ai_detection', payload)

            await asyncio.sleep(0.01)

        cap.release()
        if self.sio.connected:
            await self.sio.disconnect()
        print("[AI] Detection stopped.")

    async def send_alert(self, alert_type, severity):
        now = time.time()
        # Alert Cooldown Logic: Prevent repeated alerts of same type every frame
        if alert_type in self.last_alert_times and (now - self.last_alert_times[alert_type]) < 5.0:
            return
            
        self.last_alert_times[alert_type] = now

        if self.sio.connected:
            await self.sio.emit('ai_alert', {
                "type":       alert_type,
                "severity":   severity,
                "cameraId":   str(self.camera_id),
                "cameraName": self.stream_name,
                "sessionId":  self.session_id,
            })

    def stop(self):
        self.running = False
