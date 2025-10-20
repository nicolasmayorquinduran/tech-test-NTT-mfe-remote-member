# Crossref API Integration

Esta documentación explica cómo se integró la API de Crossref en el módulo `members`.

## 📦 Estructura

```
members/
├── src/app/members/
│   ├── services/
│   │   ├── crossref.service.ts    # Servicio para consumir la API de Crossref
│   │   └── index.ts
│   └── pages/
│       ├── profile/
│       │   └── profile.component.ts   # Muestra información del member
│       └── works/
│           └── works.component.ts     # Lista los trabajos del member
```

## 🔧 Configuración

### 1. Tipos generados en la librería `shared`

Los tipos de datos de la API de Crossref están en:
```
libs/projects/shared/src/lib/code-gen/crossref-api/
```

Generados con:
```bash
cd libs/projects/shared
pnpm crossref-api-types
```

### 2. Importar desde `shared`

En `tsconfig.json` se configuró el path para importar la librería:
```json
{
  "paths": {
    "shared": ["../libs/projects/shared/src/public-api.ts"]
  }
}
```

### 3. HttpClient configurado

En `app.config.ts` se agregó:
```typescript
provideHttpClient(withFetch())
```

## 🚀 Uso del servicio

### Servicio: `CrossrefService`

#### Métodos principales

**1. Obtener información de un member**
```typescript
getMember(memberId: string): Observable<Member>
```

**2. Obtener trabajos de un member**
```typescript
getMemberWorks(memberId: string, params?: WorksQueryParams): Observable<WorksMessage>
```

**3. Obtener todos los trabajos (paginación automática)**
```typescript
getAllMemberWorks(memberId: string, maxWorks?: number): Observable<Work[]>
```

#### Métodos de utilidad

```typescript
formatDate(dateParts?: { 'date-parts'?: number[][] }): string
getWorkTitle(work: Work): string
getWorkAuthors(work: Work): string
```

### Ejemplo de uso en componente

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CrossrefService } from '../../services/crossref.service';
import type { Work } from 'shared';

export class MyComponent implements OnInit {
  crossrefService = inject(CrossrefService);
  works: Work[] = [];

  ngOnInit() {
    this.crossrefService.getMemberWorks('98', {
      rows: 50,
      sort: 'published',
      order: 'desc'
    }).subscribe({
      next: (response) => {
        this.works = response.message.items;
      },
      error: (err) => console.error(err)
    });
  }
}
```

## 📊 Endpoints disponibles

### Profile Component
**Endpoint:** `GET /members/{id}`

Muestra:
- Member ID
- Nombre principal
- Ubicación
- Total de DOIs
- DOIs actuales
- Número de prefijos

### Works Component
**Endpoint:** `GET /members/{id}/works`

Parámetros usados:
- `rows=50` - Número de resultados
- `sort=published` - Ordenar por fecha de publicación
- `order=desc` - Orden descendente
- `select=DOI,title,author,type,published,container-title,URL` - Campos específicos
- `mailto=your-email@example.com` - Email para "polite pool"

Muestra para cada trabajo:
- Título
- Autores
- Tipo de publicación
- Nombre de la revista/publicación
- Fecha de publicación
- Enlace al DOI

## 🎨 Parámetros de consulta disponibles

### Paginación
- `rows` - Número de resultados (max: 1000)
- `offset` - Desplazamiento (max: 10,000 con offset+rows)
- `cursor` - Para paginación profunda

### Filtros
```typescript
filter: string
// Ejemplos:
// 'type:journal-article'
// 'from-pub-date:2020-01-01'
// 'has-abstract:1'
```

### Búsquedas
```typescript
query: string
// Búsqueda de texto libre
```

### Ordenamiento
- `sort` - Campo de ordenamiento (published, issued, created, etc.)
- `order` - 'asc' o 'desc'

### Selección de campos
```typescript
select: string
// Ejemplo: 'DOI,title,author,published'
```

## 🔄 Estados del servicio

El servicio expone signals para el estado:

```typescript
crossrefService.loading()  // boolean - indica si está cargando
crossrefService.error()    // string | null - mensaje de error si hay
```

Uso en templates:
```html
@if (crossrefService.loading()) {
  <div>Loading...</div>
} @else if (crossrefService.error()) {
  <div>Error: {{ crossrefService.error() }}</div>
}
```

## 📝 Tipos principales

### Work
```typescript
{
  DOI: string;
  title?: string[];
  author?: Author[];
  type: string;
  publisher: string;
  published?: DateParts;
  'container-title'?: string[];
  URL: string;
  // ... más campos
}
```

### Member
```typescript
{
  id: number;
  'primary-name': string;
  location?: string;
  counts: {
    'total-dois': number;
    'current-dois': number;
    'backfile-dois': number;
  };
  prefixes: string[];
  // ... más campos
}
```

## ⚡ Rate Limits

- **Polite pool** (con mailto): 50 req/s, 5 concurrentes
- **Public pool**: 50 req/s, 5 concurrentes

## 🔗 Navegación

Los componentes están conectados:
- Profile → Works (con queryParams para pasar el memberId)
- Works → Profile (botón de regreso)

```typescript
// En profile.component.ts
[routerLink]="['/member/members/works']" 
[queryParams]="{memberId: memberId()}"

// En works.component.ts lee el parámetro
const memberIdParam = this.route.snapshot.queryParamMap.get('memberId');
```

## 📚 Recursos

- [Crossref REST API Docs](https://api.crossref.org/swagger-docs)
- [Crossref API Tips](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/)
- [OpenAPI TypeScript Codegen](https://github.com/ferdikoomen/openapi-typescript-codegen)

## 🛠️ Mantenimiento

### Regenerar tipos
Si la API de Crossref cambia:
```bash
cd libs/projects/shared
pnpm crossref-api-types
```

### Cambiar el email del "polite pool"
Editar en `crossref.service.ts`:
```typescript
private readonly defaultMailto = 'your-actual-email@example.com';
```

### Cambiar el member por defecto
Editar en los componentes:
```typescript
memberId = signal<string>('98'); // Cambiar el ID aquí
```

## 🐛 Debugging

Si hay errores de CORS, la API de Crossref permite peticiones cross-origin.
Si hay errores 429 (rate limit), esperar y reducir la frecuencia de peticiones.
Si hay errores de tipos, verificar que `shared` esté correctamente configurado en `tsconfig.json`.
