'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAppConfig, updateAppConfig } from '@/utils/admin';
import { hashPassword, verifyPassword } from '@/utils/crypto';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  
  if (!password || password.length < 5) {
    return { error: 'Password must be at least 5 characters.' };
  }

  const config = await getAppConfig();
  
  // INITIALIZATION MODE: If no password hash exists in DB, set it right now
  if (!config.admin_password_hash) {
    const newHash = hashPassword(password);
    await updateAppConfig({ admin_password_hash: newHash });
    
    // Log them in immediately after setting it
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', { 
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true, 
      path: '/' 
    });
    redirect('/admin');
  }

  // STANDARD LOGIN MODE
  const isValid = verifyPassword(password, config.admin_password_hash);
  if (isValid) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', { 
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true, 
      path: '/' 
    });
    redirect('/admin');
  }
  
  return { error: 'Invalid clearance code. Access Denied.' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin/login');
}
