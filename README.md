# Sistema de Inventarios USBBOG

Sistema de gestión de inventarios empresarial desarrollado con Next.js 14, TypeScript y Tailwind CSS. La aplicación se conecta a una API FastAPI para la gestión de activos de inventario con funcionalidades de autenticación, dashboard, reportes y gestión completa de inventarios.

## 🚀 Características Principales

- **Dashboard Interactivo**: Visualización de estadísticas, gráficos y métricas del inventario
- **Gestión de Inventario**: CRUD completo para activos con paginación y búsqueda
- **Sistema de Autenticación**: Login seguro con tokens JWT
- **Reportes Avanzados**: Generación de reportes básicos y asistente IA
- **Interfaz Responsiva**: Diseño moderno y adaptable a diferentes dispositivos
- **Tema Oscuro/Claro**: Soporte para cambio de tema dinámico
- **API Integration**: Conexión robusta con API FastAPI externa

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconografía
- **Recharts** - Gráficos y visualizaciones
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend Integration
- **FastAPI** - API REST externa
- **CORS** - Configuración de políticas de origen cruzado

## 📁 Estructura del Proyecto

```
inventarioUSB/
├── app/                          # App Router de Next.js
│   ├── dashboard/               # Página principal del dashboard
│   ├── inventory/               # Gestión de inventario
│   ├── reports/                 # Reportes y análisis
│   ├── debug/                   # Página de debug
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página de login
├── api/                         # Cliente API
│   ├── config.ts                # Configuración de la API
│   ├── types/                   # Tipos TypeScript
│   ├── get-inventario.ts        # Operaciones GET
│   ├── create-inventario.ts     # Operaciones CREATE
│   ├── update-inventario.ts     # Operaciones UPDATE
│   ├── delete-inventario.ts     # Operaciones DELETE
│   └── test-api.ts              # Pruebas de conectividad
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── auth-guard.tsx           # Protección de rutas
│   ├── login-form.tsx           # Formulario de login
│   ├── layout/                  # Componentes de layout
│   ├── dashboard/               # Componentes del dashboard
│   ├── inventory/               # Componentes de inventario
│   └── reports/                 # Componentes de reportes
├── lib/                         # Utilidades y lógica de negocio
│   ├── auth.ts                  # Sistema de autenticación
│   ├── inventory-data.ts        # Datos mock y utilidades
│   ├── api-mapping.ts           # Mapeo entre API y UI
│   └── utils.ts                 # Utilidades generales
├── hooks/                       # Custom hooks
└── public/                      # Archivos estáticos
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm, yarn o pnpm
- Acceso a la API FastAPI (https://inventoryapp.usbtopia.usbbog.edu.co)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd inventarioUSB
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Configurar variables de entorno**
Crear archivo `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://inventoryapp.usbtopia.usbbog.edu.co
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🔐 Sistema de Autenticación

### Credenciales Actuales
- **Usuario**: `USBBOG`
- **Contraseña**: `usb123#`

### Implementación
El sistema utiliza autenticación basada en tokens almacenados en localStorage:

```typescript
// lib/auth.ts
export const AUTH_CREDENTIALS = {
  username: "USBBOG",
  password: "usb123#",
}
```

### Protección de Rutas
Todas las páginas protegidas utilizan el componente `AuthGuard`:

```typescript
<AuthGuard>
  <AppLayout>
    {/* Contenido protegido */}
  </AppLayout>
</AuthGuard>
```

## 📊 Estructura de Datos

### Modelo de Inventario (API)
```typescript
interface InventarioActivoOut {
  id: number;
  NOMBRE_DEL_ACTIVO?: string;
  DESCRIPCION?: string;
  TIPO_DE_ACTIVO?: string;
  MEDIO_DE_CONSERVACIÓN?: string;
  FORMATO?: string;
  IDIOMA?: string;
  PROCESO?: string;
  DUEÑO_DE_ACTIVO?: string;  // Campo clave para filtrado por roles
  TIPO_DE_DATOS_PERSONALES?: string;
  FINALIDAD_DE_LA_RECOLECCIÓN?: string;
  CONFIDENCIALIDAD?: string;
  INTEGRIDAD?: string;
  DISPONIBILIDAD?: string;
  CRITICIDAD_TOTAL_DEL_ACTIVO?: string;
  INFORMACIÓN_PUBLICADA_O_DISPONIBLE?: string;
  LUGAR_DE_CONSULTA?: string;
}
```

### Modelo de Inventario (UI)
```typescript
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  supplier: string;  // Mapeado desde DUEÑO_DE_ACTIVO
  lastUpdated: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}
```

## 🔄 Mapeo de Datos

El sistema incluye un mapeo automático entre la API y la interfaz de usuario:

```typescript
// lib/api-mapping.ts
export function mapApiActivoToInventoryItem(activo: InventarioActivoOut): InventoryItem {
  return {
    id: activo.id.toString(),
    name: activo.NOMBRE_DEL_ACTIVO || "Sin nombre",
    category: activo.TIPO_DE_ACTIVO || "Sin categoría",
    quantity: getQuantityFromCriticidad(activo.CRITICIDAD_TOTAL_DEL_ACTIVO),
    supplier: activo.DUEÑO_DE_ACTIVO || "Sin proveedor", // Campo clave
    status: getStatus(activo.DISPONIBILIDAD),
    // ... otros campos
  };
}
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint
```

## 🌐 API Endpoints

### Configuración Base
- **URL Base**: `https://inventoryapp.usbtopia.usbbog.edu.co`
- **Endpoint Principal**: `/inventario`

### Endpoints Disponibles
- `GET /inventario` - Obtener lista de activos
- `GET /inventario/{id}` - Obtener activo específico
- `POST /inventario` - Crear nuevo activo
- `PUT /inventario/{id}` - Actualizar activo completo
- `PATCH /inventario/{id}` - Actualizar activo parcial
- `DELETE /inventario/{id}` - Eliminar activo

### Parámetros de Consulta
- `skip`: Número de registros a omitir (paginación)
- `limit`: Número máximo de registros a retornar

## 🎨 Componentes Principales

### Dashboard
- **StatsCards**: Tarjetas con métricas principales
- **InventoryChart**: Gráfico de movimiento de inventario
- **CategoryChart**: Distribución por categorías
- **TopItemsTable**: Tabla de productos principales

### Inventario
- **InventoryTable**: Tabla principal con paginación y búsqueda
- **InventoryForm**: Formulario para crear/editar productos
- **DeleteConfirmation**: Modal de confirmación para eliminación

### Reportes
- **BasicReports**: Reportes básicos del sistema
- **AIChatModal**: Asistente de IA para consultas avanzadas

## 🔧 Configuración Avanzada

### Personalización de Tema
El sistema soporta temas claro y oscuro con persistencia en localStorage:

```typescript
// components/theme-provider.tsx
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem={true}
  storageKey="usbbog-theme"
>
```

### Configuración de API
```typescript
// api/config.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventoryapp.usbtopia.usbbog.edu.co",
  ENDPOINTS: {
    INVENTARIO: "/inventario",
  },
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
}
```

## 🐛 Debugging

### Página de Debug
Accede a `/debug` para:
- Probar conectividad con la API
- Verificar respuestas de endpoints
- Diagnosticar problemas de configuración

### Logs de Consola
El sistema incluye logging detallado para:
- Peticiones a la API
- Mapeo de datos
- Errores de validación
- Estados de carga

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Experiencia completa con sidebar
- **Tablet**: Layout adaptativo
- **Mobile**: Navegación con drawer y componentes optimizados

## 🔒 Seguridad

- Autenticación basada en tokens
- Validación de formularios con Zod
- Sanitización de datos de entrada
- Protección CSRF mediante headers apropiados
- Validación de tipos TypeScript

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variable de entorno `NEXT_PUBLIC_API_BASE_URL`
3. Desplegar automáticamente

### Otros Proveedores
El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- AWS Amplify
- Railway
- Heroku

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

---

**Desarrollado para USBBOG** - Sistema de Gestión de Inventarios Empresarial