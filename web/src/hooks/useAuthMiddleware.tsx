import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const useAuthMiddleware = () => {
  const {user} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
        navigate('/auth/sign-in', {state: {from: location}})
    }
  }, [user, navigate, location])
}

export default useAuthMiddleware