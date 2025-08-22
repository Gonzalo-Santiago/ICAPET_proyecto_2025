'use client';

// Importa React y los hooks necesarios, incluyendo los tipos para los eventos.
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

// Define la interfaz para la estructura de un sector.
// Esto le dice a TypeScript que cada objeto de sector tendrá estas propiedades y tipos.
interface Sector {
  id: string;
  campo_formacion: string;
  especialidad: string;
  curso: string;
}

// Define la interfaz para el estado del formulario.
// Es similar a la de Sector, pero la separamos por claridad.
interface FormData {
  id: string;
  campo_formacion: string;
  especialidad: string;
  curso: string;
}

/**
 * Componente principal para la página de "Editar Sector".
 * Permite seleccionar un sector de una lista y editar sus datos.
 */
const EditarSectorPage = () => {
  // Estado para la lista de todos los sectores, tipado como un array de 'Sector'.
  const [sectors, setSectors] = useState<Sector[]>([]);
  // Estado para los datos del formulario, tipado como 'FormData'.
  // Lo inicializamos con los campos correctos.
  const [formData, setFormData] = useState<FormData>({
    id: '',
    campo_formacion: '',
    especialidad: '',
    curso: '',
  });
  // Estado para el ID del sector seleccionado en el dropdown.
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  // Estados para mensajes y control de UI.
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingSectors, setIsFetchingSectors] = useState<boolean>(true);

  // useEffect para obtener la lista de sectores al cargar el componente.
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/sectores`);
        if (response.ok) {
          const data: Sector[] = await response.json();
          setSectors(data);
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || 'Error al cargar los sectores.');
          setIsError(true);
        }
      } catch (error) {
        console.error('Error al obtener sectores:', error);
        setMessage('Error: No se pudo conectar con el servidor para cargar los sectores.');
        setIsError(true);
      } finally {
        setIsFetchingSectors(false);
      }
    };

    fetchSectors();
  }, []);

  // useEffect para cargar los datos del sector seleccionado en el formulario.
  // Se ejecuta cada vez que 'selectedSectorId' o 'sectors' cambian.
  useEffect(() => {
    if (selectedSectorId) {
      const sectorToEdit = sectors.find(s => s.id === selectedSectorId);
      if (sectorToEdit) {
        setFormData({
          id: sectorToEdit.id,
          campo_formacion: sectorToEdit.campo_formacion,
          especialidad: sectorToEdit.especialidad,
          curso: sectorToEdit.curso,
        });
      }
    } else {
      // Limpia el formulario si no hay ningún sector seleccionado.
      setFormData({
        id: '',
        campo_formacion: '',
        especialidad: '',
        curso: '',
      });
    }
  }, [selectedSectorId, sectors]);

  /**
   * Manejador de cambio para el dropdown de selección de sector.
   * Usamos el tipo genérico 'ChangeEvent' para eventos de cambio.
   */
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSectorId(e.target.value);
  };

  /**
   * Manejador de cambio para los inputs del formulario.
   * Usamos el tipo genérico 'ChangeEvent' para eventos de cambio.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  /**
   * Manejador del envío del formulario.
   * Usamos el tipo genérico 'FormEvent' para el evento de formulario.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    if (!selectedSectorId) {
      setMessage('Por favor, selecciona un sector para editar.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Realiza la llamada a la API usando el método PUT para actualizar.
      const response = await fetch(`${window.location.origin}/api/sectores?id=${selectedSectorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message || 'Sector actualizado con éxito.');
          setIsError(false);

          // No es necesario recargar todos los sectores.
          // En su lugar, actualizamos el estado 'sectors' localmente.
          setSectors(prevSectors => prevSectors.map(s => s.id === selectedSectorId ? { ...s, ...formData } : s));

        } else {
          setMessage(data.error || 'Ocurrió un error al actualizar el sector.');
          setIsError(true);
        }
      } else {
        const text = await response.text();
        console.error('Error: Respuesta inesperada del servidor (no es JSON).', text);
        setMessage('Error: Respuesta del servidor inesperada.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error al actualizar sector:', error);
      setMessage('Error: No se pudo conectar con el servidor.');
      setIsError(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  /**
   * Funcion para eliminar
   */
  const handleDelete = async () => {
    if (!selectedSectorId) return;

    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este sector?");
    if (!confirmDelete) return;

    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${window.location.origin}/api/sectores?id=${selectedSectorId}`, {
        method: 'DELETE',
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || 'Sector eliminado con éxito.');
          setIsError(false);

          // Eliminar el sector del estado local
          setSectors(prev => prev.filter(s => s.id !== selectedSectorId));
          setSelectedSectorId('');
        } else {
          setMessage(data.error || 'Ocurrió un error al eliminar el sector.');
          setIsError(true);
        }
      } else {
        const text = await response.text();
        console.error('Respuesta inesperada:', text);
        setMessage('Respuesta inesperada del servidor.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error al eliminar sector:', error);
      setMessage('Error: No se pudo conectar con el servidor.');
      setIsError(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Editar Sector
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
                <label htmlFor="sector-select" className="block text-sm font-medium text-gray-700">
                  Seleccionar Sector
                </label>
                {isFetchingSectors ? (
                  <div className="mt-1 p-3 text-gray-500">Cargando sectores...</div>
                ) : (
                  <select
                    id="sector-select"
                    name="sector-select"
                    value={selectedSectorId}
                    onChange={handleSelectChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                  >
                    <option value="">-- Selecciona un sector --</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.campo_formacion} - {sector.especialidad} - {sector.curso}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedSectorId && (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 gap-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading || !selectedSectorId}
              className="w-1/2 ml-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              Eliminar Sector
            </button>

            <button
              type="submit"
              disabled={isLoading || !selectedSectorId}
              className="w-1/2 mr-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Sector'}
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-1/2 ml-2 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarSectorPage;