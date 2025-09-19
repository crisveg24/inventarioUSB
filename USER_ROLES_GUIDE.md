# Guía de Usuarios de Prueba y Sistema de Roles

## 📋 Resumen

Esta guía explica cómo implementar un sistema de usuarios de prueba con roles que permita filtrar los datos del inventario mediante el campo `DUEÑO_DE_ACTIVO`. Actualmente el sistema solo tiene un usuario hardcodeado, pero aquí te mostramos cómo expandirlo.

## 🔍 Análisis del Sistema Actual

### Estado Actual
- **Usuario único**: `USBBOG` / `usb123#`
- **Sin roles**: Todos los usuarios ven todos los datos
- **Campo clave**: `DUEÑO_DE_ACTIVO` se mapea a `supplier` en la UI
- **Sin filtrado**: No hay restricciones por usuario

### Campo DUEÑO_DE_ACTIVO
```typescript
// En la API (InventarioActivoOut)
DUEÑO_DE_ACTIVO?: string;

// En la UI (InventoryItem)
supplier: string; // Mapeado desde DUEÑO_DE_ACTIVO
```

## 🚀 Implementación del Sistema de Roles

### 1. Extender el Sistema de Autenticación

#### Actualizar `lib/auth.ts`

```typescript
export interface User {
  username: string
  token: string
  role: 'admin' | 'manager' | 'viewer'
  owner?: string // Campo para filtrar por DUEÑO_DE_ACTIVO
}

export const USER_ROLES = {
  admin: {
    name: 'Administrador',
    description: 'Acceso completo a todos los datos',
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canViewAll: true
  },
  manager: {
    name: 'Gerente',
    description: 'Acceso a datos de su departamento',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canViewAll: false
  },
  viewer: {
    name: 'Visualizador',
    description: 'Solo lectura de sus datos asignados',
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewAll: false
  }
} as const

// Usuarios de prueba
export const TEST_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "admin" as const,
    owner: null // Admin ve todo
  },
  {
    username: "gerente_ventas",
    password: "ventas123",
    role: "manager" as const,
    owner: "Departamento de Ventas"
  },
  {
    username: "gerente_it",
    password: "it123",
    role: "manager" as const,
    owner: "Departamento de IT"
  },
  {
    username: "viewer_almacen",
    password: "almacen123",
    role: "viewer" as const,
    owner: "Almacén Central"
  },
  {
    username: "viewer_finanzas",
    password: "finanzas123",
    role: "viewer" as const,
    owner: "Departamento de Finanzas"
  }
]

export const authenticate = (username: string, password: string): User | null => {
  const user = TEST_USERS.find(u => u.username === username && u.password === password)
  
  if (user) {
    const token = generateToken()
    setAuthToken(token)
    // Guardar información del usuario en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user_info", JSON.stringify({
        username: user.username,
        role: user.role,
        owner: user.owner
      }))
    }
    return { 
      username: user.username, 
      token, 
      role: user.role,
      owner: user.owner || undefined
    }
  }
  return null
}

export const getCurrentUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("user_info")
    const token = getAuthToken()
    
    if (userInfo && token) {
      return JSON.parse(userInfo)
    }
  }
  return null
}
```

### 2. Crear Hook para Roles

#### Crear `hooks/use-auth.ts`

```typescript
import { useState, useEffect } from 'react'
import { getCurrentUser, User, USER_ROLES } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const hasPermission = (action: keyof typeof USER_ROLES.admin>) => {
    if (!user) return false
    return USER_ROLES[user.role][action]
  }

  const canViewAll = () => hasPermission('canViewAll')
  const canCreate = () => hasPermission('canCreate')
  const canEdit = () => hasPermission('canEdit')
  const canDelete = () => hasPermission('canDelete')

  const getFilteredOwner = () => {
    if (!user) return null
    return user.owner || null
  }

  return {
    user,
    isLoading,
    hasPermission,
    canViewAll,
    canCreate,
    canEdit,
    canDelete,
    getFilteredOwner
  }
}
```

### 3. Actualizar el Formulario de Login

#### Modificar `components/login-form.tsx`

```typescript
// Agregar al final del formulario, antes del cierre de CardContent
<div className="mt-6 space-y-4">
  <div className="text-center">
    <h3 className="text-sm font-medium text-foreground mb-3">Usuarios de Prueba</h3>
    <div className="grid grid-cols-1 gap-2 text-xs">
      <div className="bg-muted/50 p-2 rounded">
        <div className="font-medium">Admin (Acceso completo)</div>
        <div className="font-mono">admin / admin123</div>
      </div>
      <div className="bg-muted/50 p-2 rounded">
        <div className="font-medium">Gerente Ventas</div>
        <div className="font-mono">gerente_ventas / ventas123</div>
      </div>
      <div className="bg-muted/50 p-2 rounded">
        <div className="font-medium">Gerente IT</div>
        <div className="font-mono">gerente_it / it123</div>
      </div>
      <div className="bg-muted/50 p-2 rounded">
        <div className="font-medium">Viewer Almacén</div>
        <div className="font-mono">viewer_almacen / almacen123</div>
      </div>
      <div className="bg-muted/50 p-2 rounded">
        <div className="font-medium">Viewer Finanzas</div>
        <div className="font-mono">viewer_finanzas / finanzas123</div>
      </div>
    </div>
  </div>
</div>
```

### 4. Implementar Filtrado por DUEÑO_DE_ACTIVO

#### Actualizar `api/get-inventario.ts`

```typescript
import { getCurrentUser } from '@/lib/auth'

export async function getInventarioActivos(
  params: InventarioQueryParams = {}
): Promise<InventarioActivoList> {
  try {
    const { skip = 0, limit = 100 } = params;
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTARIO, { skip, limit });

    const response = await fetch(url, {
      ...defaultFetchConfig,
      method: "GET",
    });

    const data = await handleApiResponse<InventarioActivoList>(response);
    
    // Aplicar filtro por DUEÑO_DE_ACTIVO si el usuario no es admin
    const currentUser = getCurrentUser()
    if (currentUser && !currentUser.canViewAll && currentUser.owner) {
      return data.filter(activo => 
        activo.DUEÑO_DE_ACTIVO === currentUser.owner
      )
    }
    
    return data;
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    throw error;
  }
}
```

### 5. Actualizar Componentes con Permisos

#### Modificar `components/inventory/inventory-table.tsx`

```typescript
import { useAuth } from '@/hooks/use-auth'

export function InventoryTable({ onEdit, onDelete, onAdd, refreshKey }: InventoryTableProps) {
  const { user, canCreate, canEdit, canDelete, getFilteredOwner } = useAuth()
  
  // ... resto del código existente ...

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Gestión de Inventario</CardTitle>
            {getFilteredOwner() && (
              <p className="text-sm text-muted-foreground">
                Mostrando datos de: <span className="font-medium">{getFilteredOwner()}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* ... botones existentes ... */}
            {canCreate() && (
              <Button onClick={onAdd} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {/* ... resto del componente ... */}
      <TableBody>
        {filteredItems.map((item) => (
          <TableRow key={item.id} className="border-border">
            {/* ... celdas existentes ... */}
            <TableCell>
              <div className="flex items-center gap-2">
                {canEdit() && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {canDelete() && (
                  <Button variant="outline" size="sm" onClick={() => onDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Card>
  )
}
```

### 6. Actualizar el Formulario de Inventario

#### Modificar `components/inventory/inventory-form.tsx`

```typescript
import { useAuth } from '@/hooks/use-auth'

export function InventoryForm({ isOpen, onClose, onSave, editingItem }: InventoryFormProps) {
  const { user, getFilteredOwner } = useAuth()
  
  // ... resto del código existente ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const apiData = {
        NOMBRE_DEL_ACTIVO: formData.name,
        DESCRIPCION: `Producto: ${formData.name}`,
        TIPO_DE_ACTIVO: formData.category,
        // ... otros campos ...
        DUEÑO_DE_ACTIVO: getFilteredOwner() || formData.supplier, // Usar el owner del usuario o el supplier
        // ... resto de campos ...
      }

      // ... resto de la lógica de guardado ...
    } catch (error) {
      // ... manejo de errores ...
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        {/* ... header ... */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... campos existentes ... */}
          
          {/* Mostrar el DUEÑO_DE_ACTIVO como campo de solo lectura si el usuario tiene uno asignado */}
          {getFilteredOwner() && (
            <div className="space-y-2">
              <Label>Departamento/Área</Label>
              <Input
                value={getFilteredOwner()}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Este campo está asignado automáticamente según tu rol
              </p>
            </div>
          )}
          
          {/* Campo de proveedor solo si no hay owner asignado */}
          {!getFilteredOwner() && (
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Input
                id="supplier"
                value={formData.supplier || ""}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                placeholder="Ej: Dell Colombia"
                required
              />
            </div>
          )}
          
          {/* ... resto del formulario ... */}
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 7. Actualizar la Barra de Navegación

#### Modificar `components/layout/navbar.tsx`

```typescript
import { useAuth } from '@/hooks/use-auth'

export function Navbar() {
  const { user, logout } = useAuth()
  // ... resto del código existente ...

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">USBBOG Inventarios</span>
                {user && (
                  <div className="text-xs text-muted-foreground">
                    {user.username} ({USER_ROLES[user.role].name})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ... resto de la navegación ... */}
        </div>
      </div>
    </nav>
  )
}
```

## 🧪 Datos de Prueba

### Crear Datos de Prueba en la API

Para probar el sistema de roles, necesitas crear activos en la API con diferentes valores de `DUEÑO_DE_ACTIVO`:

```json
[
  {
    "NOMBRE_DEL_ACTIVO": "Laptop Dell Inspiron",
    "TIPO_DE_ACTIVO": "Electrónicos",
    "DUEÑO_DE_ACTIVO": "Departamento de Ventas",
    "DESCRIPCION": "Laptop para ventas",
    "DISPONIBILIDAD": "Alta",
    "CRITICIDAD_TOTAL_DEL_ACTIVO": "Media"
  },
  {
    "NOMBRE_DEL_ACTIVO": "Servidor HP ProLiant",
    "TIPO_DE_ACTIVO": "Hardware",
    "DUEÑO_DE_ACTIVO": "Departamento de IT",
    "DESCRIPCION": "Servidor principal",
    "DISPONIBILIDAD": "Alta",
    "CRITICIDAD_TOTAL_DEL_ACTIVO": "Alta"
  },
  {
    "NOMBRE_DEL_ACTIVO": "Impresora Canon",
    "TIPO_DE_ACTIVO": "Oficina",
    "DUEÑO_DE_ACTIVO": "Almacén Central",
    "DESCRIPCION": "Impresora multifuncional",
    "DISPONIBILIDAD": "Media",
    "CRITICIDAD_TOTAL_DEL_ACTIVO": "Baja"
  },
  {
    "NOMBRE_DEL_ACTIVO": "Software Contable",
    "TIPO_DE_ACTIVO": "Software",
    "DUEÑO_DE_ACTIVO": "Departamento de Finanzas",
    "DESCRIPCION": "Sistema contable",
    "DISPONIBILIDAD": "Alta",
    "CRITICIDAD_TOTAL_DEL_ACTIVO": "Alta"
  }
]
```

## 🔄 Flujo de Trabajo

### 1. Login con Diferentes Usuarios
- **Admin**: Ve todos los activos sin filtros
- **Gerente Ventas**: Solo ve activos con `DUEÑO_DE_ACTIVO = "Departamento de Ventas"`
- **Gerente IT**: Solo ve activos con `DUEÑO_DE_ACTIVO = "Departamento de IT"`
- **Viewer Almacén**: Solo ve activos con `DUEÑO_DE_ACTIVO = "Almacén Central"`
- **Viewer Finanzas**: Solo ve activos con `DUEÑO_DE_ACTIVO = "Departamento de Finanzas"`

### 2. Permisos por Rol
- **Admin**: CRUD completo en todos los datos
- **Manager**: CRUD limitado a sus datos asignados
- **Viewer**: Solo lectura de sus datos asignados

### 3. Filtrado Automático
- Los datos se filtran automáticamente según el `DUEÑO_DE_ACTIVO` del usuario
- Los admins ven todos los datos
- Los demás usuarios solo ven sus datos asignados

## 🚀 Implementación Paso a Paso

1. **Actualizar `lib/auth.ts`** con el nuevo sistema de roles
2. **Crear `hooks/use-auth.ts`** para manejo de permisos
3. **Modificar `components/login-form.tsx`** para mostrar usuarios de prueba
4. **Actualizar `api/get-inventario.ts`** para filtrado automático
5. **Modificar componentes** para usar permisos y filtros
6. **Crear datos de prueba** en la API con diferentes `DUEÑO_DE_ACTIVO`
7. **Probar** con diferentes usuarios

## ✅ Verificación

Después de implementar:

1. **Login con admin**: Debe ver todos los activos
2. **Login con gerente_ventas**: Solo debe ver activos de "Departamento de Ventas"
3. **Login con viewer_almacen**: Solo debe ver activos de "Almacén Central"
4. **Permisos**: Los botones de crear/editar/eliminar deben aparecer según el rol
5. **Filtrado**: Los datos deben filtrarse automáticamente

## 🔧 Personalización

### Agregar Nuevos Roles
```typescript
// En lib/auth.ts
export const USER_ROLES = {
  // ... roles existentes ...
  supervisor: {
    name: 'Supervisor',
    description: 'Supervisión de múltiples departamentos',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canViewAll: false
  }
}
```

### Agregar Nuevos Usuarios
```typescript
// En lib/auth.ts
export const TEST_USERS = [
  // ... usuarios existentes ...
  {
    username: "supervisor_general",
    password: "super123",
    role: "supervisor" as const,
    owner: "Supervisión General"
  }
]
```

Este sistema te permitirá tener un control granular sobre qué datos puede ver y modificar cada usuario, basándose en el campo `DUEÑO_DE_ACTIVO` de la API.
