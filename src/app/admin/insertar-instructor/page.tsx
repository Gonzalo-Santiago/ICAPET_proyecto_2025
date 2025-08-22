// src/app/api/registros/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Sector {
  id: number;
  campo_formacion: string;
  especialidad: string;
  curso: string;
}

const STATUS_OPTIONS = [
  "Experto Empírico",
  "Experto con educación NO formal",
  "Experto con Educación formal",
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Instructor en Territorios Bienestar",
  "Capacitador de cursos Mujeres Transformando su Futuro",
] as const;

type StatusType = typeof STATUS_OPTIONS[number];

interface SectorSeleccionado extends Sector {
  status: StatusType;
}

export default function Home() {
  const [form, setForm] = useState<any>({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    nivel_estudio: "",
    area_estudio: "",
    UDC: "",
    residencia: "",
    comentario: "",
    rfc: null,
    curp: null,
    cedula: null,
    ine: null,
    fotografia: null,
  });

  const [sectoresDisponibles, setSectoresDisponibles] = useState<Sector[]>([]);
  const [sectoresSeleccionados, setSectoresSeleccionados] = useState<SectorSeleccionado[]>([]);
  const [selectedFormacion, setSelectedFormacion] = useState("");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  const [statusSector, setStatusSector] = useState<StatusType>("Experto Empírico");
  const [isSaving, setIsSaving] = useState(false);

  // Refs para inputs tipo file
  const rfcRef = useRef<HTMLInputElement>(null);
  const curpRef = useRef<HTMLInputElement>(null);
  const cedulaRef = useRef<HTMLInputElement>(null);
  const ineRef = useRef<HTMLInputElement>(null);
  const fotografiaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSectores() {
      try {
        const res = await fetch("/api/sectores");
        if (res.ok) {
          const data = await res.json();
          setSectoresDisponibles(data);
        }
      } catch (err) {
        console.error("Error cargando sectores", err);
      }
    }
    fetchSectores();
  }, []);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // evitar múltiples envíos
    setIsSaving(true);

    const data = new FormData();

    for (const key in form) {
      if (form[key] !== null) {
        data.append(key, form[key]);
      }
    }

    data.append("sectores", JSON.stringify(sectoresSeleccionados));

    const res = await fetch("/api/instructores", {
      method: "POST",
      body: data,
    });

    if (res.ok) {
      alert("Instructor guardado correctamente");

      // Resetear formulario
      setForm({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        email: "",
        telefono: "",
        nivel_estudio: "",
        area_estudio: "",
        UDC: "",
        residencia: "",
        comentario: "",
        rfc: null,
        curp: null,
        cedula: null,
        ine: null,
        fotografia: null,
      });
      setSectoresSeleccionados([]);
      setSelectedFormacion("");
      setSelectedEspecialidad("");
      setSelectedCurso("");
      setStatusSector("Experto Empírico");

      // Limpiar inputs file con refs
      if (rfcRef.current) rfcRef.current.value = "";
      if (curpRef.current) curpRef.current.value = "";
      if (cedulaRef.current) cedulaRef.current.value = "";
      if (ineRef.current) ineRef.current.value = "";
      if (fotografiaRef.current) fotografiaRef.current.value = "";
    } else {
      alert("Error al guardar instructor");
    }

    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* FORMULARIO */}
      <main className="flex justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Registro de Instructor</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="nombre"
              placeholder="Nombre"
              className="input"
              required
              onChange={handleChange}
              value={form.nombre}
            />
            <input
              name="apellido_paterno"
              placeholder="Apellido Paterno"
              className="input"
              required
              onChange={handleChange}
              value={form.apellido_paterno}
            />
            <input
              name="apellido_materno"
              placeholder="Apellido Materno"
              className="input"
              required
              onChange={handleChange}
              value={form.apellido_materno}
            />
            <input
              name="email"
              placeholder="Correo Electrónico"
              type="email"
              className="input"
              required
              onChange={handleChange}
              value={form.email}
            />
            <input
              name="telefono"
              placeholder="Teléfono"
              className="input"
              onChange={handleChange}
              value={form.telefono}
            />
            <input
              name="nivel_estudio"
              placeholder="Nivel de Estudio"
              className="input"
              onChange={handleChange}
              value={form.nivel_estudio}
            />
            <input
              name="area_estudio"
              placeholder="Área de Estudio"
              className="input"
              onChange={handleChange}
              value={form.area_estudio}
            />
            <input
              name="UDC"
              placeholder="UDC"
              className="input"
              onChange={handleChange}
              value={form.UDC}
            />
            <input
              name="residencia"
              placeholder="Residencia"
              className="input"
              onChange={handleChange}
              value={form.residencia}
            />
            <div className="col-span-2">
              <label className="block text-sm font-semibold">Comentario</label>
              <textarea
                name="comentario"
                className="w-full border px-3 py-2 rounded"
                rows={3}
                onChange={handleChange}
                value={form.comentario}
              />
            </div>

            {/* Selección de sectores */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold">Campo de Formación</label>
              <select
                value={selectedFormacion}
                onChange={(e) => {
                  setSelectedFormacion(e.target.value);
                  setSelectedEspecialidad("");
                  setSelectedCurso("");
                }}
                className="input"
              >
                <option value="">Seleccione una opción</option>
                {[...new Set(sectoresDisponibles.map((s) => s.campo_formacion))].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold">Especialidad</label>
              <select
                value={selectedEspecialidad}
                onChange={(e) => {
                  setSelectedEspecialidad(e.target.value);
                  setSelectedCurso("");
                }}
                disabled={!selectedFormacion}
                className="input"
              >
                <option value="">Seleccione una opción</option>
                {[...new Set(
                  sectoresDisponibles
                    .filter((s) => s.campo_formacion === selectedFormacion)
                    .map((s) => s.especialidad)
                )].map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold">Curso</label>
              <select
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
                disabled={!selectedEspecialidad}
                className="input"
              >
                <option value="">Seleccione una opción</option>
                {[...new Set(
                  sectoresDisponibles
                    .filter(
                      (s) =>
                        s.campo_formacion === selectedFormacion &&
                        s.especialidad === selectedEspecialidad
                    )
                    .map((s) => s.curso)
                )].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold">Tipo de Instructor</label>
              <select
                value={statusSector}
                onChange={(e) => setStatusSector(e.target.value as StatusType)}
                className="input"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <button
                type="button"
                onClick={() => {
                  const sector = sectoresDisponibles.find(
                    (s) =>
                      s.campo_formacion === selectedFormacion &&
                      s.especialidad === selectedEspecialidad &&
                      s.curso === selectedCurso
                  );
                  if (sector && !sectoresSeleccionados.some((s) => s.id === sector.id)) {
                    setSectoresSeleccionados([
                      ...sectoresSeleccionados,
                      { ...sector, status: statusSector },
                    ]);
                    setSelectedFormacion("");
                    setSelectedEspecialidad("");
                    setSelectedCurso("");
                    setStatusSector("Experto Empírico");
                  }
                }}
                className="btn-sm bg-blue-600 text-white px-4 py-1 rounded"
                disabled={!selectedFormacion || !selectedEspecialidad || !selectedCurso}
              >
                Agregar Sector
              </button>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Sectores Seleccionados</label>
              <ul className="space-y-2">
                {sectoresSeleccionados.map((sector, index) => (
                  <li
                    key={index}
                    className="border p-2 rounded flex justify-between items-center bg-gray-50"
                  >
                    <span>
                      {sector.campo_formacion} / {sector.especialidad} / {sector.curso} —{" "}
                      <strong>{sector.status}</strong>
                    </span>
                    <button
                      type="button"
                      className="text-red-500 text-xs ml-4"
                      onClick={() => {
                        const nuevos = sectoresSeleccionados.filter((s) => s.id !== sector.id);
                        setSectoresSeleccionados(nuevos);
                      }}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Archivos PDF */}
            {["rfc", "curp", "cedula", "ine", "fotografia"].map((field) => {
              let ref;
              switch (field) {
                case "rfc":
                  ref = rfcRef;
                  break;
                case "curp":
                  ref = curpRef;
                  break;
                case "cedula":
                  ref = cedulaRef;
                  break;
                case "ine":
                  ref = ineRef;
                  break;
                case "fotografia":
                  ref = fotografiaRef;
                  break;
                default:
                  ref = null;
              }

              // Aquí definimos el texto según el campo
              const labelText = field === "fotografia"
                ? `${field.toUpperCase()} (PNG, JPG, JPEG)`
                : `${field.toUpperCase()} (PDF)`;

              return (
                <div key={field} className="col-span-2">
                  <label className="block text-sm font-semibold">{labelText}</label>
                  <input
                    name={field}
                    type="file"
                    accept={field === "fotografia" ? "image/png, image/jpeg, image/jpg" : "application/pdf"}
                    onChange={handleChange}
                    required
                    ref={ref}
                  />
                </div>
              );
            })}

          </div>

          <div className="mt-6 flex justify-between">
            <Link href="/admin" className="btn bg-blue-600 text-white px-6 py-2 rounded-lg">
              Volver
            </Link>
            <button
              type="submit"
              className="btn bg-green-600 text-white px-6 py-2 rounded"
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar Instructor"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
