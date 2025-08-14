// src\app\user\page.tsx
import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function UserPage() {
  const role = await getUserRole();

  if (role !== 'user') {
    redirect('/'); // Si no es user, vuelve al login
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Datos del Usuario</h1>
      <ul className="mt-4 list-disc pl-6">
        <li>Dato 1</li>
        <li>Dato 2</li>
      </ul>
      <LogoutButton />
    </div>
  );
}
