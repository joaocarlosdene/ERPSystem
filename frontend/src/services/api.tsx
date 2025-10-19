import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3333",
    withCredentials: true, // 🔥 permite envio/recebimento de cookies
})



export default api; 