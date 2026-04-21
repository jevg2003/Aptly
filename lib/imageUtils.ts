import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

/**
 * Permite al usuario seleccionar una imagen de su galería y la optimiza
 * inmediatamente para reducir drásticamente su peso en KB antes de subirla.
 */
export const pickAndOptimizeImage = async (): Promise<string | null> => {
  // Solicitar permisos de galería
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir la foto.');
    return null;
  }

  // Seleccionar la imagen
  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true, // Permite al usuario recortar un cuadrado
    aspect: [1, 1], // Ideal para avatares
    quality: 1, // Calidad inicial (luego la bajamos)
  });

  if (pickerResult.canceled || !pickerResult.assets?.[0]) {
    return null; // El usuario canceló
  }

  const uri = pickerResult.assets[0].uri;

  // -- OPTIMIZACIÓN (LA MAGIA) --
  // Reducimos el ancho máximo a 800px y la calidad a 70% (.jpg)
  // Esto puede convertir una foto de 5MB en una de 150KB.
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
};
