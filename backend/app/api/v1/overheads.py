from typing import List
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from app.api.deps import SessionDep
from app.models.overhead import OverheadCost
from app.schemas.overhead import OverheadCreate, OverheadResponse, OverheadUpdate

router = APIRouter()

@router.get("/", response_model=List[OverheadResponse])
async def read_overheads(db: SessionDep):
    result = await db.execute(select(OverheadCost))
    return result.scalars().all()

@router.post("/", response_model=OverheadResponse, status_code=status.HTTP_201_CREATED)
async def create_overhead(overhead_in: OverheadCreate, db: SessionDep):
    db_obj = OverheadCost(**overhead_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=OverheadResponse)
async def update_overhead(id: int, overhead_in: OverheadUpdate, db: SessionDep):
    db_obj = await db.get(OverheadCost, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Overhead not found")
        
    update_data = overhead_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_overhead(id: int, db: SessionDep):
    db_obj = await db.get(OverheadCost, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Overhead not found")
    await db.delete(db_obj)
    await db.commit()
