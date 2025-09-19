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

  const hasPermission = (action: keyof (typeof USER_ROLES)['admin']) => {
    if (!user) return false
    const userRole = USER_ROLES[user.role as keyof typeof USER_ROLES]
    return userRole ? userRole[action] : false
  }

  const canViewAll = () => hasPermission('canViewAll')
  const canCreate = () => hasPermission('canCreate')
  const canEdit = () => hasPermission('canEdit')
  const canDelete = () => hasPermission('canDelete')

  const getFilteredOwner = () => {
    if (!user) return null
    const userRole = USER_ROLES[user.role as keyof typeof USER_ROLES]
    if (userRole && userRole.canViewAll) {
      return null
    }
    return user.role
  }

  const getUserRoleInfo = () => {
    if (!user) return null
    return USER_ROLES[user.role as keyof typeof USER_ROLES] || null
  }

  return {
    user,
    isLoading,
    hasPermission,
    canViewAll,
    canCreate,
    canEdit,
    canDelete,
    getFilteredOwner,
    getUserRoleInfo
  }
}
