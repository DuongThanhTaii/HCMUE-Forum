import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLoginMutation } from '../api/auth.api'

const hasAdminRole = (roles: string[] | undefined) =>
  (roles ?? []).some((role) => role.trim().toLowerCase() === 'admin')

export function useLoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    console.log('Login form submitted:', email, password);
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage(t('auth.pages.validation.loginRequired'))
      return
    }

    try {
      const authPayload = await login({ email: email.trim(), password }).unwrap()
      console.log('Login successful:', authPayload);
      navigate(hasAdminRole(authPayload.user.roles) ? '/admin' : '/home')
    } catch {
      setErrorMessage(t('auth.invalidCredentials'))
    }
  }

  return {
    email,
    password,
    errorMessage,
    isLoading,
    setEmail,
    setPassword,
    onSubmit,
  }
}
