from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import SensorData
from supabase_client import SupabaseDB
from websocket_manager import manager
import datetime
from typing import List

app = FastAPI(title="City-Flow IoT API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = SupabaseDB()

@app.post("/api/sensor-data", status_code=201)
async def receive_sensor_data(data: SensorData):
    result = db.insert_sensor_data(data)
    if result:
        await manager.broadcast({
            "type": "new_data",
            "data": {
                "device_id": data.device_id,
                "ldr_value": data.ldr_value,
                "temperature": data.temperature,
                "humidity": data.humidity,
                "distance_cm": data.distance_cm,
                "gas_detected": data.gas_detected,
                "motion_detected": data.motion_detected,
                "relay_status": data.relay_status,
                "timestamp": result.get('created_at', datetime.datetime.now().isoformat())
            }
        })
        return {"status": "success", "message": "Data stored", "id": result.get('id')}
    raise HTTPException(status_code=500, detail="Failed to store data")

@app.get("/api/sensor-data/latest", response_model=List[dict])
async def get_latest_data(limit: int = 5):
    return db.get_latest_data(limit)

@app.get("/api/sensor-data/history", response_model=List[dict])
async def get_history(hours: int = 24):
    return db.get_history(hours)

@app.get("/api/sensor-data/alerts", response_model=List[dict])
async def get_alerts(limit: int = 10):
    return db.get_alerts(limit)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now().isoformat()}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)