from typing import Optional
from pydantic import BaseModel, ConfigDict

class OverheadBase(BaseModel):
    name: str
    cost_type: str
    value: float
    is_active: bool = True

class OverheadCreate(OverheadBase):
    pass

class OverheadUpdate(BaseModel):
    name: Optional[str] = None
    cost_type: Optional[str] = None
    value: Optional[float] = None
    is_active: Optional[bool] = None

class OverheadResponse(OverheadBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
