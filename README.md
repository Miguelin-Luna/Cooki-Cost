# 🍪 CookiCost

> **Sistema inteligente de gestión de costos, escandallos y fijación de precios para repostería, pastelería y gastronomía.**

CookiCost es una solución integral diseñada para ayudar a reposteros, panaderos y emprendedores gastronómicos a calcular con precisión matemática el costo real de sus recetas, calcular mermas y gastos indirectos, proyectar ganancias y digitalizar recetas automáticamente mediante Inteligencia Artificial (Gemini Vision).

---

## 🚀 Características Principales

### 📊 1. Escandallo y Costeo Preciso de Recetas
* **Cálculo de costo por ingrediente:** Calcula automáticamente el costo exacto según la porción utilizada de cada paquete.
* **Margen de protección (merma):** Porcentaje configurable para cubrir imprevistos, desperdicios o pérdidas en cocina.
* **Costos indirectos (Overheads):** Configuración de gastos fijos o porcentuales (gas, electricidad, mano de obra, packaging).
* **Cálculo de costo unitario y rendimiento:** Conoce exactamente cuánto cuesta producir cada unidad/porción.
* **Sugerencia de precio de venta:** Calcula el precio de venta recomendado en base a tu margen de ganancia deseado.

### 🤖 2. Digitalización de Recetas con IA (Gemini Vision)
* **Importación por foto:** Sube una foto de tu cuaderno de recetas, libro o captura de pantalla.
* **Extracción automática:** Utiliza **Google Gemini Vision** para reconocer ingredientes, cantidades y unidades.
* **Conversión de fracciones:** Transforma automáticamente fracciones de cocina (`½ taza`, `¼ cdta`) a valores decimales listos para costear.

### ⚖️ 3. Conversión Inteligente de Unidades
* Motor de conversión integrado para unidades de peso, volumen y unidades (`kg`, `g`, `lb`, `oz`, `l`, `ml`, `tazas`, `cda`, `cdta`).
* Soporte para **conversiones personalizadas por ingrediente** (ejemplo: *1 taza de harina = 120 g*, *1 taza de azúcar = 200 g*).
* Búsqueda difusa (*Fuzzy Matching*) para emparejar ingredientes reconociendo sinónimos y variaciones de nombres.

### 💰 4. Actualizador Rápido de Precios
* Actualiza los costos de insumos cuando suben los precios en el mercado sin tener que editar receta por receta.
* El sistema recalcula automáticamente los costos de todas las recetas asociadas.

### 📈 5. Simulador de Ventas y Rentabilidad
* Simula escenarios de venta por volumen (ej. vender 50, 100 o 500 unidades).
* Visualiza ingresos proyectados, costos totales y beneficio neto estimado.

---

## 🛠️ Stack Tecnológico

### Backend
* **FastAPI** – Framework moderno, asíncrono y de alto rendimiento en Python.
* **SQLAlchemy & aiosqlite** – ORM asíncrono con base de datos SQLite.
* **Google GenAI SDK** – Integración con modelos multimodales de Google Gemini.
* **Pydantic v2** – Validación estricta y serialización de esquemas.
* **TheFuzz** – Algoritmos de coincidencia de texto y similitud fonética/ortográfica.

### Frontend
* **React 19** – Biblioteca de interfaz de usuario reactiva y moderna.
* **Vite** – Entorno de desarrollo y empaquetador ultrarrápido.
* **Tailwind CSS v4** – Estilos utilitarios y diseño responsivo moderno.
* **Lucide React** – Iconografía limpia y coherente.
* **React Router v7** – Navegación SPA fluida.

---

## 📁 Estructura del Proyecto

```text
Cooki-Cost/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Endpoints REST (ingredientes, recetas, overheads)
│   │   ├── core/           # Configuración y conexión a base de datos
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negocio (costeo, Gemini Vision)
│   ├── .env.example        # Plantilla de variables de entorno
│   ├── requirements.txt    # Dependencias de Python
│   └── main.py             # Punto de entrada de la aplicación
├── frontend/
│   ├── src/
│   │   ├── api/            # Cliente de conexión HTTP hacia el backend
│   │   ├── components/     # Componentes reutilizables (formularios, simulador, etc.)
│   │   ├── pages/          # Vistas (Dashboard, Recetas, Ingredientes, Precios)
│   │   └── App.jsx         # Configuración de rutas
│   ├── package.json        # Dependencias de Node.js
│   └── vite.config.js      # Configuración de Vite
├── .gitignore              # Archivos y carpetas excluidos de Git
└── README.md
```

---

## ⚙️ Instalación y Puesta en Marcha

### Prerrequisitos
* **Python 3.10+**
* **Node.js 18+** y npm
* (Opcional) Una API Key de **Google Gemini** ([Google AI Studio](https://aistudio.google.com/)) para la funcionalidad de escaneo de recetas con IA.

---

### 1. Configuración del Backend

1. Entra a la carpeta `backend`:
   ```bash
   cd backend
   ```

2. Crea y activa un entorno virtual:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configura las variables de entorno:
   Crea un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` y agrega tu clave de Gemini si deseas usar el escaneo por foto:
   ```env
   GEMINI_API_KEY="tu_clave_de_gemini_aqui"
   DATABASE_URL="sqlite+aiosqlite:///./cookicost.db"
   ```

5. Inicia el servidor:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   > La documentación interactiva de la API estará disponible en [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 2. Configuración del Frontend

1. Abre una nueva terminal y entra a la carpeta `frontend`:
   ```bash
   cd frontend
   ```

2. Instala los paquetes:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre la aplicación en tu navegador en [http://localhost:5173](http://localhost:5173).

---

## 🔒 Seguridad y Buenas Prácticas

* **No expongas credenciales:** El archivo `.env` está ignorado en `.gitignore` para prevenir fugas accidentales de API Keys.
* **Migraciones y Base de Datos:** Se incluye soporte para SQLite local listo para desarrollo, extensible a PostgreSQL en producción vía `DATABASE_URL`.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo de licencia para más detalles.