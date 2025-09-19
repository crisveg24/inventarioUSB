export interface User {
  username: string
  token: string
  role: string
  canViewAll: boolean
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
  "Jefe Oficina de Control Interno": {
    name: 'Jefe Oficina de Control Interno',
    description: 'Acceso a datos de Control Interno',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canViewAll: false
  },
  "Subdirección Financiera y Administrativa": {
    name: 'Subdirección Financiera y Administrativa',
    description: 'Acceso a datos financieros y administrativos',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canViewAll: false
  },
  "Asesor de la Dirección para Comunicaciones y Servicio al Ciudadano": {
    name: 'Asesor de la Dirección para Comunicaciones y Servicio al Ciudadano',
    description: 'Acceso a datos de comunicaciones',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canViewAll: false
  },
  "Oficina de Control Disciplinario Interno": {
    name: 'Oficina de Control Disciplinario Interno',
    description: 'Acceso a datos de control disciplinario',
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canViewAll: false
  }
} as const

// Usuarios de prueba
export const TEST_USERS = [
  {
    //puede ver todos los datos
    username: "admin",
    password: "admin123",
    role: "admin" as const,
  },
  {
    //solo puede ver los datos cuyo dato DUEÑO_DE_ACTIVO coincida con su rol
    username: "jefe_oficina",
    password: "jefe123",
    role: "Jefe Oficina de Control Interno" as const,
  },
  {
    //solo puede ver los datos cuyo dato DUEÑO_DE_ACTIVO coincida con su rol
    username: "finanzas",
    password: "finanzas123",
    role: "Subdirección Financiera y Administrativa" as const,
  },
  {
    //solo puede ver los datos cuyo dato DUEÑO_DE_ACTIVO coincida con su rol
    username: "asesor_direccion",
    password: "direccion123",
    role: "Asesor de la Dirección para Comunicaciones y Servicio al Ciudadano" as const,
  },
  {
    //solo puede ver los datos cuyo dato DUEÑO_DE_ACTIVO coincida con su rol
    username: "oficina_control",
    password: "control123",
    role: "Oficina de Control Disciplinario Interno" as const,
  }
]

export const AUTH_CREDENTIALS = {
  username: "USBBOG",
  password: "usb123#",
}

export const generateToken = (): string => {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
  }
}

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null
}

export const authenticate = (username: string, password: string): User | null => {
  // Buscar en usuarios de prueba primero
  const testUser = TEST_USERS.find(u => u.username === username && u.password === password)
  
  if (testUser) {
    const token = generateToken()
    setAuthToken(token)
    const userRole = USER_ROLES[testUser.role]
    
    // Guardar información del usuario en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user_info", JSON.stringify({
        username: testUser.username,
        role: testUser.role,
        canViewAll: userRole.canViewAll
      }))
    }
    
    return { 
      username: testUser.username, 
      token, 
      role: testUser.role,
      canViewAll: userRole.canViewAll
    }
  }
  
  // Fallback al usuario original
  if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
    const token = generateToken()
    setAuthToken(token)
    
    if (typeof window !== "undefined") {
      localStorage.setItem("user_info", JSON.stringify({
        username: "USBBOG",
        role: "admin",
        canViewAll: true
      }))
    }
    
    return { 
      username, 
      token, 
      role: "admin",
      canViewAll: true
    }
  }
  
  return null
}

export const getCurrentUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("user_info")
    const token = getAuthToken()
    
    if (userInfo && token) {
      const parsed = JSON.parse(userInfo)
      return {
        username: parsed.username,
        token,
        role: parsed.role,
        canViewAll: parsed.canViewAll
      }
    }
  }
  return null
}

export const logout = (): void => {
  removeAuthToken()
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_info")
  }
}
