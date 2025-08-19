'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Tipos
interface Sector { id: number; campo_formacion: string; especialidad: string; curso: string; }
interface SectorSeleccionado extends Sector { status: string; }
interface Instructor {
  id: string;
  nombre: string; apellido_paterno: string; apellido_materno: string;
  email: string; telefono: string; comentario: string;
  nivel_estudio?: string; area_estudio?: string; UDC?: string; residencia?: string;
  rfc?: string | File; curp?: string | File; cedula?: string | File; ine?: string | File; fotografia?: string | File;
}

const STATUS_OPTIONS = [
  'Experto Impírico',
  'Experto con educación NO formal',
  'Experto con Educación formal',
  'Licenciatura',
  'Maestría',
  'Doctorado',
  'Instructor en Territorios Bienestar',
  'Capacitador de cursos Mujeres Transformando su Futuro',
] as const;

type StatusType = typeof STATUS_OPTIONS[number];

export default function EditarInstructor() {
  const sp = useSearchParams();
  const routeId = sp.get('id') ?? '';
  const router = useRouter();

  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [sectoresDisponibles, setSectoresDisponibles] = useState<Sector[]>([]);

  const [selectedInstructorId, setSelectedInstructorId] = useState<string>(routeId);
  const [form, setForm] = useState<Instructor>({
    id: '', nombre: '', apellido_paterno: '', apellido_materno: '', email: '', telefono: '', comentario: '',
    nivel_estudio: '', area_estudio: '', UDC: '', residencia: '',
  });
  const [sectoresSel, setSectoresSel] = useState<SectorSeleccionado[]>([]);

  const [statusNew, setStatusNew] = useState<StatusType>(STATUS_OPTIONS[0]);
  const [filtroFormacion, setFiltroFormacion] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Descargas: construir URLs de descarga de blobs por tipo
  const downloadUrls = useMemo(() => {
    if (!form.id) return {} as Record<string, string>;
    return {
      rfc: `/api/instructores/${form.id}/archivo/rfc`,
      curp: `/api/instructores/${form.id}/archivo/curp`,
      cedula: `/api/instructores/${form.id}/archivo/cedula`,
      ine: `/api/instructores/${form.id}/archivo/ine`,
      fotografia: `/api/instructores/${form.id}/archivo/fotografia`,
    };
  }, [form.id]);

  useEffect(() => {
    (async () => {
      try {
        const [ri, rs] = await Promise.all([
          fetch('/api/instructores'),
          fetch('/api/sectores'),
        ]);
        const [instructoresData, sectoresData] = await Promise.all([ri.json(), rs.json()]);
        setInstructores(instructoresData ?? []);
        setSectoresDisponibles(sectoresData ?? []);
      } catch (e) {
        console.error(e);
        setMsg('Error al cargar listas iniciales');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cargar detalle al seleccionar
  useEffect(() => {
    if (!selectedInstructorId) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/instructores/${selectedInstructorId}`);
        if (!r.ok) throw new Error('No se pudo cargar el instructor');
        const d = await r.json();

        setForm({
          id: d.id?.toString() ?? '',
          nombre: d.nombre ?? '',
          apellido_paterno: d.apellido_paterno ?? '',
          apellido_materno: d.apellido_materno ?? '',
          email: d.email ?? '',
          telefono: d.contacto ?? '',
          comentario: d.descripcion ?? '',
          nivel_estudio: d.nivel_maximo_estudios ?? '',
          area_estudio: d.area_estudio ?? '',
          UDC: d.UDC ?? '',
          residencia: d.residencia ?? '',
          // mantener base64 en estado si quisieras vista previa inline; no se usa al enviar
          rfc: d.rfc_base64 ?? '',
          curp: d.curp_base64 ?? '',
          cedula: d.cedula_base64 ?? '',
          ine: d.ine_base64 ?? '',
          fotografia: d.fotografia_base64 ?? '',
        });
        setSectoresSel(d.sectores ?? []);
        setMsg('Instructor cargado');
        setIsError(false);
      } catch (e) {
        console.error(e);
        setMsg('Error al cargar el instructor');
        setIsError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedInstructorId]);

  const onChangeText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setForm((f) => ({ ...f, [name]: files[0] }));
    }
  };

  // Helpers de filtros
  const formaciones = useMemo(
    () => Array.from(new Set(sectoresDisponibles.map((s) => s.campo_formacion))).sort(),
    [sectoresDisponibles]
  );
  const especialidades = useMemo(
    () => Array.from(new Set(sectoresDisponibles.filter(s => !filtroFormacion || s.campo_formacion === filtroFormacion).map((s) => s.especialidad))).sort(),
    [sectoresDisponibles, filtroFormacion]
  );
  const cursos = useMemo(
    () => Array.from(new Set(sectoresDisponibles.filter(s => (!filtroFormacion || s.campo_formacion === filtroFormacion) && (!filtroEspecialidad || s.especialidad === filtroEspecialidad)).map((s) => s.curso))).sort(),
    [sectoresDisponibles, filtroFormacion, filtroEspecialidad]
  );

  const agregarSector = () => {
    const sec = sectoresDisponibles.find(
      (s) => s.campo_formacion === filtroFormacion && s.especialidad === filtroEspecialidad && s.curso === filtroCurso
    );
    if (!sec) return;
    if (sectoresSel.some((x) => x.id === sec.id)) return;
    setSectoresSel((arr) => [...arr, { ...sec, status: statusNew }]);
    setFiltroFormacion(''); setFiltroEspecialidad(''); setFiltroCurso(''); setStatusNew(STATUS_OPTIONS[0]);
  };
  const eliminarSector = (id: number) => setSectoresSel((arr) => arr.filter((x) => x.id !== id));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructorId) {
      setIsError(true); setMsg('Selecciona un instructor'); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Solo enviar archivos si son File (para no sobreescribir innecesariamente)
      (['rfc','curp','cedula','ine','fotografia'] as const).forEach((k) => {
        const v: any = (form as any)[k];
        if (v instanceof File) fd.append(k, v);
      });
      // Campos de texto
      const keys: (keyof Instructor)[] = ['nombre','apellido_paterno','apellido_materno','email','telefono','comentario','nivel_estudio','area_estudio','UDC','residencia'];
      for (const k of keys) {
        const v = (form as any)[k];
        fd.append(k as string, v ?? '');
      }
      fd.append('sectores', JSON.stringify(sectoresSel.map(s => ({ id: s.id, status: s.status }))));

      const r = await fetch(`/api/instructores/${selectedInstructorId}`, { method: 'PUT', body: fd });
      if (!r.ok) {
        const er = await r.json().catch(() => ({}));
        throw new Error(er.message || 'Error al guardar');
      }
      setMsg('Cambios guardados');
      setIsError(false);
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      console.error(e);
      setMsg(e.message || 'Error al guardar');
      setIsError(true);
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Cargando…</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl bg-white shadow rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-1">Editar Instructor</h1>
        <p className="text-gray-500 mb-6">Actualiza datos personales, sectores y documentos.</p>

        {msg && (
          <div className={`mb-4 rounded-lg px-4 py-3 ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>
        )}

        {/* Selector de instructor */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Seleccionar Instructor</label>
          <select value={selectedInstructorId} onChange={(e)=>setSelectedInstructorId(e.target.value)} className="w-full border rounded-lg p-2">
            <option value="">-- Seleccionar --</option>
            {instructores.map((i) => (
              <option key={i.id} value={i.id}>{`${i.nombre} ${i.apellido_paterno} ${i.apellido_materno}`}</option>
            ))}
          </select>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Datos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input className="border rounded-lg p-3" placeholder="Nombre" name="nombre" value={form.nombre} onChange={onChangeText} required />
            <input className="border rounded-lg p-3" placeholder="Apellido paterno" name="apellido_paterno" value={form.apellido_paterno} onChange={onChangeText} required />
            <input className="border rounded-lg p-3" placeholder="Apellido materno" name="apellido_materno" value={form.apellido_materno} onChange={onChangeText} required />
            <input className="border rounded-lg p-3" placeholder="Email" type="email" name="email" value={form.email} onChange={onChangeText} required />
            <input className="border rounded-lg p-3" placeholder="Teléfono" name="telefono" value={form.telefono} onChange={onChangeText} />
            <input className="border rounded-lg p-3" placeholder="Nivel de estudio" name="nivel_estudio" value={form.nivel_estudio} onChange={onChangeText} />
            <input className="border rounded-lg p-3" placeholder="Área de estudio" name="area_estudio" value={form.area_estudio} onChange={onChangeText} />
            <input className="border rounded-lg p-3" placeholder="UDC" name="UDC" value={form.UDC} onChange={onChangeText} />
            <input className="border rounded-lg p-3" placeholder="Residencia" name="residencia" value={form.residencia} onChange={onChangeText} />
            <textarea className="border rounded-lg p-3 lg:col-span-3" rows={3} placeholder="Comentario" name="comentario" value={form.comentario} onChange={onChangeText} />
          </div>

          {/* Documentos */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Documentos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['rfc','curp','cedula','ine','fotografia'] as const).map((k) => (
                <div key={k} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium uppercase">{k}</span>
                    {form.id && (
                      <a className="text-sm text-blue-600 hover:underline" href={(downloadUrls as any)[k]}>
                        Descargar
                      </a>
                    )}
                  </div>
                  <input name={k} type="file" onChange={onChangeFile} accept={k==='fotografia' ? 'image/*,application/pdf' : 'application/pdf'} className="block w-full text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Sectores */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Sectores</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={filtroFormacion} onChange={(e)=>{setFiltroFormacion(e.target.value); setFiltroEspecialidad(''); setFiltroCurso('');}} className="border rounded-lg p-2">
                <option value="">Campo de formación</option>
                {formaciones.map((v)=> <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={filtroEspecialidad} onChange={(e)=>{setFiltroEspecialidad(e.target.value); setFiltroCurso('');}} className="border rounded-lg p-2" disabled={!filtroFormacion}>
                <option value="">Especialidad</option>
                {especialidades.map((v)=> <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={filtroCurso} onChange={(e)=>setFiltroCurso(e.target.value)} className="border rounded-lg p-2" disabled={!filtroEspecialidad}>
                <option value="">Curso</option>
                {cursos.map((v)=> <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={statusNew} onChange={(e)=>setStatusNew(e.target.value as StatusType)} className="border rounded-lg p-2">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="button" onClick={agregarSector} disabled={!filtroCurso} className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">Agregar sector</button>

            <div className="mt-4 border rounded-xl p-3 bg-gray-50">
              {sectoresSel.length === 0 && <p className="text-gray-500">Sin sectores asignados.</p>}
              <ul className="space-y-2">
                {sectoresSel.map((s) => (
                  <li key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-3 border">
                    <div className="font-medium">{`${s.campo_formacion} / ${s.especialidad} / ${s.curso}`}</div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <select className="border rounded-lg p-1 text-sm" value={s.status} onChange={(e)=>setSectoresSel((arr)=>arr.map(x=>x.id===s.id?{...x,status:e.target.value as StatusType}:x))}>
                        {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                      <button type="button" onClick={()=>eliminarSector(s.id)} className="text-red-600 text-sm">Quitar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/admin" className="px-4 py-2 border rounded-lg">Cancelar</Link>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">{submitting? 'Guardando…':'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
