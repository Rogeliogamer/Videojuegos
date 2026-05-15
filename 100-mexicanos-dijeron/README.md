# 💯 100 Mexicanos Dijeron - Web Multiplayer Edition

## 📖 ¿Qué es esto?
Es una adaptación web interactiva y multijugador del clásico juego de concursos "100 Mexicanos Dijeron" (Family Feud). Este proyecto no es solo una interfaz visual, sino un sistema distribuido que sincroniza en tiempo real el tablero principal (controlado por el Host) con los dispositivos móviles o navegadores de los equipos participantes, replicando exactamente las reglas y la tensión del programa de televisión.

## ✨ ¿Qué hace?
* **Gestión de Salas:** Creación de partidas únicas mediante un código PIN de 4 dígitos, protegido contra colisiones y con limpieza automática de base de datos.
* **Sincronización en Tiempo Real:** Los jugadores ven en sus pantallas exactamente la fase en la que se encuentra el juego (Cara a Cara, Control, Robo o Resumen de ronda).
* **Validación Inteligente (NLP):** El sistema evalúa las respuestas de los jugadores tolerando errores ortográficos, falta de acentos y diferencias entre mayúsculas/minúsculas.
* **Gestor de Turnos Automático:** El sistema calcula matemáticamente a qué jugador le toca responder según el historial de la ronda, bloqueando intentos fuera de turno.
* **Marcador Dinámico:** Acumulación de puntos en el "banco" de la ronda y asignación automática al marcador global del equipo ganador al finalizar la fase o ejecutar un robo exitoso.

---

## 🚀 ¿Cómo lo ejecuto?

### Requisitos Previos
* Node.js (v16 o superior recomendado)
* Docker y Docker Compose (Para ejecutar la base de datos localmente)

### Pasos de Instalación
1. **Clonar e instalar dependencias:**
   ```bash
   git clone [https://github.com/Rogeliogamer/Videojuegos.git](https://github.com/Rogeliogamer/Videojuegos.git)
   cd 100-mexicanos-dijeron
   npm install
   ```

2. **Levantar la base de datos (DynamoDB local):** Asegúrate de tener Docker abierto y ejecuta:
   ```bash
   docker-compose up -d 
   ```

3. **Inicializar la Base de Datos:**
   Ejecuta los scripts para crear las tablas y cargar el banco de preguntas:
   ```bash
   node crearTabla.js
   node crearBanco.js
   ```

4. **Ejecutar el cliente de React:**
   ```bash
   npm run dev
   ```
*El juego estará disponible en `http://localhost:5173`.*

---

## 🏗️ Arquitectura y Estructura del Proyecto
El proyecto sigue una arquitectura **Serverless / Cliente-Base de Datos**, eliminando la necesidad de un backend tradicional (Node/Express). El frontend en React se comunica directamente con AWS DynamoDB.

### ¿Dónde están los datos?
Todos los datos viven en **DynamoDB**.
* **Banco de preguntas:** Almacenado en la tabla `Preguntas_100Mexicanos` y consultado al configurar la partida.
* **Estado en Tiempo Real:** La tabla `Partidas_100Mexicanos` actúa como única fuente de la verdad (*Single Source of Truth*). El Host escribe los cambios y los jugadores consultan mediante un radar (*Polling*) de 1 segundo.

### Estructura de Archivos Principal
```text
100-mexicanos-dijeron/
 ├── dynamo-data/
 │   └── shared-local-instance.db  # Persistencia de datos de Docker
 ├── public/                       # Assets estáticos
 ├── src/
 │   ├── App.jsx                   # Vistas principales (Host/Jugador) y Rutas
 │   ├── aws-config.js             # Configuración de credenciales locales
 │   ├── dynamo.js                 # Cliente DocumentClient de AWS SDK
 │   ├── main.jsx                  # Punto de entrada React
 │   └── preguntas.js              # Datos estáticos de respaldo
 ├── crearBanco.js                 # Script para inyectar preguntas a DynamoDB
 ├── crearTabla.js                 # Script para crear estructura de la partida
 ├── docker-compose.yml            # Orquestación de DynamoDB Local
 ├── index.html                    # Template base
 ├── package.json                  # Dependencias y scripts
 └── vite.config.js                # Configuración de Vite
```

---

## 🧠 Lógica Clave Detrás del Proyecto

### 1. Validación de Respuestas (NLP)
Para evitar que el juego sea demasiado estricto, implementamos una lógica de **Procesamiento de Lenguaje Natural** simplificada:
* **Normalización:** Se eliminan acentos mediante `.normalize("NFD")` y se ignoran mayúsculas.
* **Match Parcial:** Si el usuario escribe una respuesta contenida en la base de datos (ej. "CILANTRO" para la respuesta "CILANTRO Y CEBOLLA"), el sistema la valida como correcta siempre que cumpla con un mínimo de 3 caracteres para evitar falsos positivos.

### 2. Algoritmo de Turnos
El sistema garantiza que los jugadores respeten su orden de participación sin necesidad de un servidor centralizado:
* Utiliza el índice del jugador que participó en el **Cara a Cara** como punto de partida.
* Mediante el uso de **aritmética modular (`%`)** y el conteo de respuestas procesadas en el tablero, el sistema calcula automáticamente quién es el siguiente jugador habilitado, bloqueando el input a los demás miembros del equipo.

### 3. Gestión de Puntos y Ganador
* **Acumulado de Ronda:** Los puntos de las respuestas reveladas se suman en un "pozo" temporal durante la fase de Control.
* **Asignación (Commit):** Al ganar la ronda o realizar un robo exitoso, el pozo se suma al registro histórico de `puntajesGlobales` en DynamoDB.
* **Detección de Victoria:** Al finalizar la última ronda configurada, los clientes interceptan el estado `esFinDeJuego` y comparan los puntajes globales para renderizar la pantalla de Ganador, Perdedor o Empate.
