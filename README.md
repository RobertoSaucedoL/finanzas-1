# Portaware Intelligence Agent

Agente de Inteligencia Comercial desarrollado con React, TailwindCSS y Google Gemini API.

## Cómo correrlo localmente

1. Clona el repositorio.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz (o configura la variable en tu entorno):
   ```
   API_KEY=tu_api_key_de_gemini
   ```
4. Corre el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Cómo desplegar en GitHub Pages

1. Asegúrate de que tu repositorio está en GitHub.
2. Instala las dependencias si no lo has hecho.
3. Ejecuta el comando de despliegue:
   ```bash
   npm run deploy
   ```
   Esto creará una rama `gh-pages` y subirá la carpeta `dist` automáticamente.
