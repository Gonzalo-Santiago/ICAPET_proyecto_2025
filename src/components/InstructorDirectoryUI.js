export default function InstructorDirectoryUI({ instructors }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {instructors.map((inst) => (
        <div key={inst.id} className="border rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">{inst.nombre}</h3>
          <p className="text-sm text-gray-600">{inst.correo}</p>
          <p className="text-sm">{inst.telefono}</p>

          {inst.sectores?.length > 0 && (
            <p className="text-sm mt-2">
              <span className="font-semibold">Sectores:</span>{" "}
              {inst.sectores.join(", ")}
            </p>
          )}

          {inst.cursos?.length > 0 && (
            <p className="text-sm mt-1">
              <span className="font-semibold">Cursos:</span>{" "}
              {inst.cursos.join(", ")}
            </p>
          )}

          <span
            className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
              inst.estatus === "activo"
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {inst.estatus}
          </span>
        </div>
      ))}
    </div>
  );
}
