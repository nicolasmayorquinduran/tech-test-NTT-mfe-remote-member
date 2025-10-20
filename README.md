# Members MFE

Micro Frontend de Members que integra la API de Crossref para mostrar información de miembros y sus publicaciones.

## 🚀 Quick Start

### 1. Construir la librería shared (primera vez o después de cambios)
```bash
cd ../libs
pnpm build
```

### 2. Instalar dependencias
```bash
cd ../members
pnpm install
```

### 3. Iniciar el servidor de desarrollo
```bash
pnpm start
# o
ng serve
```

Una vez que el servidor esté corriendo, abre `http://localhost:4200/` en tu navegador. La aplicación se recargará automáticamente cuando modifiques los archivos fuente.

## 📋 Rutas Disponibles

- **Profile:** `http://localhost:4200/members/profile` - Información del member
- **Works:** `http://localhost:4200/members/works` - Lista de publicaciones del member

### Con query params:
- `http://localhost:4200/members/profile?memberId=98`
- `http://localhost:4200/members/works?memberId=311`

## 📚 Documentación

- **[README_ROUTING.md](./README_ROUTING.md)** - Guía completa de routing y desarrollo local
- **[CROSSREF_INTEGRATION.md](./CROSSREF_INTEGRATION.md)** - Documentación de la integración con Crossref API

## 🏗️ Estructura del Proyecto

```
src/app/
├── app.ts                          # Componente raíz
├── app.routes.ts                   # Rutas principales
├── app.config.ts                   # Configuración de la app
├── app.module.ts                   # Módulo principal (alternativo)
└── members/
    ├── members.module.ts           # Módulo de members
    ├── members-routing.module.ts   # Rutas del módulo
    ├── services/
    │   └── crossref.service.ts     # Servicio para API de Crossref
    └── pages/
        ├── profile/                # Página de perfil del member
        └── works/                  # Página de trabajos del member
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
