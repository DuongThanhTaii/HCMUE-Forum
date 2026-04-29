import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLoginMutation } from '../api/auth.api'

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
      await login({ email: email.trim(), password }).unwrap()
      navigate('/forum')
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
