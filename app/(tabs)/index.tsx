import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

// Calculando el ancho del gráfico basado en el tamaño de la pantalla
const { width } = Dimensions.get('window');
const GRAPHIC_WIDTH = width - 80;

/**
 * Pantalla de Inicio Principal (HomeScreen):
 * Esta es la primera pantalla que ve el usuario al entrar a la app (Dashboard). 
 * Muestra las opciones principales como buscar canchas ("Reservar ahora") y ver sus reservas.
 * También dibuja una rústica pero bonita cancha de fútbol usando "Views" nativos.
 */
export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login' as any);
  };

  const goToSedes = () => {
    router.push('/(tabs)/sedes' as any);
  };

  return (
    <View style={styles.container}>
      {/* Barra de navegación superior y Logo */}
      <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.logoText}>SoftPlay</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Tarjeta Principal */}
        <View style={styles.card}>
          <Text style={styles.title}>Reserva tu cancha ahora</Text>
          <Text style={styles.description}>
            Encuentra y reserva las mejores canchas deportivas cerca de ti. Fútbol, tenis, básquet, pádel y más deportes disponibles con reserva inmediata.
          </Text>

          {/* Fila de botones de acción */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={goToSedes}>
              <Text style={styles.primaryButtonText}>Reservar ahora</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Mis reservas</Text>
            </TouchableOpacity>
          </View>

          {/* Elemento gráfico: Cancha de fútbol dibujada puramente con vistas nativas */}
          {/* Un rectángulo perimetral con línea divisoria intermedia, círculo central y áreas de portería */}
          <View style={styles.graphicContainer}>
            <Text style={styles.graphicText}>SoftPlay</Text>

            <View style={[styles.field, { width: GRAPHIC_WIDTH, height: GRAPHIC_WIDTH * 0.6 }]}>
              {/* Área de portería izquierda */}
              <View style={styles.leftPenaltyArea} />

              {/* Línea divisoria central */}
              <View style={styles.centerLine} />

              {/* Círculo del medio campo */}
              <View style={styles.centerCircle} />

              {/* Área de portería derecha */}
              <View style={styles.rightPenaltyArea} />
            </View>
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Fondo muy claro para resaltar la tarjeta blanca
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B5ADB', // Color azul rescatado del diseño de marca de prueba
  },
  logoutText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B5ADB', // Tono azul principal del diseño
    marginBottom: 16,
    textAlign: 'left',
    width: '100%',
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: '#4B5563', // Texto descriptivo en escala de grises
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'left',
    width: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B5ADB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB', // Borde gris muy sutil
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  // --- Estilos del gráfico de la cancha ---
  graphicContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  graphicText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  field: {
    borderWidth: 2,
    borderColor: '#3B5ADB', // Bordes azules que simulan las líneas delimitantes de la cancha
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  centerLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#3B5ADB',
  },
  centerCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#3B5ADB',
    backgroundColor: 'transparent',
  },
  leftPenaltyArea: {
    position: 'absolute',
    left: 0,
    top: '20%',
    width: '20%',
    height: '60%',
    borderWidth: 2,
    borderColor: '#3B5ADB',
    borderLeftWidth: 0, // Se elimina el borde izquierdo para que se fusione con el perímetro mayor
  },
  rightPenaltyArea: {
    position: 'absolute',
    right: 0,
    top: '20%',
    width: '20%',
    height: '60%',
    borderWidth: 2,
    borderColor: '#3B5ADB',
    borderRightWidth: 0,
  },
});
