# SoftPlay Mobile ⚽🏀🎾

![SoftPlay Cover](https://via.placeholder.com/800x400.png?text=SoftPlay+Mobile+App) <!-- Reemplaza este enlace con el de una imagen real de tu app -->

## Descripción 📖
**SoftPlay Mobile** es una aplicación innovadora, construida con React Native y Expo Router, diseñada para conectar a los amantes del deporte con los mejores complejos deportivos de la ciudad. 

Con SoftPlay, los usuarios pueden:
- 📍 Explorar sedes deportivas cercanas a ellos.
- 🏟️ Ver en detalle los escenarios y canchas disponibles dentro de cada sede.
- 📆 (Próximamente) Agendar y gestionar sus reservaciones deportivas de forma sencilla.
- 🔐 Iniciar sesión de forma segura y validar el acceso gracias a la conexión con nuestra robusta API.

---

## Equipo / Integrantes 🤝
- **César Mora Correa** - *Desarrollo Mobile / Frontend*
- *(Actualmente tu eres el lead dev aquí, puedes agregar más integrantes según corresponda)*

---

## Vista Previa de la Aplicación 📱
Aquí puedes adjuntar capturas de pantalla de la app en funcionamiento.
*(Guarda tus capturas en la carpeta del repositorio y cambia la ruta correspondiente, por ejemplo `./assets/images/screenshot1.png`)*

<div style="display: flex; gap: 10px;">
  <img src="./assets/readme/login.jpg" width="200" alt="Login Screenshot" />
  <img src="./assets/readme/home.jpg" width="200" alt="Home Screenshot" />
  <img src="./assets/readme/sedes.jpg" width="200" alt="Sedes Screenshot" />
  <img src="./assets/readme/escenarios.jpg" width="200" alt="Escenarios Screenshot" />
</div>

---

## Stack Tecnológico 🛠️
- **Frontend / Mobile Structure**: React Native + Expo Router
- **Estilos de UI**: Vanilla React Native StyleSheet
- **Navegación**: [Expo Router (File-based routing)](https://docs.expo.dev/router/introduction)
- **State Management**: Redux Toolkit + React-Redux
- **API Requests**: Axios

---

## Instalación y Ejecución Local 🚀

1. **Clonar el repositorio y moverse a la carpeta**
   ```bash
   git clone https://github.com/tu-usuario/softplay-movile.git
   cd softplayMovile
   ```

2. **Instalar las dependencias**
   Asegúrate de tener Node.js instalado.
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   Usamos Expo CLI para empaquetar y ejecutar la app.
   ```bash
   npx expo start
   ```

   Una vez que el comando se ejecute:
   - Presiona **`a`** para abrir en un Emulador de **Android**.
   - Presiona **`i`** para abrir en un Simulador de **iOS** (Solo disponible en Mac).
   - O descarga la app de **Expo Go** en tu dispositivo físico y escanea el código QR de la terminal para usarlo desde tu teléfono.

---

## Contribución 💻
¡Si deseas colaborar, eres bienvenido a abrir un PR! Las modificaciones principales de la UI están estructuradas de forma que la carpeta `app/(tabs)` contenga las vistas protegidas del usuario principal.
