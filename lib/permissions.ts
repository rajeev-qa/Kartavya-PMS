// Permission checking utility
export const checkPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission)
}

export const checkAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

export const checkAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}

// Get user permissions from localStorage
export const getUserPermissions = (): string[] => {
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      return userData.permissions || []
    }
  } catch (error) {
    console.error('Error getting user permissions:', error)
  }
  return []
}