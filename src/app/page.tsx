// src/app/instructores/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  BookOpen,
  UserPlus,
  Edit,
} from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

// Función auxiliar para asignar colores basados en el status
const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'Maestría':
      return 'bg-green-100 text-green-800';
    case 'Doctorado':
      return 'bg-purple-100 text-purple-800';
    case 'Licenciatura':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800'; // Color por defecto para otros status
  }
};

export default function InstructorDirectoryUI() {
  const router = useRouter();
  const [instructores, setInstructores] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    campo_formacion: "Todos los campos",
    especialidad: "Todas las especialidades",
    curso: "Todos los cursos",
  });
  const [opciones, setOpciones] = useState({
    campo_formacion: [] as string[],
    especialidad: [] as string[],
    curso: [] as string[],
  });
  const [instructorSeleccionado, setInstructorSeleccionado] = useState<any | null>(
    null
  );

  // Efecto para cargar los instructores cuando cambian los filtros
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

  // Efecto para cargar las opciones de filtro
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

  // Manejador de cambios en los filtros
  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFiltros((prevFiltros) => {
      const newFiltros = { ...prevFiltros, [name]: value };
      if (name === "campo_formacion") {
        newFiltros.especialidad = "Todas las especialidades";
        newFiltros.curso = "Todos los cursos";
      } else if (name === "especialidad") {
        newFiltros.curso = "Todos los cursos";
      }
      return newFiltros;
    });
  };

  // Maneja el clic en un instructor para cargar sus detalles
  const handleSeleccionarInstructor = async (instructorId: number) => {
    const res = await fetch(`/api/instructores/${instructorId}`);
    if (res.ok) {
      const data = await res.json();
      setInstructorSeleccionado(data);
    } else {
      console.error("Error al obtener detalles del instructor:", res.statusText);
      setInstructorSeleccionado(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header con filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            {/* Título y icono */}
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Filtro de Instructores</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Buscar por Nombre */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Buscar por Nombre
              </label>
              <div className="flex items-center border rounded px-2 bg-gray-50">
                <Search className="mr-2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  placeholder="E.g. Juan Pérez..."
                  className="w-full p-2 outline-none bg-transparent"
                  value={filtros.nombre}
                  onChange={handleFiltroChange}
                />
              </div>
            </div>
            {/* Campo de Formación */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Campo de Formación
              </label>
              <select
                name="campo_formacion"
                value={filtros.campo_formacion}
                onChange={handleFiltroChange}
                className="p-2 border rounded bg-gray-50"
              >
                <option>Todos los campos</option>
                {opciones.campo_formacion.map((campo, idx) => (
                  <option key={idx}>{campo}</option>
                ))}
              </select>
            </div>
            {/* Especialidad */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Especialidad
              </label>
              <select
                name="especialidad"
                value={filtros.especialidad}
                onChange={handleFiltroChange}
                className="p-2 border rounded bg-gray-50"
                disabled={filtros.campo_formacion === "Todos los campos"}
              >
                <option>Todas las especialidades</option>
                {opciones.especialidad.map((esp, idx) => (
                  <option key={idx}>{esp}</option>
                ))}
              </select>
            </div>
            {/* Curso */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Curso</label>
              <select
                name="curso"
                value={filtros.curso}
                onChange={handleFiltroChange}
                className="p-2 border rounded bg-gray-50"
                disabled={filtros.especialidad === "Todas las especialidades"}
              >
                <option>Todos los cursos</option>
                {opciones.curso.map((curso, idx) => (
                  <option key={idx}>{curso}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contenedor principal del listado y detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna de la izquierda: Listado de instructores */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Instructores ({instructores.length})
            </h2>
            <div className="space-y-4">
              {instructores.length === 0 ? (
                <div className="text-center text-gray-400 italic">
                  No se encontraron instructores.
                </div>
              ) : (
                instructores.map((instructor) => (
                  <button
                    key={instructor.id}
                    onClick={() => handleSeleccionarInstructor(instructor.id)}
                    className={clsx(
                      "w-full text-left p-4 rounded-lg shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                      instructorSeleccionado?.id === instructor.id
                        ? "bg-blue-50 border border-blue-500"
                        : "bg-white border border-gray-200"
                    )}
                  >
                    <InstructorListItem instructor={instructor} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Columna de la derecha: Detalles del instructor seleccionado */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
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

// Sub-componente para cada item del listado
const InstructorListItem = ({ instructor }: { instructor: any }) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return "JP";
    const names = fullName.split(" ");
    let initials = names[0].charAt(0);
    if (names.length > 1) {
      initials += names[1].charAt(0);
    }
    return initials.toUpperCase();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
          {getInitials(instructor.nombre_completo)}
        </div>
        <div className="ml-4">
          <h3 className="font-semibold text-gray-800">{instructor.nombre_completo}</h3>
          {instructor.sectores?.length > 0 && instructor.sectores[0]?.campo_formacion && (
            <p className="text-sm text-gray-500">{instructor.sectores[0].campo_formacion}</p>
          )}
        </div>
      </div>
      {/* LÍNEA MODIFICADA para mostrar el status en un badge con color dinámico */}
      {instructor.sectores?.length > 0 && instructor.sectores[0]?.status && (
        <span className={clsx("text-xs font-semibold px-2 py-1 rounded-full", getStatusColorClass(instructor.sectores[0].status))}>
          {instructor.sectores[0].status}
        </span>
      )}
    </div>
  );
};

// Sub-componente para la vista de detalles
const InstructorDetailView = ({ instructor }: { instructor: any }) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return "JP";
    const names = fullName.split(" ");
    let initials = names[0].charAt(0);
    if (names.length > 1) {
      initials += names[1].charAt(0);
    }
    return initials.toUpperCase();
  };

  // Función para agrupar los cursos por campo de formación y especialidad
  const agruparCursos = (sectores: any[]) => {
    if (!sectores || sectores.length === 0 || sectores[0]?.campo_formacion === null) return {};
    return sectores.reduce((acc, sector) => {
      const { campo_formacion, especialidad, curso } = sector;
      if (!acc[campo_formacion]) acc[campo_formacion] = {};
      if (!acc[campo_formacion][especialidad]) acc[campo_formacion][especialidad] = [];
      acc[campo_formacion][especialidad].push(curso);
      return acc;
    }, {});
  };

  const cursosAgrupados = agruparCursos(instructor.sectores);

  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-bold mb-4">
          {getInitials(instructor.nombre_completo)}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{instructor.nombre_completo}</h3>
        {/* Aquí se muestra el status en la vista de detalles del instructor con color dinámico */}
        {instructor.sectores?.length > 0 && instructor.sectores[0]?.status && (
          <p className={clsx("text-lg font-semibold", getStatusColorClass(instructor.sectores[0].status))}>
            {instructor.sectores[0].status}
          </p>
        )}
      </div>
      <div className="space-y-6">
        {/* 1. Información de Contacto */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Información de Contacto</h4>
          <div className="flex items-center text-gray-700">
            <Building2 className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-semibold">UDC:</span> {instructor.UDC}
          </div>
          <div className="flex items-center text-gray-700">
            <Mail className="w-5 h-5 mr-2 text-gray-500" />
            <span>{instructor.email}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Phone className="w-5 h-5 mr-2 text-gray-500" />
            <span>{instructor.contacto}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            <span>{instructor.residencia}</span>
          </div>
        </div>
        {/* 2. Información Académica */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Información Académica</h4>
          <div className="flex items-center text-gray-700">
            <School className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-semibold">Nivel:</span> {instructor.nivel_maximo_estudios}
          </div>
          <div className="flex items-center text-gray-700">
            <GraduationCap className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-semibold">Área:</span> {instructor.area_estudio}
          </div>
        </div>
        {/* 3. Cursos que Imparte */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Cursos que Imparte</h4>
          {Object.keys(cursosAgrupados).length > 0 ? (
            <div className="mt-4 space-y-4">
              {Object.entries(cursosAgrupados).map(([campo, especialidades]: [string, any]) => (
                <details key={campo} className="bg-gray-50 p-4 rounded-lg cursor-pointer">
                  <summary className="flex items-center text-lg font-semibold text-gray-800">
                    <ChevronRight className="w-5 h-5 mr-2" />
                    {campo}
                  </summary>
                  <div className="ml-6 mt-2 space-y-2">
                    {Object.entries(especialidades).map(([esp, cursos]: [string, any]) => (
                      <details key={esp} className="p-2 rounded-lg cursor-pointer">
                        <summary className="flex items-center font-medium text-gray-700">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          {esp}
                        </summary>
                        <ul className="list-inside ml-6 mt-1 text-sm text-gray-600">
                          {cursos.map((curso: string, idx: number) => (
                            <li key={idx} className="my-1">
                              <span>{curso}</span>
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
            <p className="text-sm text-gray-400 mt-2">No hay cursos asignados a este instructor.</p>
          )}
        </div>
        {/* 4. Comentarios */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Comentarios</h4>
          <p className="text-sm text-gray-600 italic mt-2">
            {instructor.descripcion || "No hay comentarios disponibles."}
          </p>
        </div>
        {/* 5. Documentación */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Documentación</h4>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <DocumentoCard nombre="Fotografía" />
            <DocumentoCard nombre="INE" />
            <DocumentoCard nombre="Cédula" />
            <DocumentoCard nombre="RFC" />
            <DocumentoCard nombre="CURP" />
          </div>
          <button className="w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition mt-4">
            <Download className="inline-block w-4 h-4 mr-2" />
            Descargar Todo
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentoCard = ({ nombre }: { nombre: string }) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
      <span className="text-sm text-gray-700">{nombre}</span>
      <Download className="w-4 h-4 text-gray-500" />
    </div>
  );
};