import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import api from '../../utils/api';

interface CaptchaProps {
    onCaptchaChange: (id: string, input: string) => void;
    onVerifiedChange: (isValid: boolean) => void;
    error?: string;
    disabled?: boolean;
}

export default function Captcha({ onCaptchaChange, onVerifiedChange, error, disabled }: CaptchaProps) {
    const [captchaData, setCaptchaData] = useState<{ id: string; svg: string } | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');

    const loadCaptcha = async () => {
        try {
            setLoading(true);
            setFetchError('');
            setInputValue('');
            onVerifiedChange(false);
            onCaptchaChange('', '');

            const response = await api.get('/captcha/generate');
            setCaptchaData({
                id: response.data.captchaId,
                svg: response.data.captchaSvg,
            });
        } catch (err: any) {
            console.error('Error loading captcha:', err);
            setFetchError('No se pudo cargar el captcha');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCaptcha();
    }, []);

    const handleInputChange = (text: string) => {
        setInputValue(text);
        if (captchaData) {
            onCaptchaChange(captchaData.id, text);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!captchaData || !inputValue) {
                onVerifiedChange(false);
                return;
            }

            try {
                const response = await api.post('/captcha/check', {
                    captchaId: captchaData.id,
                    captchaInput: inputValue
                });
                const isValid = Boolean(response.data?.valid);
                onVerifiedChange(isValid);
            } catch (err) {
                onVerifiedChange(false);
            }
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [inputValue, captchaData?.id]);

    return (
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Ionicons name="shield-checkmark" size={16} color="#9CA3AF" />
                <Text style={styles.label}>Verificación de seguridad</Text>
            </View>

            <View style={styles.captchaContainer}>
                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator color="#4F46E5" />
                    </View>
                ) : fetchError ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorTextSmall}>{fetchError}</Text>
                    </View>
                ) : captchaData?.svg ? (
                    <View style={styles.svgWrapper}>
                        {/* Renderizamos la imagen SVG proveniente del servidor de forma nativa */}
                        <SvgXml xml={captchaData.svg} width="150" height="50" fallback={
                            <Text>Error SVG</Text>
                        } />
                    </View>
                ) : null}

                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={loadCaptcha}
                    disabled={loading || disabled}
                >
                    <Ionicons name="refresh" size={20} color="#4B5563" />
                </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
                <TextInput
                    style={styles.input}
                    placeholder="Escribe los caracteres de la imagen"
                    value={inputValue}
                    onChangeText={handleInputChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading && !disabled}
                />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    captchaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    svgWrapper: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    loadingBox: {
        width: 150,
        height: 50,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorBox: {
        width: 150,
        height: 50,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    refreshBtn: {
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
    },
    inputWrapperError: {
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1F2937',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    errorTextSmall: {
        color: '#DC2626',
        fontSize: 10,
        textAlign: 'center',
    }
});
