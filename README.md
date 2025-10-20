# Members (MFE)

Rol: Área privada (perfil y trabajos) para miembros autenticados.

Solución:
- Rutas privadas protegidas con `authGuard`.
- Consumo de Crossref para mostrar datos de miembro y estadísticas.
- Control flow `@if` y UI en español.

Ejecutar local:
- pnpm install
- pnpm start
- Requiere login previo (cookie HttpOnly desde API).
