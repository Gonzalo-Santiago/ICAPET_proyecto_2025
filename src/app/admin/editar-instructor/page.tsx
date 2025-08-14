'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Sector { id: number; campo_formacion: string; especialidad: string; curso: string; }
interface SectorSeleccionado extends Sector { status: string; }

const STATUS_OPTIONS = [
  "Experto Impírico",
  "Experto con educación NO formal",
  "Experto con Educación formal",
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Instructor en Territorios Bienestar",
  "Capacitador de cursos Mujeres Transformando su Futuro",
] as const;

export default function EditarInstructor() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [form, setForm] = useState<any>({});
  const [sectoresDisponibles, setSectoresDisponibles] = useState<Sector[]>([]);
  const [sectoresSeleccionados, setSectoresSeleccionados] = useState<SectorSeleccionado[]>([]);
  const [selectedFormacion, setSelectedFormacion] = useState("");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  const [statusSector, setStatusSector] = useState<typeof STATUS_OPTIONS[number]>(STATUS_OPTIONS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function cargarDatos() {
      const res = await fetch(`/api/instructores/${id}`);
      const json = await res.json();
      setForm(json.instructor);
      setSectoresSeleccionados(json.sectores || []);
      setLoading(false);
    }

    async function cargarSectores() {
      const res = await fetch('/api/sectores');
      const data = await res.json();
      setSectoresDisponibles(data);
    }

    cargarDatos();
    cargarSectores();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v && data.append(k, v as Blob | string));
    data.append('sectores', JSON.stringify(sectoresSeleccionados));

    const res = await fetch(`/api/instructores/${id}`, { method: 'PUT', body: data });
    if (res.ok) {
      alert('Instructor actualizado');
      router.back();
    } else {
      alert('Error al actualizar');
    }
  };

  if (!id) return <p>ID no proporcionado</p>;
  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Instructor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Repite tantos inputs como campos hay en form */}
        <input name="nombre" value={form.nombre || ''} onChange={handleChange} placeholder="Nombre" className="input" required />
        <input name="apellido_paterno" value={form.apellido_paterno || ''} onChange={handleChange} placeholder="Apellido Paterno" className="input" required />
        <input name="apellido_materno" value={form.apellido_materno || ''} onChange={handleChange} placeholder="Apellido Materno" className="input" required />
        <input name="email" type="email" value={form.email || ''} onChange={handleChange} placeholder="Email" className="input" required />
        <input name="telefono" value={form.telefono || ''} onChange={handleChange} placeholder="Teléfono" className="input" />
        <textarea name="comentario" value={form.comentario || ''} onChange={handleChange} placeholder="Comentario" className="input" />
        
        <label>RFC (PDF)</label>
        <input name="rfc" type="file" accept="application/pdf" onChange={handleChange} />
        <label>CURP (PDF)</label>
        <input name="curp" type="file" accept="application/pdf" onChange={handleChange} />
        <label>CÉDULA (PDF)</label>
        <input name="cedula" type="file" accept="application/pdf" onChange={handleChange} />
        <label>INE (PDF)</label>
        <input name="ine" type="file" accept="application/pdf" onChange={handleChange} />
        <label>Fotografía (PDF)</label>
        <input name="fotografia" type="file" accept="application/pdf" onChange={handleChange} />

        {/* Gestión de sectores */}
        <div>
          <select value={selectedFormacion} onChange={e => { setSelectedFormacion(e.target.value); setSelectedEspecialidad(''); setSelectedCurso(''); }} className="input">
            <option value="">Campo de Formación</option>
            {[...new Set(sectoresDisponibles.map(s => s.campo_formacion))].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={selectedEspecialidad} onChange={e => { setSelectedEspecialidad(e.target.value); setSelectedCurso(''); }} disabled={!selectedFormacion} className="input">
            <option value="">Especialidad</option>
            {[...new Set(sectoresDisponibles.filter(s => s.campo_formacion === selectedFormacion).map(s => s.especialidad))].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={selectedCurso} onChange={e => setSelectedCurso(e.target.value)} disabled={!selectedEspecialidad} className="input">
            <option value="">Curso</option>
            {[...new Set(sectoresDisponibles.filter(s => s.campo_formacion === selectedFormacion && s.especialidad === selectedEspecialidad).map(s => s.curso))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusSector} onChange={e => setStatusSector(e.target.value as any)} className="input">
            {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <button type="button" onClick={() => {
            const sec = sectoresDisponibles.find(s => s.campo_formacion === selectedFormacion && s.especialidad === selectedEspecialidad && s.curso === selectedCurso);
            if (sec && !sectoresSeleccionados.some(s => s.id === sec.id)) {
              setSectoresSeleccionados([...sectoresSeleccionados, {...sec, status: statusSector}]);
              setSelectedFormacion(''); setSelectedEspecialidad(''); setSelectedCurso(''); setStatusSector(STATUS_OPTIONS[0]);
            }
          }} disabled={!selectedCurso} className="btn">
            Agregar Sector
          </button>
          <ul className="mt-2">
            {sectoresSeleccionados.map((s, i) => (
              <li key={i} className="flex justify-between">
                <span>{`${s.campo_formacion} / ${s.especialidad} / ${s.curso} — ${s.status}`}</span>
                <button type="button" onClick={() => setSectoresSeleccionados(sectoresSeleccionados.filter(x => x.id !== s.id))} className="text-red-500">Eliminar</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between">
          <Link href="/admin" className="text-blue-500">Cancelar</Link>
          <button type="submit" className="btn bg-blue-600 text-white">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
}
