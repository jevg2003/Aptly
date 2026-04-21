import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * Sube una imagen (URI local) al bucket 'avatars' en Supabase Storage
 * y retorna la URL pública.
 * 
 * @param localUri La URI del archivo local (generalmente proveniente de imageUtils)
 * @param userId El ID del usuario actual (para nombrar el archivo de forma única)
 */
export const uploadAvatar = async (localUri: string, userId: string): Promise<string | null> => {
  try {
    // 1. Leer el archivo como Base64 (Esto evita el famoso bug de fetch.blob() en Android)
    const base64Str = await FileSystem.readAsStringAsync(localUri, { 
      encoding: 'base64'
    });
    
    // 2. Generar nombre de archivo
    const fileExt = 'jpg';
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // 3. Subir decodificando el Base64 directamente a ArrayBuffer
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, decode(base64Str), {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Error subiendo imagen a Storage:', uploadError.message);
      return null;
    }

    // 4. Obtener la URL pública que usaremos en la app para mostrar la imagen
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    return data.publicUrl;

  } catch (error) {
    console.error('Error procesando subida:', error);
    return null;
  }
};

/**
 * Sube un documento (PDF, DOCX) al bucket 'resumes'
 * @param localUri URI del archivo local
 * @param userId ID del usuario
 * @param fileName Nombre original del archivo (opcional)
 */
export const uploadDocument = async (localUri: string, userId: string, originalName?: string): Promise<string | null> => {
  try {
    const base64Str = await FileSystem.readAsStringAsync(localUri, { 
      encoding: 'base64'
    });
    
    const fileExt = originalName ? originalName.split('.').pop() : 'pdf';
    const filePath = `resumes/${userId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents') // Usaremos un bucket genérico 'documents'
      .upload(filePath, decode(base64Str), {
        contentType: fileExt === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true
      });

    if (uploadError) {
      console.error('Error subiendo documento:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;

  } catch (error) {
    console.error('Error procesando subida de documento:', error);
    return null;
  }
};
