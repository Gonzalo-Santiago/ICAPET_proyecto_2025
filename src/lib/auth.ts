import { cookies } from 'next/headers';

export async function getUserRole() {
  // cookies() ahora es una promesa, así que usamos await
  const cookieStore = await cookies();
  return cookieStore.get('role')?.value || null;
}
