import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';
import { FaUserPlus, FaUserEdit, FaLayerGroup, FaEdit } from 'react-icons/fa';

export default async function AdminPage() {
  const role = await getUserRole();

  if (role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
      <p className="text-lg text-gray-600 mb-12 text-center max-w-xl">
        Selecciona una de las siguientes opciones para gestionar instructores y sectores.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
        <AdminCard
          href="/admin/insertar-instructor"
          icon={<FaUserPlus className="text-4xl text-blue-600 mb-4" />}
          title="Insertar Instructor"
          color="blue"
        />

        <AdminCard
          href="/admin/editar-instructor"
          icon={<FaUserEdit className="text-4xl text-green-600 mb-4" />}
          title="Editar Instructor"
          color="green"
        />

        <AdminCard
          href="/admin/insertar-sector"
          icon={<FaLayerGroup className="text-4xl text-yellow-600 mb-4" />}
          title="Insertar Sector"
          color="yellow"
        />

        <AdminCard
          href="/admin/editar-sector"
          icon={<FaEdit className="text-4xl text-red-600 mb-4" />}
          title="Editar Sector"
          color="red"
        />
      </div>

      <div className="mt-12">
        <LogoutButton />
      </div>
    </div>
  );
}

type AdminCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
};

function AdminCard({ href, icon, title, color }: AdminCardProps) {
  const baseColor = {
    blue: 'hover:bg-blue-600',
    green: 'hover:bg-green-600',
    yellow: 'hover:bg-yellow-600',
    red: 'hover:bg-red-600',
  }[color];

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer bg-white shadow-xl rounded-xl p-6 text-center transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${baseColor}`}
      >
        {icon}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
    </Link>
  );
}
