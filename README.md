# Carta3D-AR · Casa Oliva

Carta digital interactiva con QR por mesa, modelos de platos en 3D y vista de realidad aumentada compatible con dispositivos móviles.

## Demo pública

**Sitio de GitHub Pages:** https://aldo200908-lgtm.github.io/Carta3D-AR/

Esta página es un prototipo, no un sistema de pedidos real.

## Organización

- `docs/index.html`: página inicial de la carta
- `docs/styles.css`: estilos adaptables
- `docs/app.js`: navegación, filtros, platos, QR y selección
- `docs/assets/models/*.glb`: seis modelos 3D originales
- `docs/generate_models.py`: genera los modelos GLB con Python y trimesh
- `docs/.nojekyll`: sirve directamente los archivos estáticos

**GitHub Pages debe publicar la rama `main` desde la carpeta `/docs`.**

## Uso

Entra a la carta y selecciona un plato para girarlo en 3D. En un teléfono compatible, pulsa **«Ver en mi mesa»** para abrir el visor AR. El código QR incorpora el número de mesa, por ejemplo `?mesa=7`.

Para desarrollarlo localmente, abre una terminal en `docs/` y ejecuta:

```sh
python -m http.server 8080
```

Para cámara y AR usa HTTPS y un navegador/dispositivo compatibles.

## Notas

- Los platos y precios son ficticios y se editan en `docs/app.js`.
- Los modelos son ilustraciones 3D estilizadas, no escaneos reales de alimentos.
- Las fotos, fuentes y librerías se sirven desde terceros y requieren Internet.
- No cuenta con pago, registro, inventario ni envío de órdenes a cocina.
