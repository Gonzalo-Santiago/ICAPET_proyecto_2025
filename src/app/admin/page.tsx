// src/app/admin/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import { Building2, GraduationCap, Fingerprint } from "lucide-react";

interface Instructor {
  id?: number;
  nombre: string;
  rfc: string;
  tel: string;
  udc: string;
  estudios: string;
  sectores: string[];
  especialidades: string[];
}

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("Todos los Sectores");
  const [specialtyFilter, setSpecialtyFilter] = useState("Todas las Especialidades");
  const [data, setData] = useState<Instructor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("/api/instructores");
    const json = await res.json();
    setData(json);
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.rfc.toLowerCase().includes(search.toLowerCase());
    const matchSector =
      sectorFilter === "Todos los Sectores" || item.sectores.includes(sectorFilter);
    const matchSpecialty =
      specialtyFilter === "Todas las Especialidades" ||
      item.especialidades.includes(specialtyFilter);
    return matchSearch && matchSector && matchSpecialty;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este instructor?")) return;
    const res = await fetch(`/api/instructores/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Instructor eliminado con éxito.");
      fetchData();
    } else {
      alert("Error al eliminar el instructor.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;

    const payload: Instructor = {
      ...editingInstructor,
      sectores: editingInstructor.sectores.map((s) => s.trim()),
      especialidades: editingInstructor.especialidades.map((e) => e.trim()),
    };

    const method = editingInstructor.id ? "PUT" : "POST";
    const url = editingInstructor.id
      ? `/api/instructores/${editingInstructor.id}`
      : "/api/instructores";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Operación realizada con éxito.");
      setShowModal(false);
      setEditingInstructor(null);
      fetchData();
    } else {
      alert("Error al procesar la solicitud.");
    }
  };

  const openModalForCreate = () => {
    setEditingInstructor({
      nombre: "",
      rfc: "",
      tel: "",
      udc: "",
      estudios: "",
      sectores: [],
      especialidades: [],
    });
    setShowModal(true);
  };

  const openModalForEdit = (item: Instructor) => {
    setEditingInstructor({ ...item });
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold text-blue-600 mb-2">
        Panel de Administración
      </h1>
      <p className="text-center text-gray-500 mb-6">
        Administra instructores registrados
      </p>

      {/* Filtros + Botón Agregar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 justify-center">
        <input
          className="border rounded-md p-2 w-full md:w-1/3"
          placeholder="Buscar por nombre, RFC, etc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-md p-2"
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
        >
          <option>Todos los Sectores</option>
          {[...new Set(data.flatMap((d) => d.sectores))].map((sector, i) => (
            <option key={i}>{sector}</option>
          ))}
        </select>
        <select
          className="border rounded-md p-2"
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
        >
          <option>Todas las Especialidades</option>
          {[...new Set(data.flatMap((d) => d.especialidades))].map((esp, i) => (
            <option key={i}>{esp}</option>
          ))}
        </select>
        <button
          onClick={openModalForCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaPlus /> Agregar Instructor
        </button>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg relative"
          >
            <h2 className="text-lg font-semibold text-blue-600">{item.nombre}</h2>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Fingerprint size={16} /> {item.rfc}
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-700">
              <FaWhatsapp className="text-green-500" size={18} /> {item.tel}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Building2 size={16} /> {item.udc}
            </div>
            <div className="flex items-center gap-2 text-gray-700 italic">
              <GraduationCap size={16} /> {item.estudios}
            </div>

            <div className="mt-3">
              <h3 className="font-bold">Sectores</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.sectores.map((sec, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <h3 className="font-bold">Especialidades</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.especialidades.map((esp, idx) => (
                  <span
                    key={idx}
                    className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs"
                  >
                    {esp}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => openModalForEdit(item)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(item.id!)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Crear/Editar */}
      {showModal && editingInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-md p-6 w-full max-w-md shadow-lg"
          >
            <h2 className="text-lg font-bold mb-4">
              {editingInstructor.id ? "Editar Instructor" : "Agregar Instructor"}
            </h2>
            <input
              className="w-full border p-2 mb-2"
              placeholder="Nombre completo"
              value={editingInstructor.nombre}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, nombre: e.target.value })
              }
              required
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="RFC"
              value={editingInstructor.rfc}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, rfc: e.target.value })
              }
              required
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="Teléfono / contacto"
              value={editingInstructor.tel}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, tel: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="UDC"
              value={editingInstructor.udc}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, udc: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="Nivel de estudios"
              value={editingInstructor.estudios}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, estudios: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="Sectores (separados por coma)"
              value={editingInstructor.sectores.join(", ")}
              onChange={(e) =>
                setEditingInstructor({
                  ...editingInstructor,
                  sectores: e.target.value.split(",").map((s) => s.trim()),
                })
              }
            />
            <input
              className="w-full border p-2 mb-2"
              placeholder="Especialidades (separadas por coma)"
              value={editingInstructor.especialidades.join(", ")}
              onChange={(e) =>
                setEditingInstructor({
                  ...editingInstructor,
                  especialidades: e.target.value.split(",").map((s) => s.trim()),
                })
              }
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingInstructor(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
