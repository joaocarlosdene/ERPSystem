
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import {userRoutes} from './routes/userRoutes.js'
import { authRoutes } from './routes/authUsers.js'
import { errorHandler } from "./middlewares/errorHandler.js";
import { roleRoutes } from './routes/roleRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use( userRoutes)
app.use(authRoutes)
app.use(roleRoutes)

//Se a requisicao for do tipo error, copia esse midleware

app.use(errorHandler);

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
