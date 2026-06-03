# 📖 MANUAL DE USUARIO: SOFTPLAY MOBILE ⚽🏀🎾
## *Tu plataforma deportiva en la palma de tu mano*

¡Bienvenido al **Manual de Usuario de SoftPlay Mobile**! Esta guía te proporcionará todas las instrucciones necesarias para utilizar la aplicación de manera óptima y ágil. Aprenderás a registrarte, buscar complejos deportivos, consultar escenarios y reservar tu cancha favorita en tiempo real con total seguridad.

---

## 🔍 ÍNDICE
1. **Introducción y Compatibilidad**
2. **Registro de Usuarios y Seguridad (Anti-Bot)**
3. **Inicio de Sesión y Pantalla Principal (Dashboard)**
4. **Exploración de Complejos Deportivos (Sedes)**
5. **Detalle de Escenarios por Sede**
6. **Flujo de Reserva Multipaso (Paso a Paso)**
   - *Paso 1: Configuración (Duración, Fecha y Hora)*
   - *Paso 2: Bloqueo Temporal y Revisión*
   - *Paso 3: Confirmación y Ticket Digital*
7. **Gestión de Reservas ("Mis Reservas")**
   - *Diseño Boleto / Ticket de Reserva*
   - *Estados de la Reserva y Colores Semánticos*
   - *Cancelación de Reservas*
8. **Resolución de Problemas Comunes**

---

### 1. INTRODUCCIÓN Y COMPATIBILIDAD
**SoftPlay Mobile** es la aplicación móvil oficial diseñada para deportistas y aficionados que buscan simplificar la gestión de sus partidos y reservas. La aplicación se conecta de forma segura a una API alojada en la nube y ofrece una experiencia fluida, rápida y premium.

* **Soporte de Plataformas**: Disponible para dispositivos **Android** e **iOS** a través de la aplicación **Expo Go** o mediante compilación directa nativa.
* **Diseño Adaptativo (Dark & Light Mode)**: La aplicación cuenta con una paleta de colores dinámicos optimizada tanto para temas claros como oscuros, garantizando legibilidad y confort visual en todo momento.

---

### 2. REGISTRO DE USUARIOS Y SEGURIDAD (ANTI-BOT)
Para utilizar las funciones de reserva, debes contar con una cuenta activa. El proceso de registro cuenta con estrictos estándares de seguridad.

#### Campos Requeridos:
1. **Nombre Completo**: Tu nombre y apellido para el registro en cancha.
2. **Correo Electrónico**: Dirección de email con formato válido (ej. `usuario@gmail.com`).
3. **Teléfono**: Número telefónico de contacto (ej. `3001234567`).
4. **Contraseña**: Debe contar con **al menos 6 caracteres** para garantizar la seguridad de tu cuenta.

#### 🛡️ Verificación de Seguridad (CAPTCHA SVG):
Para evitar que registros automatizados (bots) saturen el sistema, SoftPlay Mobile integra un sistema de **Captcha animado en formato SVG** generado en tiempo real por el servidor.
* **Cómo usarlo**: Observa los caracteres que se muestran en el cuadro gris y escríbelos en el campo de texto inferior.
* **Validación**: La app valida tus caracteres automáticamente tras un breve retardo de 300 ms. Si son correctos, el botón se habilitará.
* **Refrescar Captcha**: Si la imagen no es lo suficientemente clara, toca el botón de refrescar (icono de flecha circular 🔄) para generar un nuevo código al instante.

---

### 3. INICIO DE SESIÓN Y PANTALLA PRINCIPAL (DASHBOARD)
Una vez registrado, ingresa utilizando tu correo electrónico y contraseña.

#### Características de la Pantalla de Inicio (Home):
* **Estadísticas en Tiempo Real**: Visualiza cuántos deportistas están activos y cuántas sedes están disponibles en la plataforma.
* **Accesos Directos Premium**:
  * **Explorar Canchas**: Te redirige instantáneamente al listado de sedes deportivas.
  * **Mis Reservas**: Te lleva al historial de tus tiquetes deportivos.
* **Cierre de Sesión Seguro**: En la esquina superior derecha del encabezado, encontrarás el botón **Cerrar Sesión**. Tócalo para limpiar de forma segura tus datos y token JWT del almacenamiento del dispositivo.

---

### 4. EXPLORACIÓN DE COMPLEJOS DEPORTIVOS (SEDES)
La pestaña **Sedes** (ubicada en la barra de navegación inferior) es la pantalla principal para encontrar los complejos deportivos disponibles en la plataforma.

#### Búsqueda de Complejos:
* **Buscador Inteligente**: Cuenta con un campo de texto interactivo en la parte superior. Escribe parte del nombre o de la ubicación del complejo y la lista se filtrará automáticamente en tiempo real para mostrarte solo los resultados coincidentes.
* **Lista de Sedes**: Se muestra una lista de tarjetas informativas donde cada una contiene:
  * Imagen representativa del complejo deportivo.
  * Nombre y dirección exacta con indicación del barrio.
  * Etiqueta redondeada con la cantidad de escenarios/canchas con las que cuenta la sede.
  * Botón de acción **"Reservar aquí"** o acceso directo tocando cualquier parte de la tarjeta para ingresar a sus escenarios.

---

### 5. DETALLE DE ESCENARIOS POR SEDE
Al seleccionar una sede, entrarás a la pantalla de **Escenarios**, donde podrás conocer las canchas disponibles en ese complejo deportivo.

#### Elementos Clave:
* **Filtro de Deportes por Botón**: Desliza horizontalmente la barra superior para elegir el deporte que deseas jugar (⚽ *Fútbol*, 🎾 *Tenis*, 🎾 *Pádel*, 🏀 *Básquet*, 🏐 *Vóley*).
* **Filtrado Dinámico**: Al seleccionar un deporte, se mostrarán únicamente las canchas asociadas a él, evitando confusiones.
* **Tarjetas de Escenarios**: Cada cancha muestra su nombre, tipo de superficie (Sintética, Cemento, etc.), precio por hora formateado y una foto de portada de alta calidad.
* **Indicador de Paso Actual**: Un banner visual te recuerda que estás en el **Paso 1: Selección de Cancha**.

---

### 6. FLUJO DE RESERVA MULTIPASO
El flujo de reservas está diseñado con un sistema multipaso estructurado para garantizar transacciones libres de errores y evitar que dos usuarios reserven el mismo horario simultáneamente.

#### ⏱️ Paso 1: Configuración (Duración, Fecha y Hora)
1. **Duración**: Selecciona cuántas horas deseas jugar (disponible en slots de `1h`, `1.5h`, `2h`, `3h` o `4h`). El precio total y los horarios se ajustarán dinámicamente según esta selección.
2. **Fecha**: Utiliza el calendario interactivo (`CustomCalendar`).
   * Puedes usar accesos rápidos superiores: **"Hoy"**, **"Mañana"**, **"En 3 días"** o **"En 7 días"**.
   * O explorar el calendario mensual usando los botones de navegación izquierda/derecha.
   * *Nota*: Los días pasados están deshabilitados.
3. **Hora de Inicio (Slots Dinámicos)**:
   * La app genera los horarios de manera inteligente basándose en la configuración de la sede (hora de apertura, cierre, descansos intermedios y reservas existentes).
   * **Estados de los Slots**:
     * **Gris / Deshabilitado**: Horario ya reservado ("Ocupado") o que ya ha pasado en el tiempo actual.
     * **Blanco**: Horario disponible para reserva.
     * **Azul**: Horario seleccionado.

#### 🔒 Paso 2: Bloqueo Temporal y Revisión
Al tocar un horario disponible, ocurre un **Bloqueo Temporal en Tiempo Real**:
* El sistema reserva temporalmente ese slot para ti en la base de datos durante tu proceso de revisión. **Nadie más podrá tomarlo en ese momento.**
* **Resumen Completo**: Visualizarás un tiquete detallado con el nombre de la cancha, la fecha larga, la hora de inicio y fin, la duración y el **Total a pagar**.
* *Liberación Automática*: Si abandonas la pantalla o regresas al listado sin completar la reserva, el sistema liberará automáticamente el bloqueo para que esté disponible para otros usuarios, optimizando el uso de la plataforma.

#### 🎉 Paso 3: Confirmación y Ticket Digital
* Presiona **Confirmar** para consolidar tu reserva.
* El sistema creará un registro permanente en estado **Pendiente de Pago**.
* Se te presentará la pantalla de éxito con un ticket digital detallado. Puedes tocar **Ver Mis Reservas** para ir a tu historial, o **Buscar otra cancha** para continuar explorando.

---

### 7. GESTIÓN DE RESERVAS ("MIS RESERVAS")
En la pestaña **Reservas** (barra inferior) puedes gestionar todo tu historial deportivo en una sola interfaz premium inspirada en tiquetes reales.

#### 🎨 Diseño Boleto / Ticket de Reserva:
Las tarjetas de reservas emulan tiquetes físicos con un corte semicircular en los bordes y una línea divisoria punteada. Cuentan con colores dinámicos semánticos en el borde superior y etiquetas para saber el estado actual de tu reserva de un solo vistazo:

| Estado | Significado | Color del Ticket |
| :--- | :--- | :--- |
| **PENDIENTE** | Reserva registrada con éxito. Debes pagar el valor al llegar a la cancha. | **Naranja** 🟠 |
| **CONFIRMADA / PAGADA** | Pago verificado. Tu cancha está lista para el partido. | **Verde** 🟢 |
| **COMPLETADA** | El evento ya ocurrió con éxito. | **Azul** 🔵 |
| **CANCELADA** | La reserva fue anulada. | **Rojo** 🔴 |

#### Gesto de Actualización (Pull-to-Refresh):
* Desliza el dedo de arriba hacia abajo en la pantalla o presiona el botón de recarga (icono 🔄 en la parte superior derecha) para sincronizar al instante tus reservas contra el servidor en la nube.

#### ❌ Cancelación de Reservas:
* Si tu reserva está en estado **PENDIENTE**, verás un botón con la opción **Cancelar**.
* Al tocarlo, aparecerá un **cuadro de diálogo modal seguro** que te mostrará los detalles específicos de la reserva (cancha, fecha, hora y precio) y te pedirá confirmar la anulación.
* Si confirmas, el espacio se liberará en el servidor y tu reserva cambiará a estado **CANCELADA** automáticamente.

---

### 8. RESOLUCIÓN DE PROBLEMAS COMUNES

#### El botón "Iniciar Sesión" o "Registrarse" está deshabilitado:
* Asegúrate de rellenar todos los campos obligatorios sin cometer errores de formato (por ejemplo, el correo debe incluir `@` y un dominio válido).
* Verifica que hayas escrito correctamente el **Captcha** de verificación. Si el código ingresado coincide con la imagen, la app habilitará el botón tras medio segundo.

#### No aparecen horarios (slots) disponibles para una fecha seleccionada:
* Es posible que el complejo deportivo esté cerrado ese día de la semana (por ejemplo, algunos campos descansan los lunes). Aparecerá un mensaje: `"Cerrado este día"`.
* También puede deberse a que todos los horarios del día ya fueron reservados por otros deportistas o que la hora seleccionada ya es pasada en el tiempo de hoy.

#### Error: "Este horario fue tomado. Selecciona otro":
* Ocurre si otro deportista seleccionó exactamente el mismo slot de tiempo fracciones de segundo antes que tú y generó el bloqueo temporal. Por favor, selecciona el slot adyacente o ajusta la fecha.

---

<div align="center">
  <sub>SoftPlay Mobile v1.0.0 · © 2026 Ecosistema SoftPlay. Todos los derechos reservados.</sub>
</div>
