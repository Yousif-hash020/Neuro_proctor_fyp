import cv2
import asyncio
import socketio
import base64
from ultralytics import YOLO

# COCO class IDs relevant to exam monitoring
PERSON_CLASS = 0
PHONE_CLASS  = 67  # cell phone

class YoloDetector:
    def __init__(self, camera_id=0, stream_name="Camera", session_id=None):
        self.camera_id   = camera_id
        self.stream_name = stream_name
        self.session_id  = session_id  # linked exam session
        self.model       = YOLO('yolov8n.pt')
        self.running     = False

        self.sio = socketio.AsyncClient(reconnection=True, reconnection_attempts=5)
        self.backend_url = 'http://localhost:5000'

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
        encode_every = 6   # send base64 frame every 6th inference (~5 FPS)
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

            # ── Run YOLO inference (person + phone) ─────────────────────────
            results = self.model(
                frame,
                classes=[PERSON_CLASS, PHONE_CLASS],
                verbose=False
            )

            persons_detected = 0
            phones_detected  = 0
            annotated_frame  = frame.copy()

            for r in results:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    if cls == PERSON_CLASS:
                        persons_detected += 1
                    elif cls == PHONE_CLASS:
                        phones_detected += 1
                annotated_frame = r.plot()  # draw bounding boxes

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
                _, buffer = cv2.imencode(
                    '.jpg', annotated_frame,
                    [int(cv2.IMWRITE_JPEG_QUALITY), 55]  # compressed for speed
                )
                frame_b64 = base64.b64encode(buffer).decode('utf-8')

            # ── Emit detection payload ───────────────────────────────────────
            # Safe confidence calculation — guard against empty boxes tensor
            try:
                conf_val = (
                    round(float(results[0].boxes.conf.mean()) * 100, 1)
                    if results and len(results[0].boxes) > 0
                    else 0
                )
            except Exception:
                conf_val = 0

            payload = {
                "cameraId":   str(self.camera_id),
                "name":       self.stream_name,
                "sessionId":  self.session_id,
                "students":   persons_detected,
                "phones":     phones_detected,
                "risk":       risk_level,
                "confidence": conf_val,
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
