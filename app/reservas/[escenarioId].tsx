import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../utils/api';
import CustomCalendar from '../../components/ui/CustomCalendar';

// ─── Helpers de Tiempo ────────────────────────────────────────────────────────

const timeToFloat = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m / 60);
};

const floatToTime = (f: number): string => {
    const h = Math.floor(f);
    const m = Math.round((f - h) * 60);
    return `${String(h).padStart(2, '0')}:${m === 0 ? '00' : String(m).padStart(2, '0')}`;
};

/**
 * Genera slots disponibles a partir de la configuración de horario de la cancha/sede.
 * Si no hay configuración, usa un rango por defecto de 06:00 a 22:00.
 */
const generarSlots = (cancha: any, dayOfWeek: number, duracionHoras: number): { slots: number[]; cerrado: boolean } => {
    let config: any = cancha?.configuracionHorarioSede || {};
    if (cancha?.usarHorarioPersonalizado && cancha?.configuracionHorario) {
        config = cancha.configuracionHorario;
    }

    const daily = config?.horarioPorDia?.[dayOfWeek];
    if (daily && !daily.isAbierto) return { slots: [], cerrado: true };

    const apertura = timeToFloat(daily?.apertura || '06:00');
    const cierre   = timeToFloat(daily?.cierre   || '22:00');
    const intervalo = (config?.intervaloMinutos || 60) / 60; // 0.5 o 1.0

    const descansos = (daily?.descansos || []).map((d: any) => ({
        start: timeToFloat(d.inicio),
        end:   timeToFloat(d.fin),
    }));

    const slots: number[] = [];
    for (let t = apertura; t + duracionHoras <= cierre; t += intervalo) {
        const bloqueaDescanso = descansos.some((d: any) => t < d.end && (t + duracionHoras) > d.start);
        if (!bloqueaDescanso) slots.push(t);
    }

    return { slots, cerrado: false };
};

// ─── Indicador de Pasos ───────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
    return (
        <View style={styles.stepperContainer}>
            <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                    <Text style={styles.stepNumberActive}>1</Text>
                </View>
                <Text style={styles.stepLabelActive}>CANCHA</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, step >= 1 ? styles.stepCircleActive : null]}>
                    <Text style={step >= 1 ? styles.stepNumberActive : styles.stepNumber}>2</Text>
                </View>
                <Text style={step >= 1 ? styles.stepLabelActive : styles.stepLabel}>HORARIO</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
                <View style={[styles.stepCircle, step >= 2 ? styles.stepCircleActive : null]}>
                    <Text style={step >= 2 ? styles.stepNumberActive : styles.stepNumber}>3</Text>
                </View>
                <Text style={step >= 2 ? styles.stepLabelActive : styles.stepLabel}>CONFIRMAR</Text>
            </View>
        </View>
    );
}

// ─── Pantalla Principal ────────────────────────────────────────────────────────

export default function ReservaEscenarioScreen() {
    const { escenarioId, sedeId, nombreCancha, precioHora } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useSelector((state: any) => state.auth);

    // Fecha y configuración
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [duracion, setDuracion] = useState(1); // horas
    const [slotSeleccionado, setSlotSeleccionado] = useState<number | null>(null);

    // Datos del backend
    const [cancha, setCancha] = useState<any>(null);
    const [horariosOcupados, setHorariosOcupados] = useState<any[]>([]);
    const [loadingHorarios, setLoadingHorarios] = useState(false);

    // Estado del flujo
    const [step, setStep] = useState(1);
    const [bloqueoId, setBloqueoId] = useState<string | null>(null);
    const [reservaFinal, setReservaFinal] = useState<any>(null);
    const [confirmando, setConfirmando] = useState(false);
    const [error, setError] = useState('');

    // Para liberar el bloqueo al salir
    const bloqueoIdRef = useRef<string | null>(null);
    bloqueoIdRef.current = bloqueoId;

    // ── Autenticación ────────────────────────────────────────────────────────

    useEffect(() => {
        if (!user) {
            Alert.alert(
                'Sesión requerida',
                'Debes iniciar sesión para hacer una reserva.',
                [{ text: 'Ir a login', onPress: () => router.replace('/(auth)/login') }]
            );
        }
    }, [user]);

    // ── Cargar info de la cancha ─────────────────────────────────────────────

    useEffect(() => {
        const fetchCancha = async () => {
            const safeId = Array.isArray(escenarioId) ? escenarioId[0] : escenarioId;
            try {
                const { data } = await api.get(`/sedes/escenarios/${safeId}`);
                setCancha(data);
            } catch {
                // Si no hay endpoint dedicado, trabajamos sin config completa
                setCancha(null);
            }
        };
        if (escenarioId) fetchCancha();
    }, [escenarioId]);

    // ── Horarios Ocupados ────────────────────────────────────────────────────

    const cargarHorariosOcupados = useCallback(async () => {
        const safeId = Array.isArray(escenarioId) ? escenarioId[0] : escenarioId;
        if (!safeId) return;
        try {
            setLoadingHorarios(true);
            const [y, m, d] = [
                fechaSeleccionada.getFullYear(),
                String(fechaSeleccionada.getMonth() + 1).padStart(2, '0'),
                String(fechaSeleccionada.getDate()).padStart(2, '0'),
            ];
            const ignorar = bloqueoIdRef.current ? `&ignorarBloqueoId=${bloqueoIdRef.current}` : '';
            const { data } = await api.get(`/reservas/ocupados/${safeId}?fecha=${y}-${m}-${d}${ignorar}`);
            setHorariosOcupados(data || []);
        } catch {
            setHorariosOcupados([]);
        } finally {
            setLoadingHorarios(false);
        }
    }, [fechaSeleccionada, escenarioId]);

    useEffect(() => {
        cargarHorariosOcupados();
        setSlotSeleccionado(null);
        setBloqueoId(null);
    }, [fechaSeleccionada, duracion]);

    // ── Liberar bloqueo al salir sin confirmar ───────────────────────────────

    useFocusEffect(
        useCallback(() => {
            return () => {
                const bid = bloqueoIdRef.current;
                if (bid) {
                    api.delete(`/reservas/${bid}`).catch(() => {});
                    setBloqueoId(null);
                }
            };
        }, [])
    );

    // ── Lógica de Slots ──────────────────────────────────────────────────────

    const dayOfWeek = fechaSeleccionada.getDay();
    const { slots, cerrado } = generarSlots(cancha, dayOfWeek, duracion);

    const isSlotOcupado = (slot: number): boolean => {
        return horariosOcupados.some(o => {
            const oStart = timeToFloat(o.horaInicio);
            const oEnd   = timeToFloat(o.horaFin);
            return slot < oEnd && (slot + duracion) > oStart;
        });
    };

    const isSlotPasado = (slot: number): boolean => {
        const ahora = new Date();
        const esHoy =
            fechaSeleccionada.getDate()     === ahora.getDate()   &&
            fechaSeleccionada.getMonth()    === ahora.getMonth()  &&
            fechaSeleccionada.getFullYear() === ahora.getFullYear();
        if (esHoy) {
            return slot <= ahora.getHours() + ahora.getMinutes() / 60;
        }
        const esAntes = fechaSeleccionada < ahora &&
            fechaSeleccionada.getDate() !== ahora.getDate();
        return esAntes;
    };

    // ── Auto-bloqueo al seleccionar un slot ─────────────────────────────────

    const seleccionarSlot = async (slot: number) => {
        if (isSlotOcupado(slot) || isSlotPasado(slot)) return;
        setError('');

        // Liberar bloqueo anterior si existe
        if (bloqueoIdRef.current) {
            api.delete(`/reservas/${bloqueoIdRef.current}`).catch(() => {});
            setBloqueoId(null);
        }

        setSlotSeleccionado(slot);

        // Bloquear temporalmente en el backend
        try {
            const safeEscenarioId = Array.isArray(escenarioId) ? escenarioId[0] : escenarioId;
            const safeSedeId      = Array.isArray(sedeId) ? sedeId[0] : sedeId;
            const [y, m, d] = [
                fechaSeleccionada.getFullYear(),
                String(fechaSeleccionada.getMonth() + 1).padStart(2, '0'),
                String(fechaSeleccionada.getDate()).padStart(2, '0'),
            ];
            const { data } = await api.post('/reservas/bloquear', {
                sedeId:      safeSedeId,
                escenarioId: safeEscenarioId,
                fecha:       `${y}-${m}-${d}`,
                horas:       duracion,
                horaInicio:  floatToTime(slot),
            });
            setBloqueoId(data?._id || null);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Este horario fue tomado. Selecciona otro.';
            setError(msg);
            setSlotSeleccionado(null);
        }
    };

    // ── Confirmar la reserva ─────────────────────────────────────────────────

    const confirmarReserva = async () => {
        if (!bloqueoId) {
            setError('No se pudo bloquear el horario. Selecciónalo nuevamente.');
            return;
        }
        try {
            setConfirmando(true);
            setError('');
            const { data } = await api.patch(`/reservas/${bloqueoId}/estado`, {
                estadoPago: 'pendiente',
            });
            setBloqueoId(null);   // Ya no liberar en unmount
            bloqueoIdRef.current = null;
            setReservaFinal(data);
            setStep(3);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Error al confirmar la reserva.');
        } finally {
            setConfirmando(false);
        }
    };

    // ── Selector de Fecha ────────────────────────────────────────────────────

    const cambiarDia = (delta: number) => {
        const nuevaFecha = new Date(fechaSeleccionada);
        nuevaFecha.setDate(nuevaFecha.getDate() + delta);
        // No permitir fechas pasadas
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (nuevaFecha >= hoy) setFechaSeleccionada(nuevaFecha);
    };

    const precioTotal = Number(precioHora || 0) * duracion;

    // ════════════════════════ RENDER ═════════════════════════════════════════

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Reservar Cancha</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>
                        {nombreCancha || 'Escenario'}
                    </Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Step Indicator */}
                <View style={styles.stepContainer}>
                    <StepIndicator step={step} />
                </View>

                {/* ─── PASO 1: Elegir fecha, duración y hora ─────────────── */}
                {step === 1 && (
                    <View>
                        {/* Selector de Duración */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="time-outline" size={16} color="#4F46E5" /> Duración
                            </Text>
                            <View style={styles.durationRow}>
                                {[1, 1.5, 2, 3, 4].map(h => (
                                    <TouchableOpacity
                                        key={h}
                                        style={[
                                            styles.durationBtn,
                                            duracion === h && styles.durationBtnActive,
                                        ]}
                                        onPress={() => {
                                            setDuracion(h);
                                            setSlotSeleccionado(null);
                                            if (bloqueoIdRef.current) {
                                                api.delete(`/reservas/${bloqueoIdRef.current}`).catch(() => {});
                                                setBloqueoId(null);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.durationBtnText,
                                            duracion === h && styles.durationBtnTextActive,
                                        ]}>
                                            {h}h
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Selector de Fecha */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="calendar-outline" size={16} color="#4F46E5" /> Fecha
                            </Text>
                            <CustomCalendar 
                                value={fechaSeleccionada} 
                                onChange={(d) => {
                                    setFechaSeleccionada(d);
                                    setSlotSeleccionado(null);
                                    if (bloqueoIdRef.current) {
                                        api.delete(`/reservas/${bloqueoIdRef.current}`).catch(() => {});
                                        setBloqueoId(null);
                                    }
                                }} 
                            />
                        </View>

                        {/* Selector de Hora */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                <Ionicons name="alarm-outline" size={16} color="#4F46E5" /> Hora de inicio
                            </Text>
                            {cerrado ? (
                                <View style={styles.closedBox}>
                                    <Ionicons name="close-circle-outline" size={28} color="#EF4444" />
                                    <Text style={styles.closedText}>Cerrado este día</Text>
                                </View>
                            ) : loadingHorarios ? (
                                <ActivityIndicator color="#4F46E5" style={{ marginTop: 20 }} />
                            ) : slots.length === 0 ? (
                                <View style={styles.closedBox}>
                                    <Ionicons name="moon-outline" size={28} color="#9CA3AF" />
                                    <Text style={styles.closedText}>Sin horarios disponibles</Text>
                                </View>
                            ) : (
                                <View style={styles.slotsGrid}>
                                    {slots.map(slot => {
                                        const ocupado  = isSlotOcupado(slot);
                                        const pasado   = isSlotPasado(slot);
                                        const inactivo = ocupado || pasado;
                                        const activo   = slotSeleccionado === slot;
                                        return (
                                            <TouchableOpacity
                                                key={slot}
                                                disabled={inactivo}
                                                onPress={() => seleccionarSlot(slot)}
                                                style={[
                                                    styles.slot,
                                                    inactivo && styles.slotDisabled,
                                                    activo   && styles.slotActive,
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.slotText,
                                                    inactivo && styles.slotTextDisabled,
                                                    activo   && styles.slotTextActive,
                                                ]}>
                                                    {floatToTime(slot)}
                                                </Text>
                                                {ocupado && (
                                                    <Text style={styles.slotOcupado}>Ocupado</Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {horariosOcupados.length > 0 && (
                                <View style={styles.legendRow}>
                                    <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
                                    <Text style={styles.legendText}>Ocupado</Text>
                                    <View style={[styles.legendDot, { backgroundColor: '#4F46E5', marginLeft: 12 }]} />
                                    <Text style={styles.legendText}>Seleccionado</Text>
                                </View>
                            )}
                        </View>

                        {/* Error */}
                        {error ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                    </View>
                )}

                {/* ─── PASO 2: Revisión ──────────────────────────────────── */}
                {step === 2 && (
                    <View style={styles.section}>
                        <Text style={styles.reviewTitle}>Confirma tu Reserva</Text>

                        <View style={styles.reviewCard}>
                            <ReviewRow icon="storefront-outline" label="Cancha" value={String(nombreCancha || 'Escenario')} />
                            <ReviewRow
                                icon="calendar-outline"
                                label="Fecha"
                                value={fechaSeleccionada.toLocaleDateString('es-CO', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            />
                            <ReviewRow
                                icon="time-outline"
                                label="Horario"
                                value={`${floatToTime(slotSeleccionado!)} – ${floatToTime(slotSeleccionado! + duracion)}`}
                            />
                            <ReviewRow icon="hourglass-outline" label="Duración" value={`${duracion} ${duracion === 1 ? 'hora' : 'horas'}`} />

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total a pagar</Text>
                                <Text style={styles.totalValue}>${precioTotal.toLocaleString('es-CO')}</Text>
                            </View>
                        </View>

                        <View style={styles.infoNote}>
                            <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
                            <Text style={styles.infoNoteText}>
                                Tu reserva quedará en estado <Text style={{ fontWeight: '700' }}>Pendiente</Text> de pago. Recuerda efectuar el pago en la cancha al momento de tu reserva.
                            </Text>
                        </View>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                    </View>
                )}

                {/* ─── PASO 3: Confirmación ─────────────────────────────── */}
                {step === 3 && (
                    <View style={[styles.section, styles.successSection]}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark-circle" size={72} color="#10B981" />
                        </View>
                        <Text style={styles.successTitle}>¡Reserva Creada!</Text>
                        <Text style={styles.successSub}>
                            Tu reserva está pendiente de pago.{'\n'}Recuerda abonar al llegar a la cancha.
                        </Text>

                        {reservaFinal && (
                            <View style={[styles.reviewCard, { marginTop: 20 }]}>
                                <ReviewRow icon="storefront-outline" label="Cancha" value={reservaFinal.cancha?.nombre || String(nombreCancha)} />
                                <ReviewRow
                                    icon="calendar-outline"
                                    label="Fecha"
                                    value={new Date(reservaFinal.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                                        weekday: 'long', day: 'numeric', month: 'long',
                                    })}
                                />
                                <ReviewRow icon="time-outline" label="Horario" value={`${reservaFinal.horaInicio} – ${reservaFinal.horaFin}`} />
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>${(reservaFinal.total || 0).toLocaleString('es-CO')}</Text>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.confirmBtnContainer, { marginTop: 20 }]}
                            onPress={() => router.replace('/(tabs)/reservas')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient colors={['#2563EB', '#4F46E5']} style={styles.confirmBtn}>
                                <Ionicons name="calendar-outline" size={18} color="#fff" />
                                <Text style={styles.confirmBtnText}>Ver Mis Reservas</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.outlineBtn}
                            onPress={() => router.replace('/(tabs)/sedes')}
                        >
                            <Text style={styles.outlineBtnText}>Buscar otra cancha</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Footer con botón de acción */}
            {step < 3 && (
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <View style={styles.footerSummary}>
                        <View>
                            <Text style={styles.footerPrecioLabel}>
                                {slotSeleccionado !== null && step === 1
                                    ? `${floatToTime(slotSeleccionado)} – ${floatToTime(slotSeleccionado + duracion)}`
                                    : 'Selecciona un horario'}
                            </Text>
                            <Text style={styles.footerPrecio}>
                                ${precioTotal.toLocaleString('es-CO')}
                            </Text>
                        </View>

                        {step === 1 && (
                            <TouchableOpacity
                                style={[
                                    styles.confirmBtnContainer,
                                    (slotSeleccionado === null || !bloqueoId) && styles.confirmBtnDisabled,
                                ]}
                                disabled={slotSeleccionado === null || !bloqueoId}
                                onPress={() => setStep(2)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient colors={['#2563EB', '#4F46E5']} style={styles.confirmBtn}>
                                    <Text style={styles.confirmBtnText}>Revisar</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {step === 2 && (
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    style={styles.outlineBtnSmall}
                                    onPress={() => setStep(1)}
                                    disabled={confirmando}
                                >
                                    <Ionicons name="arrow-back" size={16} color="#4F46E5" />
                                    <Text style={styles.outlineBtnSmallText}>Atrás</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.confirmBtnContainer, confirmando && styles.confirmBtnDisabled]}
                                    onPress={confirmarReserva}
                                    disabled={confirmando}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient colors={['#2563EB', '#4F46E5']} style={styles.confirmBtn}>
                                        {confirmando
                                            ? <ActivityIndicator color="#fff" size="small" />
                                            : <>
                                                <Ionicons name="checkmark" size={18} color="#fff" />
                                                <Text style={styles.confirmBtnText}>Confirmar</Text>
                                              </>
                                        }
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

// ─── Sub-componente fila de revisión ─────────────────────────────────────────

function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.reviewRow}>
            <View style={styles.reviewIconBg}>
                <Ionicons name={icon as any} size={16} color="#4F46E5" />
            </View>
            <View style={styles.reviewRowText}>
                <Text style={styles.reviewLabel}>{label}</Text>
                <Text style={styles.reviewValue}>{value}</Text>
            </View>
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    // Steps
    stepContainer: {
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    step: {
        alignItems: 'center',
        width: 80,
    },
    stepCircleActive: {
        backgroundColor: '#2563EB',
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    stepNumberActive: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepNumber: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepLabelActive: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    stepLine: {
        height: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
        marginBottom: 16,
        maxWidth: 40,
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
        marginRight: 12,
    },
    headerText: { flex: 1 },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    headerSub: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 1,
    },
    // Sections
    section: {
        backgroundColor: '#fff',
        marginBottom: 8,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    // Duración
    durationRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    durationBtn: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    durationBtnActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    durationBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4B5563',
    },
    durationBtnTextActive: { color: '#4F46E5' },
    // Fecha
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        overflow: 'hidden',
    },
    dateArrow: {
        padding: 14,
        backgroundColor: '#fff',
        margin: 4,
        borderRadius: 10,
    },
    dateDisplay: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        textTransform: 'capitalize',
        textAlign: 'center',
    },
    // Slots
    closedBox: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        gap: 8,
    },
    closedText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 15,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    slot: {
        width: '30%',
        minWidth: 90,
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    slotActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    slotDisabled: {
        backgroundColor: '#F9FAFB',
        opacity: 0.55,
    },
    slotText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    slotTextActive: { color: '#4F46E5' },
    slotTextDisabled: {
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    slotOcupado: {
        fontSize: 9,
        fontWeight: '700',
        color: '#EF4444',
        marginTop: 2,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#6B7280',
    },
    // Error
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 20,
        marginTop: 4,
        marginBottom: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        flex: 1,
        fontWeight: '500',
    },
    // Revisión
    reviewTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 20,
        textAlign: 'center',
    },
    reviewCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    reviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reviewIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewRowText: { flex: 1 },
    reviewLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    reviewValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4F46E5',
    },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoNoteText: {
        flex: 1,
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
    },
    // Éxito
    successSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    successIcon: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    successSub: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingHorizontal: 20,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 12,
    },
    footerSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerPrecioLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    footerPrecio: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    // Botones
    confirmBtnContainer: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmBtnDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    confirmBtn: {
        paddingHorizontal: 22,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 130,
        justifyContent: 'center',
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    outlineBtn: {
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#4F46E5',
        alignItems: 'center',
        marginTop: 12,
    },
    outlineBtnText: {
        color: '#4F46E5',
        fontSize: 15,
        fontWeight: '600',
    },
    outlineBtnSmall: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
    },
    outlineBtnSmallText: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: '600',
    },
});
