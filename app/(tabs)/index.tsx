import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../../store/slices/authSlice';
import api from '../../utils/api';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({ users: 0, sedes: 0, reservas: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        if (data?.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.log("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login' as any);
  };

  const goToSedes = () => {
    router.push('/(tabs)/sedes' as any);
  };

  const goToReservas = () => {
    router.push('/(tabs)/reservas' as any);
  };

  return (
    <View style={styles.container}>
      {/* Barra de navegación superior transparente */}
      <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.logoText}>Soft<Text style={{ color: '#3B82F6' }}>play</Text></Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000' }}
          style={styles.heroBackground}
        >
          {/* Overlay oscuro y gradiente */}
          <View style={styles.overlay} />
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)', '#F9FAFB']}
            style={styles.gradientOverlay}
          />

          <View style={styles.heroContent}>
            {/* Badge */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>LA EVOLUCIÓN DEL DEPORTE AMATEUR</Text>
            </View>

            {/* Título */}
            <Text style={styles.mainTitle}>
              Transformamos{'\n'}la <Text style={styles.highlightText}>gestión</Text>{'\n'}<Text style={styles.highlightTextGreen}>deportiva</Text>
            </Text>

            <Text style={styles.description}>
              La plataforma definitiva que conecta a dueños de canchas con deportistas apasionados. Gestiona, reserva y juega sin complicaciones.
            </Text>

            {/* Botones */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.primaryBtnContainer} onPress={goToSedes} activeOpacity={0.8}>
                <LinearGradient colors={['#2563EB', '#4F46E5']} style={styles.primaryButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.primaryButtonText}>Explorar Canchas</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={goToReservas} activeOpacity={0.8}>
                <Text style={styles.secondaryButtonText}>Mis Reservas</Text>
              </TouchableOpacity>
            </View>

            {/* Estadísticas Flotantes (Glassmorphism) */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <View style={styles.statIconBlue}>
                  <Ionicons name="people" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.statNumber}>+{stats.users || 1200}</Text>
                  <Text style={styles.statLabel}>DEPORTISTAS</Text>
                </View>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statIconGreen}>
                  <Ionicons name="location" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.statNumber}>+{stats.sedes || 50}</Text>
                  <Text style={styles.statLabel}>SEDES ACTIVAS</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
  },
  logoutBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  heroBackground: {
    width: '100%',
    minHeight: height * 0.85,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'center',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 24,
  },
  badgeText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 48,
    marginBottom: 24,
  },
  highlightText: {
    color: '#2563EB',
  },
  highlightTextGreen: {
    color: '#10B981',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 48,
  },
  primaryBtnContainer: {
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    gap: 12,
  },
  statIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
});
