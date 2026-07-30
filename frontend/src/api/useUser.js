import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axios";

const useUser = () => {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(()=> {
        const fetchUser = async() => {
            try {
                const response = await api.get('/auth/me/')
                setUser(response.data)
            } catch(err) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                navigate('/login')
            }
        }
        fetchUser()
    }, [])

    return user
}

export default useUser