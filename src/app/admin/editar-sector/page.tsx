"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface Sector {
  id: string;
  campo_formacion: string;
  especialidad: string;
  curso: string;
}

export default function EditarSectorPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [formData, setFormData] = useState<Sector>({ id: "", campo_formacion: "", especialidad: "", curso: "" });
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch("/api/sectores");
        if (!res.ok) throw new Error("Error al cargar sectores");
        setSectors(await res.json());
      } catch (e) {
        setMessage("No se pudo cargar sectores.");
        setIsError(true);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSectors();
  }, []);

  useEffect(() => {
    const sector = sectors.find((s) => String(s.id) === String(selectedSectorId));
    setFormData(sector ?? { id: "", campo_formacion: "", especialidad: "", curso: "" });
  }, [selectedSectorId, sectors]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "sector-select") {
      setSelectedSectorId(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSectorId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/sectores?id=${selectedSectorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al actualizar");

      setSectors((prev) => prev.map((s) => (s.id === selectedSectorId ? { ...s, ...formData } : s)));
      setMessage(data.message || "Sector actualizado con éxito.");
      setIsError(false);
    } catch (e: any) {
      setMessage(e.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async () => {
    if (!selectedSectorId || !confirm("¿Eliminar este sector?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/sectores?id=${selectedSectorId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      setSectors((prev) => prev.filter((s) => s.id !== selectedSectorId));
      setSelectedSectorId("");
      setMessage(data.message || "Sector eliminado.");
      setIsError(false);
    } catch (e: any) {
      setMessage(e.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Editar Sector</h1>

        {message && (
          <div className={`border px-4 py-3 rounded mb-4 ${isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            name="sector-select"
            value={selectedSectorId}
            onChange={handleChange}
            className="block w-full rounded border p-3"
          >
            <option value="">-- Selecciona un sector --</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.campo_formacion} - {s.especialidad} - {s.curso}
              </option>
            ))}
          </select>

          {selectedSectorId && (
            <>
              <input type="text" name="campo_formacion" value={formData.campo_formacion} onChange={handleChange} className="block w-full border p-3 rounded" required />
              <input type="text" name="especialidad" value={formData.especialidad} onChange={handleChange} className="block w-full border p-3 rounded" required />
              <input type="text" name="curso" value={formData.curso} onChange={handleChange} className="block w-full border p-3 rounded" required />
            </>
          )}

          <div className="flex gap-4">
            <button type="button" onClick={handleDelete} disabled={!selectedSectorId || isLoading} className="w-1/3 bg-red-600 text-white p-3 rounded disabled:opacity-50">
              Eliminar
            </button>
            <button type="submit" disabled={!selectedSectorId || isLoading} className="w-1/3 bg-indigo-600 text-white p-3 rounded disabled:opacity-50">
              {isLoading ? "Guardando..." : "Actualizar"}
            </button>
            <button type="button" onClick={() => window.history.back()} className="w-1/3 bg-gray-300 p-3 rounded">
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
