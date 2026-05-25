import { supabase } from './db';

export interface AppConfig {
  attempt_1_open: boolean;
  attempt_2_open: boolean;
  maintenance_mode: boolean;
  banner_message: string;
  admin_password_hash?: string;
}

export async function getAppConfig(): Promise<AppConfig> {
  if (!supabase) return { attempt_1_open: true, attempt_2_open: false, maintenance_mode: false, banner_message: '' };
  
  try {
    const { data, error } = await supabase.from('app_config').select('*').eq('id', 1).single();
    if (error || !data) {
      console.warn('Failed to load app_config, falling back to defaults:', error?.message);
      return { attempt_1_open: true, attempt_2_open: false, maintenance_mode: false, banner_message: '' };
    }
    return data as AppConfig;
  } catch (e) {
    return { attempt_1_open: true, attempt_2_open: false, maintenance_mode: false, banner_message: '' };
  }
}

export async function updateAppConfig(updates: Partial<AppConfig>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('app_config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (error) {
      console.error('Failed to update app_config:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
