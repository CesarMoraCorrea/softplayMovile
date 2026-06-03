import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { cancelarReservaThunk, misReservasThunk } from '../../store/slices/reservasSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
        case 'confirmada': return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' };
        case 'pagada':     return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' };
        case 'pendiente':  return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
        case 'cancelada':  return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' };
        case 'completada': return { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' };
        default:           return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
    }
};

const getEstadoGradient = (estado: string) => {
    switch (estado?.toLowerCase()) {
        case 'confirmada':
        case 'pagada':    return ['#10B981', '#059669'];
        case 'pendiente': return ['#F59E0B', '#D97706'];
        case 'cancelada': return ['#EF4444', '#B91C1C'];
        case 'completada':return ['#3B82F6', '#2563EB'];
        default:          return ['#9CA3AF', '#6B7280'];
    }
};

const formatFecha = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    // Ajuste de timezone para que no desfase un día
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// ─── Componente Tarjeta de Reserva ────────────────────────────────────────────

function TarjetaReserva({
    reserva,
    onCancelar,
}: {
    reserva: any;
    onCancelar: (r: any) => void;
}) {
    const estadoColors = getEstadoColor(reserva.estado);
    const barGradient = getEstadoGradient(reserva.estado);
    const puedeCancelar = reserva.estado === 'pendiente';

    return (
        <View style={styles.card}>
            {/* Barra de color superior por estado */}
            <LinearGradient colors={barGradient as [string, string]} style={styles.cardBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

            <View style={styles.cardBody}>
                {/* Header de la tarjeta */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleGroup}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                            {reserva.cancha?.nombre || 'Escenario'}
                        </Text>
                        {reserva.sede?.nombre && (
                            <View style={styles.sedeRow}>
                                <Ionicons name="location-outline" size={12} color="#6B7280" />
                                <Text style={styles.sedeText}>{reserva.sede.nombre}</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.estadoBadge, { backgroundColor: estadoColors.bg, borderColor: estadoColors.border }]}>
                        <Text style={[styles.estadoText, { color: estadoColors.text }]}>
                            {reserva.estado?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Detalles de fecha y hora */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color="#4F46E5" />
                        <Text style={styles.infoLabel}>{formatFecha(reserva.fecha)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color="#4F46E5" />
                        <Text style={styles.infoLabel}>
                            {reserva.horaInicio} – {reserva.horaFin}
                            {reserva.horas ? ` (${reserva.horas}h)` : ''}
                        </Text>
                    </View>
                </View>

                {/* Separador estilo boleto */}
                <View style={styles.separator}>
                    <View style={styles.notchLeft} />
                    <View style={styles.dashedLine} />
                    <View style={styles.notchRight} />
                </View>

                {/* Footer: total y acciones */}
                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>
                            ${(reserva.total || 0).toLocaleString('es-CO')}
                        </Text>
                    </View>
                    {puedeCancelar && (
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => onCancelar(reserva)}
                        >
                            <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

// ─── Pantalla Principal ────────────────────────────────────────────────────────

export default function MisReservasScreen() {
    const dispatch = useDispatch<any>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { user } = useSelector((state: any) => state.auth);
    const { list, loading } = useSelector((state: any) => state.reservas);

    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reservaAcancelar, setReservaAcancelar] = useState<any>(null);
    const [cancelando, setCancelando] = useState(false);

    // Carga inicial y al volver a la pantalla
    useFocusEffect(
        useCallback(() => {
            if (user) {
                dispatch(misReservasThunk());
            }
        }, [user])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await dispatch(misReservasThunk());
        setRefreshing(false);
    }, []);

    const handleCancelar = (reserva: any) => {
        setReservaAcancelar(reserva);
        setModalVisible(true);
    };

    const confirmarCancelacion = async () => {
        if (!reservaAcancelar) return;
        try {
            setCancelando(true);
            await dispatch(cancelarReservaThunk(reservaAcancelar._id)).unwrap();
            setModalVisible(false);
            setReservaAcancelar(null);
            Alert.alert('Reserva cancelada', 'Tu reserva fue cancelada exitosamente.');
        } catch (error: any) {
            Alert.alert('Error', error || 'No se pudo cancelar la reserva. Intenta de nuevo.');
        } finally {
            setCancelando(false);
        }
    };

    // Sin sesión iniciada
    if (!user) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Mis Reservas</Text>
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="lock-closed-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>Sesión requerida</Text>
                    <Text style={styles.emptySubtitle}>Inicia sesión para ver tus reservas</Text>
                    <TouchableOpacity
                        style={styles.actionBtnContainer}
                        onPress={() => router.push('/(auth)/login')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient colors={['#2563EB', '#4F46E5']} style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>Iniciar Sesión</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.pageHeader}>
                <View>
                    <Text style={styles.pageTitle}>Mis Reservas</Text>
                    <Text style={styles.pageSubtitle}>
                        {list.length > 0 ? `${list.length} reserva${list.length !== 1 ? 's' : ''}` : 'Sin reservas aún'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    <Ionicons name="refresh-outline" size={22} color="#4F46E5" />
                </TouchableOpacity>
            </View>

            {loading && list.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Cargando reservas...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 20 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4F46E5']}
                            tintColor="#4F46E5"
                        />
                    }
                >
                    {list.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>Sin reservas</Text>
                            <Text style={styles.emptySubtitle}>
                                Aún no tienes ninguna reserva. ¡Explora las sedes y reserva tu cancha!
                            </Text>
                            <TouchableOpacity
                                style={styles.actionBtnContainer}
                                onPress={() => router.push('/(tabs)/sedes')}
                                activeOpacity={0.8}
                            >
                                <LinearGradient colors={['#2563EB', '#4F46E5']} style={styles.actionBtn}>
                                    <Text style={styles.actionBtnText}>Buscar Canchas</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        list.map((reserva: any) => (
                            <TarjetaReserva
                                key={reserva._id}
                                reserva={reserva}
                                onCancelar={handleCancelar}
                            />
                        ))
                    )}
                </ScrollView>
            )}

            {/* Modal de confirmación de cancelación */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalIconBg}>
                            <Ionicons name="warning-outline" size={32} color="#EF4444" />
                        </View>
                        <Text style={styles.modalTitle}>Confirmar Cancelación</Text>
                        <Text style={styles.modalBody}>
                            ¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.
                        </Text>

                        {reservaAcancelar && (
                            <View style={styles.modalDetail}>
                                <Text style={styles.modalDetailTitle}>
                                    {reservaAcancelar.cancha?.nombre}
                                </Text>
                                <Text style={styles.modalDetailText}>
                                    {formatFecha(reservaAcancelar.fecha)}
                                </Text>
                                <Text style={styles.modalDetailText}>
                                    {reservaAcancelar.horaInicio} – {reservaAcancelar.horaFin}
                                </Text>
                                <Text style={[styles.modalDetailText, { fontWeight: '700' }]}>
                                    Total: ${(reservaAcancelar.total || 0).toLocaleString('es-CO')}
                                </Text>
                            </View>
                        )}

                        <View style={styles.modalBtns}>
                            <TouchableOpacity
                                style={styles.modalBtnSecondary}
                                onPress={() => setModalVisible(false)}
                                disabled={cancelando}
                            >
                                <Text style={styles.modalBtnSecondaryText}>No, mantener</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtnDanger}
                                onPress={confirmarCancelacion}
                                disabled={cancelando}
                            >
                                {cancelando ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.modalBtnDangerText}>Sí, cancelar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    pageHeader: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
    },
    pageSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    refreshBtn: {
        padding: 8,
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#6B7280',
        fontSize: 15,
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 80,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#374151',
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    actionBtnContainer: {
        marginTop: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionBtn: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardBar: {
        height: 4,
    },
    cardBody: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitleGroup: {
        flex: 1,
        paddingRight: 12,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
    },
    sedeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    sedeText: {
        fontSize: 12,
        color: '#6B7280',
    },
    estadoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    estadoText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    infoRow: {
        gap: 8,
        marginBottom: 14,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 13,
        color: '#374151',
        flex: 1,
        textTransform: 'capitalize',
    },
    // Separador estilo boleto
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    notchLeft: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#F9FAFB',
        marginLeft: -22,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderStyle: 'dashed',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        marginHorizontal: 4,
    },
    notchRight: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#F9FAFB',
        marginRight: -22,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    cancelBtnText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 13,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
    },
    modalIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalBody: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 16,
    },
    modalDetail: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        gap: 4,
        marginBottom: 20,
    },
    modalDetailTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    modalDetailText: {
        fontSize: 13,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    modalBtns: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtnSecondary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    modalBtnSecondaryText: {
        fontWeight: '600',
        color: '#374151',
        fontSize: 14,
    },
    modalBtnDanger: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnDangerText: {
        fontWeight: '700',
        color: '#fff',
        fontSize: 14,
    },
});
