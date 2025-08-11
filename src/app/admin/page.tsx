"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Download,
  UserPlus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

// Tipos para los datos de los instructores
interface Instructor {
  id?: number;
  nombre_completo: string;
  rfc: string;
  contacto: string;
  UDC: string;
  nivel_maximo_estudios: string;
  area_estudio: string;
  residencia: string;
  email: string;
  status?: string;
  descripcion?: string;
  sectores: string[];
  especialidades: string[];
  cursos?: string[];
}

export default function InstructorDirectoryUI() {
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true); // Nuevo estado para la carga
  const [error, setError] = useState<string | null>(null); // Nuevo estado para errores
  const [instructorSeleccionado, setInstructorSeleccionado] = useState<Instructor | null>(null);

  // Estados para la nueva funcionalidad de admin
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [instructorToDeleteId, setInstructorToDeleteId] = useState<number | null>(null);

  // Nuevo: Función para obtener los datos de la API
  const fetchInstructores = async () => {
    setLoading(true);
    setError(null);
    try {
      // Reemplaza esta URL con la de tu endpoint real
      const res = await fetch("/api/instructors");
      if (!res.ok) {
        throw new Error("No se pudieron cargar los instructores.");
      }
      const data: Instructor[] = await res.json();
      setInstructores(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los instructores al inicio
  useEffect(() => {
    fetchInstructores();
  }, []);

  // Maneja el clic en un instructor para cargar sus detalles
  const handleSeleccionarInstructor = (instructor: Instructor) => {
    setInstructorSeleccionado(instructor);
  };

  // Lógica para el modal de Crear/Editar
  const openModalForCreate = () => {
    setEditingInstructor({
      nombre_completo: "",
      rfc: "",
      contacto: "",
      UDC: "",
      nivel_maximo_estudios: "",
      area_estudio: "",
      residencia: "",
      email: "",
      sectores: [],
      especialidades: [],
    });
    setShowModal(true);
  };

  const openModalForEdit = (item: Instructor) => {
    setEditingInstructor({ ...item });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInstructor(null);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;

    try {
      const method = editingInstructor.id ? "PUT" : "POST";
      const url = editingInstructor.id ? `/api/instructors/${editingInstructor.id}` : "/api/instructors";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingInstructor),
      });

      if (!res.ok) {
        throw new Error(`Error al ${editingInstructor.id ? "actualizar" : "crear"} el instructor.`);
      }

      // Después de una operación exitosa, volvemos a cargar los datos
      await fetchInstructores();
      closeModal();

      // Actualizamos el instructor seleccionado si es el que se acaba de editar
      if (editingInstructor.id) {
        setInstructorSeleccionado(editingInstructor);
      }

    } catch (err) {
      console.error(err);
      alert("Hubo un error al guardar los datos.");
    }
  };

  // Lógica para el modal de confirmación de eliminación
  const openConfirmModal = (id: number) => {
    setInstructorToDeleteId(id);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setInstructorToDeleteId(null);
    setShowConfirmModal(false);
  };

  const handleDelete = async () => {
    if (instructorToDeleteId === null) return;

    try {
      const res = await fetch(`/api/instructors/${instructorToDeleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar el instructor.");
      }

      // Volvemos a cargar la lista y limpiamos el instructor seleccionado
      await fetchInstructores();
      setInstructorSeleccionado(null);
      closeConfirmModal();

    } catch (err) {
      console.error(err);
      alert("Hubo un error al eliminar el instructor.");
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
              <h1 className="text-2xl font-bold text-gray-800">Directorio de Instructores</h1>
            </div>

            {/* Botones agregados */}
            <div className="flex gap-4 mt-4 md:mt-0">
              <button
                onClick={openModalForCreate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Dar de alta instructor
              </button>
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
              {loading && <div className="text-center text-gray-500">Cargando instructores...</div>}
              {error && <div className="text-center text-red-500">Error: {error}</div>}
              {!loading && !error && instructores.length === 0 ? (
                <div className="text-center text-gray-400 italic">
                  No se encontraron instructores.
                </div>
              ) : (
                instructores.map((instructor) => (
                  <div
                    key={instructor.id}
                    className={clsx(
                      "w-full text-left p-4 rounded-lg shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative",
                      instructorSeleccionado?.id === instructor.id
                        ? "bg-blue-50 border border-blue-500"
                        : "bg-white border border-gray-200"
                    )}
                  >
                    <button
                      onClick={() => handleSeleccionarInstructor(instructor)}
                      className="w-full text-left"
                    >
                      <InstructorListItem instructor={instructor} />
                    </button>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => openModalForEdit(instructor)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => instructor.id && openConfirmModal(instructor.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
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
                Selecciona un instructor o agrega uno nuevo.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Crear/Editar */}
      {showModal && editingInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleModalSubmit}
            className="bg-white rounded-md p-6 w-full max-w-md shadow-lg relative"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
            <h2 className="text-lg font-bold mb-4">
              {editingInstructor.id ? "Editar Instructor" : "Agregar Instructor"}
            </h2>
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="Nombre completo"
              value={editingInstructor.nombre_completo}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, nombre_completo: e.target.value })
              }
              required
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="RFC"
              value={editingInstructor.rfc}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, rfc: e.target.value })
              }
              required
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="Teléfono / contacto"
              value={editingInstructor.contacto}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, contacto: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="UDC"
              value={editingInstructor.UDC}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, UDC: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="Nivel de estudios"
              value={editingInstructor.nivel_maximo_estudios}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, nivel_maximo_estudios: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="Área de estudio"
              value={editingInstructor.area_estudio}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, area_estudio: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="Residencia"
              value={editingInstructor.residencia}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, residencia: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
              placeholder="Email"
              value={editingInstructor.email}
              onChange={(e) =>
                setEditingInstructor({ ...editingInstructor, email: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-2 rounded-md"
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
              className="w-full border p-2 mb-2 rounded-md"
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
                onClick={closeModal}
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

      {/* Modal de confirmación para eliminar */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-bold mb-2">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro de que quieres eliminar este instructor? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeConfirmModal}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componente para cada item del listado
const InstructorListItem = ({ instructor }: { instructor: any }) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return "JP";
    const names = fullName.split(" ");
    let initials = names[0]?.charAt(0) || '';
    if (names.length > 1) {
      initials += names[1]?.charAt(0) || '';
    }
    return initials.toUpperCase();
  };

  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
        {getInitials(instructor.nombre_completo)}
      </div>
      <div className="ml-4">
        <h3 className="font-semibold text-gray-800">{instructor.nombre_completo}</h3>
        {instructor.sectores?.length > 0 && (
          <p className="text-sm text-gray-500">{instructor.sectores[0]}</p>
        )}
      </div>
    </div>
  );
};

// Sub-componente para la vista de detalles con orden ajustado
const InstructorDetailView = ({ instructor }: { instructor: any }) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return "JP";
    const names = fullName.split(" ");
    let initials = names[0]?.charAt(0) || '';
    if (names.length > 1) {
      initials += names[1]?.charAt(0) || '';
    }
    return initials.toUpperCase();
  };

  const agruparCursos = (sectores: any[]) => {
    if (!sectores || sectores.length === 0) return {};
    return sectores.reduce((acc, sector) => {
      // Nota: El tipo 'sector' en el JSON original no coincide
      // con la estructura que se usa aquí (campo_formacion, especialidad, curso).
      // Aquí se asume una estructura más compleja para el ejemplo.
      // Deberás ajustar esta lógica según cómo guardes los datos en tu DB.

      // Si `sectores` es un array de strings (como en el código original),
      // esta lógica no funcionará como está.
      // Para este ejemplo, lo ajustaremos para mostrar las especialidades.

      // Si tu API retorna un array de strings, puedes mostrarlo así:
      return { "Especialidades": { "Especialidades": instructor.especialidades } };

      // La lógica original es para un objeto más complejo, por lo que la he comentado.
      // if (!acc[campo_formacion]) acc[campo_formacion] = {};
      // if (!acc[campo_formacion][especialidad]) acc[campo_formacion][especialidad] = [];
      // acc[campo_formacion][especialidad].push(curso);
      // return acc;
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
        {instructor.sectores?.length > 0 && (
          <p className="text-lg text-gray-500">{instructor.sectores[0]}</p>
        )}
        <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {instructor.status || "Formal"}
        </span>
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

        {/* 3. Cursos que Imparte (adaptado para el código original) */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 border-b pb-2">Especialidades</h4>
          {instructor.especialidades && instructor.especialidades.length > 0 ? (
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
              {instructor.especialidades.map((esp: string, idx: number) => (
                <li key={idx} className="flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  {esp}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No hay especialidades asignadas a este instructor.</p>
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