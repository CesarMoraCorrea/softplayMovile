import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchCanchas } from '../../store/slices/canchasSlice'; // Acción para recuperar las Sedes (Canchas globalmente) desde Redux

const { width } = Dimensions.get('window');

/**
 * Pantalla de Sedes (Complejos Deportivos):
 * Al entrar, este componente dispara una acción (Thunk) a nuestro estado global de Redux (`canchasSlice`).
 * Redux se encarga de ir a buscar la información a Vercel y nos la devuelve.
 * 
 * Usamos `useFocusEffect` en lugar de un `useEffect` tradicional para forzar que los datos se recarguen 
 * CADA VEZ que el usuario vuelve a ver esta pantalla (ej. usando la flecha de Atrás).
 */
export default function SedesScreen() {
    const dispatch = useDispatch();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { list: sedes, loading, error } = useSelector((state: any) => state.canchas);
    const [busqueda, setBusqueda] = useState("");
    const [vistaActual, setVistaActual] = useState("lista");

    useFocusEffect(
        useCallback(() => {
            // @ts-ignore
            dispatch(fetchCanchas(""));
        }, [dispatch])
    );

    const renderSedeCard = ({ item }: { item: any }) => {
        const imagenPrincipal = item.imagenes && item.imagenes.length > 0
            ? item.imagenes[0]
            : 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000';

        return (
            <TouchableOpacity 
                style={styles.card} 
                activeOpacity={0.9} 
                onPress={() => router.push(`/escenarios/${item._id}` as any)}
            >
                <Image source={{ uri: imagenPrincipal }} style={styles.cardImage} />
                
                <View style={styles.cardBody}>
                    <View style={styles.cardHeaderRow}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color="#6B7280" />
                                <Text style={styles.cardSubtitle} numberOfLines={1}>
                                    {item.ubicacion?.direccion || "Dirección no disponible"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.iconBadge}>
                            <Ionicons name="business" size={20} color="#3B82F6" />
                        </View>
                    </View>

                    <View style={styles.cardInfoRow}>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>{(item.escenarios || []).length} escenarios</Text>
                        </View>
                        <Text style={styles.barrioText}>{item.ubicacion?.barrio || "Sin barrio"}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.actionButtonContainer}
                        onPress={() => router.push(`/escenarios/${item._id}` as any)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>Reservar aquí</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Piezas del Encabezado Superior */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.headerTop}>
                    <Text style={styles.mainTitle}>Encuentra tu sede</Text>
                    <Text style={styles.subTitle}>
                        {sedes?.length || 0} sedes disponibles cerca de ti
                    </Text>
                </View>

                {/* Buscador y Filtros */}
                <View style={styles.searchRow}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscador de canchas..."
                            value={busqueda}
                            onChangeText={setBusqueda}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={20} color="#374151" />
                        <Text style={styles.filterBtnText}>Filtros</Text>
                    </TouchableOpacity>
                </View>

                {/* Segmented Control */}
                <View style={styles.segmentedControl}>
                    <TouchableOpacity 
                        style={[styles.segment, vistaActual === 'mapa' && styles.segmentActive]}
                        onPress={() => setVistaActual('mapa')}
                    >
                        <Ionicons name="map" size={16} color={vistaActual === 'mapa' ? "#3B82F6" : "#6B7280"} />
                        <Text style={[styles.segmentText, vistaActual === 'mapa' && styles.segmentTextActive]}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.segment, vistaActual === 'lista' && styles.segmentActive]}
                        onPress={() => setVistaActual('lista')}
                    >
                        <Ionicons name="list" size={16} color={vistaActual === 'lista' ? "#3B82F6" : "#6B7280"} />
                        <Text style={[styles.segmentText, vistaActual === 'lista' && styles.segmentTextActive]}>Lista</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenido Dinámico de la Lista según su Estado */}
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
    },
    headerTop: {
        alignItems: 'center',
        marginBottom: 16,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#1F2937',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 44,
        gap: 6,
    },
    filterBtnText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        alignSelf: 'center',
        width: 240,
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    segmentActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    segmentTextActive: {
        color: '#3B82F6',
    },
    listContainer: {
        padding: 20,
        gap: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardBody: {
        padding: 20,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    iconBadge: {
        backgroundColor: '#EFF6FF',
        padding: 10,
        borderRadius: 12,
    },
    cardInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pill: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    barrioText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    actionButtonContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    actionButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
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
