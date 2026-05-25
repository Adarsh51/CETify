'use server';

import { cookies } from 'next/headers';
import { updateAppConfig } from '@/utils/admin';
import { revalidatePath } from 'next/cache';

export async function saveAdminConfig(formData: FormData) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (session?.value !== 'true') return;

  const updates = {
    attempt_1_open: formData.get('attempt_1_open') === 'on',
    attempt_2_open: formData.get('attempt_2_open') === 'on',
    maintenance_mode: formData.get('maintenance_mode') === 'on',
    banner_message: (formData.get('banner_message') as string) || '',
  };

  const success = await updateAppConfig(updates);
  if (success) {
    revalidatePath('/'); // Force homepage to update with new configs
  }
}
