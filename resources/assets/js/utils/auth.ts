export const checkPassword = (password: string | null | undefined, rePassword?: string) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Z\d@$!%*?&.]{10,}$/i
  if (password === null || password === undefined) {
    return { isValid: false, message: 'Password cannot be null.' }
  }
  if (rePassword && password !== rePassword) {
    return { isValid: false, message: 'Passwords do not match.' }
  }
  if (!passwordRegex.test(password)) {
    return { isValid: false, message: 'Password must be at least 10 characters long and contain a mix of letters, numbers, and symbols.' }
  }

  return { isValid: true, message: 'Password is invalid.' }
}
