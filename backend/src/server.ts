
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import {userRoutes} from './routes/userRoutes.js'
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use( userRoutes)

//Se a requisicao for do tipo error, copia esse midleware

app.use(errorHandler);

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
