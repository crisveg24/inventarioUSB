export interface User {
  username: string
  token: string
}

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
  if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
    const token = generateToken()
    setAuthToken(token)
    return { username, token }
  }
  return null
}

export const logout = (): void => {
  removeAuthToken()
}
