// src/components/LogoutButton.tsx
    "use client";

    import { authLogout } from "@/services/authLogout";

    export default function LogoutButton(){
    return (
        <div className="p-10">
        <h1 className="text-2xl font-bold">Bem-vindo ao Dashboard!</h1>
        <button
            onClick={authLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
            Sair
        </button>
        </div>
    );
    }
