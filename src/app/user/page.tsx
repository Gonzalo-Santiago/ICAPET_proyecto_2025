// src/app/instructores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";

import {
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Download,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton"; // <--- AÑADIDO

// Función auxiliar para asignar colores basados en el status
const getStatusColorClass = (status: string) => {
  switch (status) {
    case "Maestría":
      return "bg-green-200 text-green-900";
    case "Doctorado":
      return "bg-purple-200 text-purple-900";
    case "Licenciatura":
      return "bg-yellow-200 text-yellow-900";
    default:
      return "bg-blue-200 text-blue-900";
  }
};

export default function InstructorDirectoryUI() {
  const router = useRouter();
  const detallesRef = useRef<HTMLDivElement>(null);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    comentario: "", // <-- Esto soluciona el warning
    campo_formacion: "Todos los campos",
    especialidad: "Todas las especialidades",
    curso: "",
  });
  const [opciones, setOpciones] = useState({
    campo_formacion: [] as string[],
    especialidad: [] as string[],
    curso: [] as string[],
  });
  const [instructorSeleccionado, setInstructorSeleccionado] = useState<any | null>(null);

  useEffect(() => {
    const fetchInstructores = async () => {
      const params = new URLSearchParams(filtros as any);
      const res = await fetch(`/api/instructores?${params.toString()}`);
      if (!res.ok) {
        console.error("Error al obtener instructores:", res.statusText);
        setInstructores([]);
        return;
      }
      const data = await res.json();
      setInstructores(data);
    };
    fetchInstructores();
  }, [filtros]);

  useEffect(() => {
    const fetchOpciones = async () => {
      const params = new URLSearchParams();
      if (filtros.campo_formacion !== "Todos los campos") {
        params.append("campo_formacion", filtros.campo_formacion);
      }
      if (filtros.especialidad !== "Todas las especialidades") {
        params.append("especialidad", filtros.especialidad);
      }
      const res = await fetch(`/api/filtros?${params.toString()}`);
      if (!res.ok) {
        console.error("Error al obtener filtros:", res.statusText);
        setOpciones({ campo_formacion: [], especialidad: [], curso: [] });
        return;
      }
      const data = await res.json();
      setOpciones(data);
    };
    fetchOpciones();
  }, [filtros.campo_formacion, filtros.especialidad]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => {
      const newFiltros = { ...prev, [name]: value };
      if (name === "campo_formacion") {
        newFiltros.especialidad = "Todas las especialidades";
        newFiltros.curso = "Todos los cursos";
      } else if (name === "especialidad") {
        newFiltros.curso = "Todos los cursos";
      }
      return newFiltros;
    });
  };

  /*const handleSeleccionarInstructor = async (id: number) => {
    const res = await fetch(`/api/instructores/${id}`);
    if (res.ok) {
      const data = await res.json();
      setInstructorSeleccionado(data);
    } else {
      console.error("Error al obtener detalles del instructor:", res.statusText);
      setInstructorSeleccionado(null);
    }
  };*/

  const handleSeleccionarInstructor = async (id: number) => {
    const res = await fetch(`/api/instructores/${id}`);
    if (res.ok) {
      const data = await res.json();
      setInstructorSeleccionado(data);

      // Hacer scroll suave al contenedor de detalles
      setTimeout(() => {
        detallesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100); // Espera un poco a que el componente se actualice
    } else {
      console.error("Error al obtener detalles del instructor:", res.statusText);
      setInstructorSeleccionado(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Botón de Logout */}
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>

        {/* Header con filtros */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Filtro de Instructores</h1>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FiltroInput
              icon={<Search className="w-4 h-4 text-gray-400" />}
              label="Buscar por Nombre"
              name="nombre"
              value={filtros.nombre}
              onChange={handleFiltroChange}
              placeholder="E.g. Juan Pérez..."
            />

            <FiltroInput
              icon={<Search className="w-4 h-4 text-gray-400" />}
              label="Buscar por Curso"
              name="curso"
              value={filtros.curso}
              onChange={handleFiltroChange}
              placeholder="Ej. Panadería..."
            />


            <FiltroInput
              icon={<Search className="w-4 h-4 text-gray-400" />}
              label="Buscar por Comentario"
              name="comentario"
              value={filtros.comentario}
              onChange={handleFiltroChange}
              placeholder="Ej. Experiencia en..."
            />

            <FiltroSelect
              label="Campo de Formación"
              name="campo_formacion"
              value={filtros.campo_formacion}
              onChange={handleFiltroChange}
              options={["Todos los campos", ...opciones.campo_formacion]}
            />
            <FiltroSelect
              label="Especialidad"
              name="especialidad"
              value={filtros.especialidad}
              onChange={handleFiltroChange}
              disabled={filtros.campo_formacion === "Todos los campos"}
              options={["Todas las especialidades", ...opciones.especialidad]}
            />
            <FiltroSelect
              label="Curso"
              name="curso"
              value={filtros.curso}
              onChange={handleFiltroChange}
              disabled={filtros.especialidad === "Todas las especialidades"}
              options={["Todos los cursos", ...opciones.curso]}
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Lista de instructores */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Total de Instructores ({instructores.length})
            </h2>
            <div className="space-y-4">
              {instructores.length === 0 ? (
                <p className="text-center text-gray-400 italic">
                  No se encontraron instructores.
                </p>
              ) : (
                instructores.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => handleSeleccionarInstructor(inst.id)}
                    className={clsx(
                      "w-full text-left p-4 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-[1.01]",
                      instructorSeleccionado?.id === inst.id
                        ? "bg-blue-50 border-blue-400"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <InstructorListItem instructor={inst} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detalles */}
          <div
            ref={detallesRef}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2"
          >
            {instructorSeleccionado ? (
              <InstructorDetailView instructor={instructorSeleccionado} />
            ) : (
              <div className="text-center text-gray-400 italic mt-16">
                Selecciona un instructor para ver sus detalles.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares para filtros
const FiltroInput = ({ icon, label, ...props }: any) => (
  <div className="flex flex-col">
    <label className="text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <div className="flex items-center border border-gray-200 rounded-full px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-400 transition">
      {icon}
      <input className="w-full p-2 bg-transparent outline-none" {...props} />
    </div>
  </div>
);

const FiltroSelect = ({ label, options, ...props }: any) => (
  <div className="flex flex-col">
    <label className="text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <select
      className="p-2 border border-gray-200 rounded-full bg-gray-50 focus:ring-2 focus:ring-blue-400 transition"
      {...props}
    >
      {options.map((opt: string, idx: number) => (
        <option key={idx}>{opt}</option>
      ))}
    </select>
  </div>
);

// Lista
const InstructorListItem = ({ instructor }: { instructor: any }) => {
  const getInitials = (name: string) => {
    if (!name) return "NA";
    const parts = name.split(" ");
    return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  };
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
        {getInitials(instructor.nombre_completo)}
      </div>
      <div className="ml-4">
        <h3 className="font-semibold text-gray-900">{instructor.nombre_completo}</h3>
      </div>
    </div>
  );
};

type CursoConStatus = {
  curso: string;
  status: string;
};

type CursosAgrupados = Record<string, Record<string, CursoConStatus[]>>;

type Instructor = {
  id: number;
  nombre_completo: string;
  UDC: string;
  email: string;
  contacto: string;
  residencia: string;
  nivel_maximo_estudios: string;
  area_estudio: string;
  descripcion?: string;
  sectores: {
    campo_formacion: string;
    especialidad: string;
    curso: string;
    status: string;
  }[];
};

// Detalles
const InstructorDetailView = ({ instructor }: { instructor: Instructor }) => {
  const getInitials = (name: string) => {
    if (!name) return "NA";
    const parts = name.split(" ");
    return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  };

  const agruparCursos = (sectores: Instructor["sectores"]): CursosAgrupados => {
    if (!sectores?.length || sectores[0]?.campo_formacion === null) return {};

    return sectores.reduce((acc, s) => {
      const { campo_formacion, especialidad, curso, status } = s;
      acc[campo_formacion] ??= {};
      acc[campo_formacion][especialidad] ??= [];
      acc[campo_formacion][especialidad].push({ curso, status });
      return acc;
    }, {} as CursosAgrupados);
  };


  const cursosAgrupados = agruparCursos(instructor.sectores);

  const handleDescargarTodo = async () => {
    const nombreArchivo = `instructor_${instructor.nombre_completo.replace(/\s+/g, "_")}`;
    const url = `/api/instructores/${instructor.id}/archivo/zip`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Error al generar ZIP: ${errorText}`);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${nombreArchivo}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al descargar ZIP:", error);
      alert("Ocurrió un error inesperado al intentar descargar los archivos.");
    }
  };


  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-3xl font-bold mb-4">
          {getInitials(instructor.nombre_completo)}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{instructor.nombre_completo}</h3>
      </div>

      {/* Información de contacto */}
      <Section title="Información de Contacto">
        <InfoItem icon={<Building2 />} label="UDC" value={instructor.UDC} />
        <InfoItem icon={<Mail />} value={instructor.email} />
        <InfoItem icon={<Phone />} value={instructor.contacto} />
        <InfoItem icon={<MapPin />} value={instructor.residencia} />
      </Section>

      {/* Académica */}
      <Section title="Información Académica">
        <InfoItem icon={<School />} label="Nivel" value={instructor.nivel_maximo_estudios} />
        <InfoItem icon={<GraduationCap />} label="Área" value={instructor.area_estudio} />
      </Section>

      {/* Cursos */}
      <Section title="Cursos que Imparte">
        {Object.keys(cursosAgrupados).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(cursosAgrupados).map(([campo, especialidades]) => (
              <details key={campo} className="bg-gray-50 p-4 rounded-lg">
                <summary className="flex items-center font-semibold text-gray-800 cursor-pointer">
                  <ChevronRight className="w-5 h-5 mr-2" /> {campo}
                </summary>
                <div className="ml-6 mt-2 space-y-2">
                  {Object.entries(especialidades).map(([esp, cursos]) => (
                    <details key={esp} className="p-2 rounded-lg">
                      <summary className="flex items-center text-gray-700 cursor-pointer">
                        <ChevronRight className="w-4 h-4 mr-2" /> {esp}
                      </summary>
                      <ul className="ml-6 mt-1 text-sm text-gray-600">
                        {cursos.map((c, idx) => (
                          <li key={idx} className="flex justify-between items-center my-1">
                            <span>{c.curso}</span>
                            {c.status && (
                              <span
                                className={clsx(
                                  "text-xs font-semibold px-2 py-1 rounded-full",
                                  getStatusColorClass(c.status)
                                )}
                              >
                                {c.status}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No hay cursos asignados.</p>
        )}
      </Section>

      {/* Comentarios */}
      <Section title="Comentarios">
        <p className="text-sm text-gray-600 italic">
          {instructor.descripcion || "No hay comentarios disponibles."}
        </p>
      </Section>

      {/* Documentación */}
      <Section title="Documentación">
        <div className="grid grid-cols-2 gap-4">
          {[
            { nombre: "Fotografía", tipo: "fotografia" },
            { nombre: "INE", tipo: "ine" },
            { nombre: "Cédula", tipo: "cedula" },
            { nombre: "RFC", tipo: "rfc" },
            { nombre: "CURP", tipo: "curp" },
          ].map((doc) => (
            <DocumentoCard
              key={doc.tipo}
              nombre={doc.nombre}
              tipo={doc.tipo}
              idInstructor={instructor.id}
            />
          ))}
        </div>
        <button
          onClick={handleDescargarTodo}
          className="w-full mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition"
        >
          <Download className="inline-block w-4 h-4 mr-2" />
          Descargar Todo
        </button>
      </Section>
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <div>
    <h4 className="text-xl font-bold text-gray-900 border-b pb-2 mb-3">{title}</h4>
    {children}
  </div>
);

const InfoItem = ({ icon, label, value }: any) => (
  <div className="flex items-center text-gray-700 mb-1">
    <span className="w-5 h-5 mr-2 text-gray-500">{icon}</span>
    {label && <span className="font-semibold mr-1">{label}:</span>}
    <span>{value}</span>
  </div>
);

const DocumentoCard = ({
  nombre,
  tipo,
  idInstructor,
}: {
  nombre: string;
  tipo: string;
  idInstructor: number;
}) => {
  const handleDescarga = () => {
    const url = `/api/instructores/${idInstructor}/archivo/${tipo}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleDescarga}
      className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
    >
      <span className="text-sm text-gray-700">{nombre}</span>
      <Download className="w-4 h-4 text-gray-500" />
    </button>
  );
};