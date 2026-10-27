import  { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'


const SignupPage = async () => {
    const { loading, signup } = useAuth();
    const  navigate = useNavigate()

    const [formData, setFormData] = useState({name : "" , email : "" , password : ""})
    const [submitting, setSubmitting] = useState(false);
    const [error , setError] = useState(null)

    const handleChange = (e) => {
        setError(null);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            await signup(formData.name, formData.email, formData.password)
            navigate('/courses')
        } catch (error) {
            setError(error)
        }finally{
            setSubmitting(false)
        }

    }


  return (
    <div>
        {loading && <p>Loading...</p>}
         <form onSubmit={handleSubmit}>
            <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            />
            <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            />
            <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            />
            <button type="submit" disabled={submitting}>
                {submitting ? "Signing up ..." : "Sign up"}
            </button>
        {error && <p>{error}</p>}
        </form>
    </div>
  )
}


export default SignupPage