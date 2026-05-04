import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLoginMutation } from '../api/auth.api'

const normalizeRoles = (roles: string[] | undefined) =>
  (roles ?? []).map((role) => role.trim().toLowerCase())

const hasRole = (roles: string[] | undefined, target: string) =>
  normalizeRoles(roles).includes(target)

export function useLoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage(t('auth.pages.validation.loginRequired'))
      return
    }

    try {
      const authPayload = await login({ email: email.trim(), password }).unwrap()
      const roles = authPayload.user.roles
      if (hasRole(roles, 'admin')) {
        navigate('/admin')
        return
      }
      if (hasRole(roles, 'moderator')) {
        navigate('/mod/reports')
        return
      }
      if (hasRole(roles, 'recruiter')) {
        navigate('/career/jobs')
        return
      }
      navigate('/home')
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
