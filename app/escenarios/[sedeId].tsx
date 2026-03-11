import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../utils/api'; // Local API configuration to bypass Redux overlap

const { width } = Dimensions.get('window');

// Fallback image in case the Venue doesn't have cover photos
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop";

export default function EscenariosScreen() {
    const { sedeId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [escenarios, setEscenarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLocalEscenarios = async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            const { data } = await api.get(`/sedes?view=escenarios&sedeId=${sedeId}`);
            setEscenarios(data);
        } catch (err: any) {
            setError(err.message || "Error al cargar los escenarios");
            setEscenarios([]); // Clear scenarios on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sedeId) {
            fetchLocalEscenarios();
        }
    }, [sedeId]);

    const renderEscenarioCard = ({ item }: { item: any }) => {
        // Pick the first image in array or fallback
        const coverImage = item.imagenes && item.imagenes.length > 0
            ? { uri: item.imagenes[0] }
            : { uri: FALLBACK_IMAGE };

        return (
            <View style={styles.card}>
                <Image source={coverImage} style={styles.cardImage} resizeMode="cover" />

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.nombre}</Text>
                    </View>

                    <View style={styles.tagsContainer}>
                        {item.tipoCancha && (
                            <View style={styles.tag}>
                                <Ionicons name="football-outline" size={14} color="#3B5ADB" />
                                <Text style={styles.tagText}>{item.tipoCancha}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>Precio por hora</Text>
                            <Text style={styles.priceValue}>${item.precioHora?.toLocaleString("es-AR") || 0}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                // Future Implementation: Navigate to Booking process
                                console.log("Reservar Escenario:", item._id);
                            }}
                        >
                            <Text style={styles.actionButtonText}>Reservar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={styles.mainTitle}>Escenarios</Text>
                    <Text style={styles.subTitle}>
                        {escenarios?.length || 0} canchas disponibles
                    </Text>
                </View>
            </View>

            {/* Content */}
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
                <FlatList
                    data={escenarios}
                    keyExtractor={(item) => item.escenarioId || item._id}
                    renderItem={renderEscenarioCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    subTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    listContainer: {
        padding: 20,
        gap: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 4,
    },
    cardImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#E5E7EB',
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    tagText: {
        color: '#3B5ADB',
        fontSize: 13,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    priceLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#3B5ADB',
    },
    actionButton: {
        backgroundColor: '#3B5ADB',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#3B5ADB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
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
