# CASA OLIVA · Carta digital 3D + AR

Demo web **estática**, responsive y sin backend, de una carta para restaurante con QR por mesa, seis platos ilustrativos en 3D y vista AR cuando el dispositivo es compatible.

## Incluye

- Carta en español, adaptable a celulares y computadoras.
- 6 modelos `.glb` **originales generados para este prototipo**, cada uno con proporciones en metros: burger, pizza, pasta, sushi, carne y torta. Son representaciones estilizadas, **no fotogrametrías ni réplicas exactas del plato real**.
- Detalles, búsqueda y filtros; visor con giro y zoom.
- Botón **«Ver en mi mesa»** con `<model-viewer>` (`webxr`, `scene-viewer`, `quick-look`).
- QR de cada mesa (`?mesa=7`), descarga PNG y lector QR integrado opcional; también puede usarse la cámara nativa del teléfono para abrir la página.
- Selección de platos que persiste localmente y se puede copiar. **No hay envío real de pedidos, pagos ni conexión con cocina o WhatsApp.**

## Cómo verlo

Para una previsualización local:

```bash
python -m http.server 8080
```

Abre `http://localhost:8080/` desde tu computadora. Para utilizar **cámara y AR desde el móvil**, publícalo en una URL **HTTPS**. Puedes arrastrar esta carpeta a un proyecto de Vercel o subirla a GitHub y activar GitHub Pages. El QR se generará automáticamente con el dominio real una vez publicado.

## Personalizar

Los platos y precios se encuentran en la constante `dishes` de `app.js`. Cambia el nombre del restaurante en `index.html`, fuentes y tonos en `styles.css`. Reemplaza los modelos `.glb` por modelos reales de cada preparación (idealmente capturados por fotogrametría o modelados desde fotos) para mostrar platos verdaderamente fieles. Los modelos 3D deben usar **metros** como escala y estar ubicados sobre el suelo/origen para AR. Prueba en dispositivos físicos.

Las fotografías del ejemplo se solicitan en vivo a **Unsplash**; requieren conexión a Internet. Las tipografías, `<model-viewer>`, el generador QR y el escáner QR también se cargan mediante servicios CDN.

## Tecnologías y límites

- HTML5/CSS/JavaScript sin build.
- `@google/model-viewer` 4.4.0: visualización GLB. En Android, ARCore / servicios de RA y Chrome o visor compatible; en iOS, Safari / Quick Look (se genera USDZ desde GLB cuando es posible).
- `QRCode.js` para generar QR; `html5-qrcode` para el escáner opcional.
- **AR no está disponible en todos los teléfonos**. En los demás, el 3D sigue estando visible en el navegador.
- Este prototipo **no tiene panel administrador**, stock, pedidos en tiempo real, cuenta de cliente, pasarela de pago ni reservas. Añadirlos requiere backend y administración de contenidos.

## Créditos

Modelos originales generados por `generate_models.py` (trimesh). Fotografías de demostración servidas desde Unsplash. El producto es una demo ficticia; Casa Oliva no representa un restaurante verificado.
