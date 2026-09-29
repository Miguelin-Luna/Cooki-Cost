# -*- coding: utf-8 -*-
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from sqlalchemy.future import select
from app.core.db import AsyncSessionLocal
from app.models.ingredient import Ingredient
from datetime import datetime, timezone

ingredients_data = [
    {'name': 'Mantequilla sin sal', 'brand': 'MIRAFLORES', 'unit': 'g', 'package_quantity': 100, 'package_cost': 1.79},
    {'name': 'Mantequilla con sal', 'brand': 'MIRAFLORES', 'unit': 'g', 'package_quantity': 250, 'package_cost': 4.78},
    {'name': 'Azúcar blanca', 'brand': 'SAN CARLOS', 'unit': 'kg', 'package_quantity': 1, 'package_cost': 1.07},
    {'name': 'Azúcar morena', 'brand': 'SAN CARLOS', 'unit': 'kg', 'package_quantity': 2, 'package_cost': 2.07},
    {'name': 'Harina sin polvo de hornear', 'brand': 'YA', 'unit': 'g', 'package_quantity': 900, 'package_cost': 1.92},
    {'name': 'Chispas de chocolate semi amargo', 'brand': 'SICAO', 'unit': 'g', 'package_quantity': 500, 'package_cost': 6.11},
    {'name': 'Huevos extra grandes', 'brand': 'INDAVES', 'unit': 'unidades', 'package_quantity': 30, 'package_cost': 6.67},
    {'name': 'Chocolate semi amargo', 'brand': 'SUPERIOR', 'unit': 'g', 'package_quantity': 200, 'package_cost': 3.37},
    {'name': 'Leche en polvo entera', 'brand': 'LA VAQUITA', 'unit': 'g', 'package_quantity': 500, 'package_cost': 3.96},
    {'name': 'Kinder bueno', 'brand': 'FERRERO', 'unit': 'unidades', 'package_quantity': 3, 'package_cost': 4.47},
    {'name': 'Nutella', 'brand': 'FERRERO', 'unit': 'g', 'package_quantity': 650, 'package_cost': 13.94},
    {'name': 'Leche semi descremada', 'brand': 'VITA', 'unit': 'ml', 'package_quantity': 1000, 'package_cost': 1.32},
    {'name': 'Crema De Pistacho Italiana Untable 45%', 'brand': 'SCYAVURU', 'unit': 'g', 'package_quantity': 200, 'package_cost': 8.95},
    {'name': 'Crema De Pistacho Italiana Untable 25%', 'brand': 'SCYAVURU', 'unit': 'g', 'package_quantity': 200, 'package_cost': 6.95},
    {'name': 'Maicena', 'brand': 'ROYAL', 'unit': 'g', 'package_quantity': 200, 'package_cost': 1.09},
    {'name': 'Esencia de vainilla', 'brand': 'DOÑA PETRA', 'unit': 'ml', 'package_quantity': 100, 'package_cost': 1.04},
    {'name': 'Aceite', 'brand': 'GIRASOL', 'unit': 'ml', 'package_quantity': 2000, 'package_cost': 5.55},
    {'name': 'Galletas oreo', 'brand': 'OREO', 'unit': 'g', 'package_quantity': 432, 'package_cost': 3.45},
    {'name': 'Chocolate', 'brand': 'HERSHEY''S', 'unit': 'g', 'package_quantity': 124, 'package_cost': 3.82},
    {'name': 'Galletas', 'brand': 'MARIA', 'unit': 'g', 'package_quantity': 145, 'package_cost': 0.69},
    {'name': 'Queso crema', 'brand': 'TONI', 'unit': 'g', 'package_quantity': 550, 'package_cost': 4.14},
    {'name': 'Azúcar impalpable', 'brand': 'LA REPOSTERIA', 'unit': 'g', 'package_quantity': 500, 'package_cost': 1.19},
    {'name': 'Dulce de leche', 'brand': 'ALPINA', 'unit': 'g', 'package_quantity': 250, 'package_cost': 2.17},
    {'name': 'Café', 'brand': 'NESCAFÉ', 'unit': 'g', 'package_quantity': 190, 'package_cost': 13.20},
]

async def seed():
    async with AsyncSessionLocal() as session:
        for data in ingredients_data:
            result = await session.execute(select(Ingredient).where(Ingredient.name == data['name']))
            existing = result.scalars().first()
            if existing:
                existing.package_cost = data['package_cost']
                existing.package_quantity = data['package_quantity']
                existing.unit = data['unit']
                existing.brand = data['brand']
                existing.last_price_update = datetime.now(timezone.utc)
            else:
                ing = Ingredient(**data)
                ing.last_price_update = datetime.now(timezone.utc)
                session.add(ing)
        await session.commit()
        print('Seed successful')

asyncio.run(seed())
