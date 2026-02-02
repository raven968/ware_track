import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Login() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })

      const token = response.data.access_token // AuthController returns 'access_token', not 'token'
      localStorage.setItem('token', token)
      
      window.location.href = '/'
      
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || t('login.failed'))
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">{t('login.email_label')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">{t('login.password_label')}</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <Button className="w-full mt-6" type="submit">{t('login.submit')}</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Simple Language Switcher for Demo */}
      <div className="absolute top-4 right-4 space-x-2">
        <Button variant="outline" size="sm" onClick={() => i18n.changeLanguage('en')}>EN</Button>
        <Button variant="outline" size="sm" onClick={() => i18n.changeLanguage('es')}>ES</Button>
      </div>
    </div>
  )
}
// Need to import i18n instance for the switcher buttons to work directly or use hook
import i18n from '../i18n';
