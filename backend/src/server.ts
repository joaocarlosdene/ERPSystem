import { app } from "./app.js";




// Inicia servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
