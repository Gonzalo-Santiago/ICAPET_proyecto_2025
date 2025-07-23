"use client";
import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Building2, GraduationCap, Fingerprint, Plus } from "lucide-react";

export default function InstructorFinder() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("Todos los Sectores");
  const [specialtyFilter, setSpecialtyFilter] = useState("Todas las Especialidades");
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    rfc: "",
    tel: "",
    udc: "",
    estudios: "",
    sectores: "",
    especialidades: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch("/api/instructores");
    const json = await res.json();
    setData(json);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sectores: formData.sectores.split(",").map(s => s.trim()),
      especialidades: formData.especialidades.split(",").map(e => e.trim()),
    };

    const res = await fetch("/api/instructores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchData();
      setShowModal(false);
      setFormData({
        nombre: "",
        rfc: "",
        tel: "",
        udc: "",
        estudios: "",
        sectores: "",
        especialidades: "",
      });
    }
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.rfc.toLowerCase().includes(search.toLowerCase());
    const matchSector =
      sectorFilter === "Todos los Sectores" || item.sectores.includes(sectorFilter);
    const matchSpecialty =
      specialtyFilter === "Todas las Especialidades" || item.especialidades.includes(specialtyFilter);
    return matchSearch && matchSector && matchSpecialty;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold text-blue-600 mb-2">Filtro de Instructores</h1>
      <p className="text-center text-gray-500 mb-6">Utiliza los filtros para refinar tu búsqueda por sector o especialidad.</p>

      {/* Filtros y botón agregar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center">
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
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={16} /> Agregar Instructor
        </button>
      </div>

      {/* Tarjetas de instructores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg">
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
                {item.sectores.map((sec: string, index: number) => (
                  <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">{sec}</span>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold">Especialidades</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.especialidades.map((esp: string, index: number) => (
                  <span key={index} className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">{esp}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            <h2 className="text-xl font-bold mb-4">Agregar Instructor</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {["nombre", "rfc", "tel", "udc", "estudios"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.toUpperCase()}
                  value={(formData as any)[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full border rounded-md p-2"
                  required
                />
              ))}
              <input
                type="text"
                placeholder="Sectores (separados por coma)"
                value={formData.sectores}
                onChange={(e) => setFormData({ ...formData, sectores: e.target.value })}
                className="w-full border rounded-md p-2"
                required
              />
              <input
                type="text"
                placeholder="Especialidades (separadas por coma)"
                value={formData.especialidades}
                onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })}
                className="w-full border rounded-md p-2"
                required
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
