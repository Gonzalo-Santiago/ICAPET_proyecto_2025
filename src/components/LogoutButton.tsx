'use client';

import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
    });
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-3 py-4 px-6 text-xl bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 transition duration-300"
    >
      <FaSignOutAlt className="text-2xl" />
      Cerrar sesión
    </button>
  );
}
