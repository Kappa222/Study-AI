"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        if (!email) {
            setMessage("Írj be egy email címet!");
            return;
        }

        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: "http://localhost:3000/dashboard",
            },
        });

        setLoading(false);

        if (error) {
            setMessage("Hiba történt 😢");
            console.log(error);
        } else {
            setMessage("Elküldtük a belépési linket 📩 Nézd meg az emailed!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-80">
                <h1 className="text-2xl font-bold mb-4">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 rounded mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Küldés..." : "Belépés"}
                </button>

                {message && (
                    <p className="mt-3 text-sm text-gray-600">{message}</p>
                )}
            </div>
        </div>
    );
}
