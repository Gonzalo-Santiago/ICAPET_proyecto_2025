/**
 * autor: max
 * fecha de inicio: 14 de julio del 2025
 * Descripción: es la interfaz principal
 */
// src\app\page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // NUEVO

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Activar loading

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(data.role === 'admin' ? '/admin' : '/user');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false); // Desactivar loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl p-10 w-full max-w-md flex flex-col transition-all duration-300"
      >
        <h2 className="text-white text-3xl font-bold mb-4 text-center tracking-tight">Icapet</h2>
        <h3 className="text-gray-300 text-lg mb-8 text-center font-medium">Iniciar sesión</h3>

        <div className="flex flex-col mb-6">
          <label htmlFor="username" className="text-gray-400 mb-2 font-medium">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            placeholder="Nombre de usuario"
            className="rounded-lg bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 placeholder-gray-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="flex flex-col mb-6">
          <label htmlFor="password" className="text-gray-400 mb-2 font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            className="rounded-lg bg-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="mb-4 text-red-500 font-semibold text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 transition-colors duration-300 rounded-lg py-2.5 text-white font-semibold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Cargando...</span>
            </div>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>
    </div>
  );
}
