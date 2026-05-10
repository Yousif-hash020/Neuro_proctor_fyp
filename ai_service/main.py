from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import asyncio
from yolo_detector import YoloDetector

detector: Optional[YoloDetector] = None
detection_task: Optional[asyncio.Task] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern FastAPI lifespan handler (replaces deprecated on_event)."""
    global detector, detection_task

    # ── Startup ──────────────────────────────────────────────────────────────
    print("[AI] Starting up AI service...")
    detector = YoloDetector(camera_id=0, stream_name="Cam 1 - Local")
    detection_task = asyncio.create_task(detector.start())

    yield  # app is running

    # ── Shutdown ─────────────────────────────────────────────────────────────
    print("[AI] Shutting down AI service...")
    if detector:
        detector.stop()
    if detection_task and not detection_task.done():
        detection_task.cancel()
        try:
            await detection_task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="NeuroProctor AI Service", version="2.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "status": "AI Service Running",
        "camera": detector.stream_name if detector else None,
        "session": detector.session_id if detector else None,
    }


@app.get("/status")
def get_status():
    return {
        "running": detector.running if detector else False,
        "camera_id": detector.camera_id if detector else None,
        "stream_name": detector.stream_name if detector else None,
        "session_id": detector.session_id if detector else None,
    }


@app.post("/start")
async def start_detection(
    session_id: Optional[str] = Query(None, description="MongoDB session ID to link alerts"),
    camera_id: int = Query(0, description="OpenCV camera index")
):
    """Start detection with a linked session (idempotent for same running config)."""
    global detector, detection_task

    if (
        detector
        and detector.running
        and detector.camera_id == camera_id
        and str(detector.session_id) == str(session_id)
    ):
        return {
            "status": "Detection already running",
            "session_id": session_id,
            "camera_id": camera_id
        }

    if detector and detector.running:
        detector.stop()
        if detection_task and not detection_task.done():
            detection_task.cancel()
            try:
                await detection_task
            except asyncio.CancelledError:
                pass
        await asyncio.sleep(0.5)

    detector = YoloDetector(
        camera_id=camera_id,
        stream_name=f"Cam {camera_id + 1} - Local",
        session_id=session_id
    )
    detection_task = asyncio.create_task(detector.start())
    return {"status": "Detection started", "session_id": session_id, "camera_id": camera_id}


@app.post("/stop")
def stop_detection():
    if detector:
        detector.stop()
        return {"status": "Detection stopped"}
    return {"status": "No active detector"}

@app.post("/detect")
async def detect_from_image(image: UploadFile = File(...)):
    """
    Sprint 3 REST endpoint:
    Accept an uploaded image and return YOLO detections with
    label, confidence, and bounding box coordinates.
    """
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector is not initialized")

    content_type = image.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    try:
        image_bytes = await image.read()
        result = detector.detect_from_image_bytes(image_bytes)
        return {
            "status": "ok",
            "filename": image.filename,
            "result": result,
        }
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err)) from err
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Detection failed: {err}") from err


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
