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
      encoding: 'base64',
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
        upsert: true,
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
 * Detecta el tipo MIME correcto a partir de la extensión del archivo
 */
const getMimeType = (ext: string): string => {
  const ext_lower = (ext || '').toLowerCase();
  if (ext_lower === 'pdf') return 'application/pdf';
  if (ext_lower === 'docx')
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (ext_lower === 'doc') return 'application/msword';
  return 'application/octet-stream';
};

/**
 * Sanitiza el nombre de un archivo eliminando caracteres problemáticos para Storage
 */
const sanitizeFileName = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-zA-Z0-9._-]/g, '_') // reemplaza caracteres especiales
    .replace(/_+/g, '_'); // colapsa múltiples guiones bajos
};

/**
 * Sube un documento (PDF, DOCX) al bucket 'documents'
 * @param localUri URI del archivo local
 * @param userId ID del usuario
 * @param originalName Nombre original del archivo
 */
export const uploadDocument = async (
  localUri: string,
  userId: string,
  originalName?: string
): Promise<string> => {
  // Leer el archivo como Base64
  const base64Str = await FileSystem.readAsStringAsync(localUri, {
    encoding: 'base64',
  });

  if (!base64Str || base64Str.length === 0) {
    throw new Error('No se pudo leer el archivo. Intenta con otro documento.');
  }

  const rawExt = originalName ? originalName.split('.').pop() || 'pdf' : 'pdf';
  const safeName = originalName ? sanitizeFileName(originalName) : `documento_${Date.now()}.pdf`;
  const filePath = `resumes/${userId}_${Date.now()}_${safeName}`;
  const contentType = getMimeType(rawExt);

  console.log('[uploadDocument] Uploading to path:', filePath, '| type:', contentType);

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, decode(base64Str), {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('[uploadDocument] Supabase storage error:', uploadError);
    throw new Error(`Error al subir el documento: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
  return data.publicUrl;
};

