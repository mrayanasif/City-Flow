from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SensorData(BaseModel):
    device_id: str = Field(..., example="ESP32_CITYFLOW_01")
    ldr_value: int = Field(..., ge=0, le=4095)
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100)
    distance_cm: float = Field(..., ge=0, le=400)
    gas_detected: bool
    motion_detected: bool
    relay_status: bool
    timestamp: Optional[datetime] = None

class SensorDataResponse(SensorData):
    id: int
    created_at: datetime