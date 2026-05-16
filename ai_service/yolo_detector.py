import cv2
import asyncio
import socketio
import base64
import numpy as np
from ultralytics import YOLO

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
        self.model       = YOLO('yolov8n.pt')
        self.running     = False

        self.sio = socketio.AsyncClient(reconnection=True, reconnection_attempts=5)
        self.backend_url = 'http://localhost:5000'

    def run_detection(self, frame):
        """
        Run detection and return:
          - detections list: [{label, confidence, bbox}]
          - counts per class
          - mean confidence
          - annotated frame
        """
        results = self.model(frame, classes=TARGET_CLASS_IDS, verbose=False)
        detections = []
        counts = {"persons": 0, "phones": 0}
        annotated_frame = frame.copy()

        for r in results:
            if hasattr(r, "boxes") and r.boxes is not None:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    conf = round(float(box.conf[0]) * 100, 1)
                    x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                    label = LABEL_BY_CLASS.get(cls)
                    if not label:
                        continue

                    if cls == PERSON_CLASS:
                        counts["persons"] += 1
                    elif cls == PHONE_CLASS:
                        counts["phones"] += 1

                    detections.append({
                        "label": label,
                        "confidence": conf,
                        "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                    })
            annotated_frame = r.plot()

        mean_confidence = round(
            sum(item["confidence"] for item in detections) / len(detections), 1
        ) if detections else 0

        return {
            "detections": detections,
            "counts": counts,
            "mean_confidence": mean_confidence,
            "annotated_frame": annotated_frame,
        }

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

        detection_output = self.run_detection(frame)
        return {
            "detections": detection_output["detections"],
            "counts": detection_output["counts"],
            "confidence": detection_output["mean_confidence"],
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
        if not cap.isOpened():
            print(f"[AI] Error opening camera {self.camera_id}")
            return

        print(f"[AI] Detection started — {self.stream_name}")

        frame_count  = 0
        frame_skip   = 3   # run inference every 3rd frame (~10 FPS)
        encode_every = 1   # send base64 frame every inference for visible boxes
        infer_count  = 0

        while self.running:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % frame_skip != 0:
                await asyncio.sleep(0.01)
                continue

            infer_count += 1

            # ── Run YOLO inference ───────────────────────────────────────────
            detection_output = self.run_detection(frame)
            persons_detected = detection_output["counts"]["persons"]
            phones_detected = detection_output["counts"]["phones"]
            annotated_frame = detection_output["annotated_frame"]
            detections = detection_output["detections"]
            confidence = detection_output["mean_confidence"]

            # ── Risk logic ───────────────────────────────────────────────────
            risk_level = "low"
            if phones_detected > 0:
                risk_level = "high"
                await self.send_alert("Phone / Device Detected", "Red")
            elif persons_detected > 1:
                risk_level = "high"
                await self.send_alert("Multiple Persons Detected", "Red")
            elif persons_detected == 0:
                risk_level = "medium"
                await self.send_alert("Student Missing From Frame", "Orange")

            # ── Encode annotated frame to base64 (every N inference frames) ─
            frame_b64 = None
            if infer_count % encode_every == 0:
                frame_b64 = self.encode_frame_to_base64(annotated_frame)

            # ── Emit detection payload ───────────────────────────────────────
            payload = {
                "cameraId":   str(self.camera_id),
                "name":       self.stream_name,
                "sessionId":  self.session_id,
                "students":   persons_detected,
                "phones":     phones_detected,
                "risk":       risk_level,
                "confidence": confidence,
                "detections": detections,
                "status":     "active",
                "frame":      frame_b64,   # None if not this tick
            }

            if self.sio.connected:
                await self.sio.emit('ai_detection', payload)

            await asyncio.sleep(0.05)  # ~20 FPS cap

        cap.release()
        if self.sio.connected:
            await self.sio.disconnect()
        print("[AI] Detection stopped.")

    async def send_alert(self, alert_type, severity):
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
