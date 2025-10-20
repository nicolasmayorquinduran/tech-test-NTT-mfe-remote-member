# Members MFE - Routing y Desarrollo Local

Este MFE (Micro Frontend) puede funcionar de forma independiente para facilitar el desarrollo y testing sin necesidad del host.

## 📁 Estructura del Routing

```
members/
├── src/app/
│   ├── app.ts                        # Componente raíz (standalone)
│   ├── app.html                      # Template simple con <router-outlet />
│   ├── app.routes.ts                 # Rutas principales de la app
│   ├── app.module.ts                 # Módulo principal (opcional/alternativo)
│   └── members/
│       ├── members.module.ts         # Módulo de members
│       ├── members-routing.module.ts # Rutas del módulo members
│       ├── services/
│       │   └── crossref.service.ts   # Servicio para API de Crossref
│       └── pages/
│           ├── profile/
│           │   └── profile.component.ts
│           └── works/
│               └── works.component.ts
```

## 🚀 Rutas Configuradas

### Rutas Principales (app.routes.ts)
```
/ ───────────────→ redirige a /members
/members ────────→ carga MembersModule (lazy loading)
```

### Rutas del Módulo Members (members-routing.module.ts)
```
/members/profile ────→ ProfileComponent (información del member)
/members/works ──────→ WorksComponent (lista de trabajos)
/members ────────────→ redirige a /members/profile
```

## 🔧 Desarrollo Local

### 1. Construir la librería shared (requerido)
```bash
cd ../libs
pnpm build
```

### 2. Instalar dependencias en members
```bash
cd ../members
pnpm install
```

### 3. Iniciar el servidor de desarrollo
```bash
pnpm start
```

### 4. Navegar en el navegador

Accede a las siguientes rutas:

- **Raíz:** `http://localhost:4200/` → redirige a `/members/profile`
- **Profile:** `http://localhost:4200/members/profile`
- **Works:** `http://localhost:4200/members/works`

### Con memberId específico (query params):
- `http://localhost:4200/members/profile?memberId=98`
- `http://localhost:4200/members/works?memberId=311`

## 📝 Modos de Desarrollo

### Modo Standalone (Actual)
El app usa componentes standalone y lazy loading de módulos:

**Archivo:** `src/bootstrap.ts`
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig);
```

**Características:**
- ✅ Moderno y recomendado por Angular
- ✅ Lazy loading automático
- ✅ Más ligero
- ✅ Mejor tree-shaking

### Modo con NgModule (Opcional)
Si el equipo prefiere el enfoque tradicional de módulos, está disponible `app.module.ts`:

**Archivo:** `src/app/app.module.ts`
```typescript
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    App
  ],
  providers: [
    provideHttpClient(withFetch())
  ],
  bootstrap: [App]
})
export class AppModule { }
```

Para usar este módulo, necesitarías crear un `main.module.ts` alternativo.

## 🎯 Testing Local sin Host

El MFE está configurado para ser completamente funcional de forma independiente:

### ✅ Lo que ya funciona:
- ✅ Navegación entre Profile y Works
- ✅ Consumo de API de Crossref
- ✅ Estados de loading y error
- ✅ Query params para memberId
- ✅ HttpClient configurado
- ✅ Librería `shared` integrada

### 🔍 Para probar:

1. **Ver perfil del member por defecto (98 - Cambridge University Press):**
   ```
   http://localhost:4200/members/profile
   ```

2. **Ver trabajos del member:**
   ```
   http://localhost:4200/members/works
   ```

3. **Cambiar de member (por ejemplo, member 311 - Wiley):**
   ```
   http://localhost:4200/members/profile?memberId=311
   http://localhost:4200/members/works?memberId=311
   ```

4. **Navegar usando los botones en la UI:**
   - Profile → "View Works" → Works
   - Works → "Back to Profile" → Profile

## 🔗 Integración con Host

Cuando este MFE se integre con el host, las rutas serán:
```
http://host-app/member/members/profile
http://host-app/member/members/works
```

El prefijo `/member` será manejado por el host, y este MFE responderá a las subrutas `/members/*`.

## 🛠️ Modificar el Member ID por Defecto

Si quieres cambiar el member que se carga por defecto:

### En ProfileComponent:
```typescript
// src/app/members/pages/profile/profile.component.ts
memberId = signal<string>('TU_MEMBER_ID_AQUI');
```

### En WorksComponent:
```typescript
// src/app/members/pages/works/works.component.ts
memberId = signal<string>('TU_MEMBER_ID_AQUI');
```

### Ejemplos de Member IDs de Crossref:
- `98` - Cambridge University Press
- `311` - Wiley
- `78` - Elsevier
- `297` - Springer Nature
- `263` - Oxford University Press

## 📚 Recursos Adicionales

- **Integración de Crossref:** Ver `CROSSREF_INTEGRATION.md`
- **API de Crossref:** https://api.crossref.org/swagger-docs
- **Angular Routing:** https://angular.dev/guide/routing

## 🐛 Troubleshooting

### Error: "Cannot find module 'shared'"
```bash
# Reconstruir la librería shared
cd ../libs
pnpm build

# Reinstalar en members
cd ../members
pnpm install
```

### Error: HttpClient no está disponible
Verifica que `app.config.ts` tenga:
```typescript
provideHttpClient(withFetch())
```

### La navegación no funciona
Verifica que `app.html` tenga:
```html
<router-outlet />
```

### Cambios en la librería shared no se reflejan
```bash
# 1. Reconstruir shared
cd ../libs
pnpm build

# 2. En members, forzar reinstalación
cd ../members
rm -rf node_modules/shared
pnpm install

# 3. Reiniciar el servidor de desarrollo
```

## 💡 Tips para el Equipo

1. **Desarrollo independiente:** Cada desarrollador puede trabajar en este MFE sin necesidad del host completo

2. **Testing rápido:** Las pruebas se pueden hacer directamente en `http://localhost:4200`

3. **Compartir librería:** La librería `shared` se construye una vez y se comparte entre MFEs

4. **Lazy loading:** El MembersModule se carga solo cuando se navega a `/members`

5. **Separación de concerns:** Las páginas están en `pages/`, los servicios en `services/`, manteniendo una estructura clara
