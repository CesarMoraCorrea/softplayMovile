import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCanchas } from '../../store/slices/canchasSlice'; // Alias used in Web for Venues

const { width } = Dimensions.get('window');

export default function SedesScreen() {
    const dispatch = useDispatch();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { list: sedes, loading, error } = useSelector((state: any) => state.canchas);

    useEffect(() => {
        // @ts-ignore
        dispatch(fetchCanchas(""));
    }, [dispatch]);

    const renderSedeCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{item.nombre}</Text>
                    <Text style={styles.cardSubtitle}>
                        {item.ubicacion?.direccion || "Dirección no disponible"}
                    </Text>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="business" size={24} color="#3B5ADB" />
                </View>
            </View>

            <View style={styles.cardInfoRow}>
                <Text style={styles.infoText}>{(item.escenarios || []).length} escenarios</Text>
                <Text style={styles.infoText}>{item.ubicacion?.barrio || "Sin barrio"}</Text>
            </View>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                    // Navigating to Escenarios list inside the venue in the future
                    console.log("Navegar a Escenarios de Sede:", item._id);
                }}
            >
                <Text style={styles.actionButtonText}>Ver escenarios</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={styles.mainTitle}>Encuentra tu sede</Text>
                    <Text style={styles.subTitle}>
                        {sedes?.length || 0} sedes disponibles cerca de ti
                    </Text>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3B5ADB" />
                    <Text style={styles.loadingText}>Cargando sedes...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text style={styles.errorText}>Oops! Algo salió mal.</Text>
                    <Text style={styles.errorSubText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        // @ts-ignore
                        onPress={() => dispatch(fetchCanchas(""))}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : sedes?.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="map-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No se encontraron sedes</Text>
                    <Text style={styles.emptySubtitle}>Intenta ajustar tu búsqueda más tarde.</Text>
                </View>
            ) : (
                <FlatList
                    data={sedes}
                    keyExtractor={(item) => item._id}
                    renderItem={renderSedeCard}
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
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: 24,
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
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitleContainer: {
        flex: 1,
        paddingRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    actionButton: {
        backgroundColor: '#3B5ADB',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
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
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    emptySubtitle: {
        marginTop: 8,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
