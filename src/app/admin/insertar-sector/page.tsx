'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Componente para la página de "Insertar Sector"
const InsertarSectorPage = () => {
    const [formData, setFormData] = useState({
        campo_formacion: '',
        especialidad: '',
        curso: '',
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        try {
            // Realiza la llamada a la API usando el método POST
            const response = await fetch('/api/sectores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Si la respuesta es exitosa (código 201), muestra el mensaje de éxito
                setMessage(data.message);
                setIsError(false);
                // Limpia el formulario después de una inserción exitosa
                setFormData({
                    campo_formacion: '',
                    especialidad: '',
                    curso: '',
                });
            } else {
                // Si hay un error en la respuesta de la API, muestra el mensaje de error
                setMessage(data.error || 'Ocurrió un error desconocido.');
                setIsError(true);
            }
        } catch (error) {
            console.error('Error al insertar sector:', error);
            setMessage('Error: No se pudo conectar con el servidor.');
            setIsError(true);
        } finally {
            setIsLoading(false);
            // Oculta el mensaje después de 3 segundos
            setTimeout(() => {
                setMessage('');
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-500 hover:scale-105">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
                    Insertar Sector
                </h1>
                {message && (
                    <div
                        className={`border px-4 py-3 rounded-lg relative mb-4 ${isError
                                ? 'bg-red-100 border-red-400 text-red-700'
                                : 'bg-green-100 border-green-400 text-green-700'
                            }`}
                        role="alert"
                    >
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="campo_formacion" className="block text-sm font-medium text-gray-700">
                                    Campo de Formación
                                </label>
                                <input
                                    type="text"
                                    id="campo_formacion"
                                    name="campo_formacion"
                                    value={formData.campo_formacion}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700">
                                    Especialidad
                                </label>
                                <input
                                    type="text"
                                    id="especialidad"
                                    name="especialidad"
                                    value={formData.especialidad}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                                />
                            </div>
                            <div>
                                <label htmlFor="curso" className="block text-sm font-medium text-gray-700">
                                    Curso
                                </label>
                                <input
                                    type="text"
                                    id="curso"
                                    name="curso"
                                    value={formData.curso}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-1/2 mr-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Registrando...' : 'Registrar Sector'}
                        </button>
                        <Link
                            href="/admin"
                            className="w-1/2 ml-2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105"
                        >
                            cerrar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InsertarSectorPage;