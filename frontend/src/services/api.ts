import axios from 'axios'
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '/api' })
api.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('token')
		if (token) config.headers.set('Authorization', `Bearer ${token}`)
	}
	return config
})

api.interceptors.response.use((response) => response, (error) => {
	if (typeof window !== 'undefined' && error.response?.status === 401) {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
	}
	return Promise.reject(error)
})
export default api