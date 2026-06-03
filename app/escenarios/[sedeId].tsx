import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

// Imagen por defecto en caso de que la Sede no tenga fotos para mostrar
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop";

/**
 * Pantalla de Escenarios (Canchas de una Sede Específica):
 * A diferencia de la pantalla anterior que usa Redux Global, AQUÍ usamos una lógica 100% local (useState + useEffect).
 * Esto evita el "choque de tarjetas" y cruce de datos al ir y volver entre ambas pantallas.
 * 
 * Capturamos el `sedeId` de la URL dinámicamente y se lo pasamos al servidor para filtrar.
 */
export default function EscenariosScreen() {
    const { sedeId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [escenarios, setEscenarios] = useState<any[]>([]);
    const [sede, setSede] = useState<any>(null);
    const [deporte, setDeporte] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para obtener los escenarios de la sede actual desde nuestro backend
    const fetchLocalEscenarios = async () => {
        try {
            setLoading(true);
            setError(null);
            // Traemos info de la sede y sus escenarios
            const { data: sedeData } = await api.get(`/sedes/${sedeId}`);
            setSede(sedeData);
            
            const { data } = await api.get(`/sedes?view=escenarios&sedeId=${sedeId}`);
            setEscenarios(data);
        } catch (err: any) {
            setError(err.message || "Error al cargar los escenarios");
            setEscenarios([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sedeId) {
            fetchLocalEscenarios();
        }
    }, [sedeId]);

    const deportes = useMemo(() => {
        return [...new Set(escenarios.filter(e => e.activo !== false).map(e => e.tipoCancha || e.tipoDeporte))].sort();
    }, [escenarios]);

    const escenariosFiltrados = useMemo(() => {
        return deporte ? escenarios.filter(e => e.activo !== false && (e.tipoCancha === deporte || e.tipoDeporte === deporte)) : [];
    }, [escenarios, deporte]);

    const DEPORTE_ICONS: any = {
        "Fútbol": "⚽",
        "Futbol": "⚽",
        "Fútbol 5": "⚽",
        "Fútbol 7": "⚽",
        "Fútbol 11": "⚽",
        "Tenis": "🎾",
        "Pádel": "🎾",
        "Padel": "🎾",
        "Básquet": "🏀",
        "Basquet": "🏀",
        "Vóley": "🏐",
        "Voley": "🏐"
    };

    const renderEscenarioCard = ({ item }: { item: any }) => {
        const coverImage = item.imagenes && item.imagenes.length > 0
            ? { uri: item.imagenes[0] }
            : { uri: FALLBACK_IMAGE };

        return (
            <TouchableOpacity 
                style={styles.card} 
                activeOpacity={0.9}
                onPress={() => {
                    router.push({
                        pathname: `/reservas/[escenarioId]` as any,
                        params: { 
                            escenarioId: item.escenarioId || item._id, 
                            sedeId: sedeId,
                            nombreCancha: item.nombre,
                            precioHora: item.precioPorHora || item.precioHora || 0
                        }
                    });
                }}
            >
                <View style={styles.cardImageContainer}>
                    <Image source={coverImage} style={styles.cardImage} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.cardGradient}
                    />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.nombre}</Text>
                        <View style={styles.superficieBadge}>
                            <Text style={styles.superficieText}>{item.superficie || item.tipoCancha || "Sintética"}</Text>
                        </View>
                    </View>

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>PRECIO</Text>
                            <Text style={styles.priceValue}>${(item.precioPorHora || item.precioHora || 0).toLocaleString("es-AR")}<Text style={styles.priceSuffix}>/h</Text></Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.cardFooter}>
                    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.cardFooterGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
                        <Text style={styles.cardFooterText}>Reservar escenario</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Encabezado de la pantalla con el botón para regresar */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={styles.mainTitle} numberOfLines={1}>{sede?.nombre || "Cargando..."}</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={14} color="#6B7280" />
                        <Text style={styles.subTitle} numberOfLines={1}>
                            {sede?.ubicacion?.direccion || ""}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stepper */}
            <View style={styles.stepperContainer}>
                <View style={styles.step}>
                    <View style={[styles.stepCircle, styles.stepCircleActive]}>
                        <Text style={styles.stepNumberActive}>1</Text>
                    </View>
                    <Text style={styles.stepLabelActive}>CANCHA</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.step}>
                    <View style={styles.stepCircle}>
                        <Text style={styles.stepNumber}>2</Text>
                    </View>
                    <Text style={styles.stepLabel}>HORARIO</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.step}>
                    <View style={styles.stepCircle}>
                        <Text style={styles.stepNumber}>3</Text>
                    </View>
                    <Text style={styles.stepLabel}>CONFIRMAR</Text>
                </View>
            </View>

            {/* Contenido principal: manejamos los estados de carga, error o la lista de canchas */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3B5ADB" />
                    <Text style={styles.loadingText}>Cargando escenarios...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text style={styles.errorText}>Oops! Algo salió mal.</Text>
                    <Text style={styles.errorSubText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setLoading(true);
                            api.get(`/sedes?view=escenarios&sedeId=${sedeId}`)
                                .then(({ data }) => { setEscenarios(data); setError(null); })
                                .catch((err) => setError(err.message || "Error al cargar"))
                                .finally(() => setLoading(false));
                        }}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : escenarios?.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="basketball-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No hay escenarios disponibles</Text>
                    <Text style={styles.emptySubtitle}>Esta sede aún no tiene canchas registradas.</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryButtonText}>Volver a Sedes</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.filtersContainer}>
                        <Text style={styles.sectionTitle}>DEPORTE</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deportesList}>
                            {deportes.map((d, index) => (
                                <TouchableOpacity 
                                    key={`deporte-${String(d)}-${index}`}
                                    style={[styles.deporteBtn, deporte === d && styles.deporteBtnActive]}
                                    onPress={() => setDeporte(d as string)}
                                >
                                    <Text style={styles.deporteEmoji}>{DEPORTE_ICONS[d as string] || "🏟️"}</Text>
                                    <Text style={[styles.deporteText, deporte === d && styles.deporteTextActive]}>{String(d)}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {!deporte ? (
                        <View style={styles.centerContainer}>
                            <Text style={{ fontSize: 32, marginBottom: 12 }}>👈</Text>
                            <Text style={styles.emptySubtitle}>Selecciona un deporte para ver los escenarios</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={escenariosFiltrados}
                            keyExtractor={(item) => item.escenarioId || item._id}
                            renderItem={renderEscenarioCard}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={() => (
                                <Text style={styles.sectionTitle}>ESCENARIOS DISPONIBLES · {deporte?.toUpperCase()}</Text>
                            )}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 10,
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        marginLeft: -8,
    },
    headerTitles: {
        flex: 1,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    subTitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    step: {
        alignItems: 'center',
        width: 80,
    },
    stepCircleActive: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
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
    filtersContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 12,
    },
    deportesList: {
        gap: 12,
        paddingBottom: 20,
    },
    deporteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    deporteBtnActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    deporteEmoji: {
        fontSize: 18,
    },
    deporteText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    deporteTextActive: {
        color: '#FFFFFF',
    },
    listContainer: {
        padding: 20,
        paddingTop: 0,
        gap: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 8,
    },
    cardImageContainer: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E5E7EB',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    cardContent: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 6,
    },
    superficieBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    superficieText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    priceLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        marginBottom: 2,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    priceValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#2563EB',
    },
    priceSuffix: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    cardFooter: {
        width: '100%',
    },
    cardFooterGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    cardFooterText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    errorSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    retryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    emptySubtitle: {
        marginTop: 8,
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
    },
});
