import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Captcha from '../../components/ui/Captcha';
import { loginThunk } from '../../store/slices/authSlice';

/**
 * Pantalla de Inicio de Sesión (LoginScreen):
 * Este componente maneja la autenticación del usuario. Utiliza estados locales para el control
 * de los campos del formulario (email, password) y la validación de un Captcha (SVG) dinámico.
 * Si todo es correcto, despacha la acción a Redux para guardar la sesión.
 */
export default function LoginScreen() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<any>({});
    const [touched, setTouched] = useState<any>({});
    const [captchaId, setCaptchaId] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaVerified, setCaptchaVerified] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();
    const { user, loading, error } = useSelector((state: any) => state.auth);

    useEffect(() => {
        if (user) {
            router.replace('/(tabs)');
        }
    }, [user]);

    useEffect(() => {
        const errors: any = {};
        if (touched.email && !formData.email) {
            errors.email = "El email es requerido";
        } else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Formato de email inválido";
        }

        if (touched.password && !formData.password) {
            errors.password = "La contraseña es requerida";
        }

        if (touched.captcha && !captchaInput) {
            errors.captcha = "El código de verificación es requerido";
        }

        setFormErrors(errors);
    }, [formData, touched, captchaInput]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: string) => {
        setTouched((prev: any) => ({ ...prev, [field]: true }));
    };

    const handleCaptchaChange = (id: string, input: string) => {
        setCaptchaId(id);
        setCaptchaInput(input);
    };

    const handleSubmit = () => {
        // Marcamos todos los campos como "tocados" para activar la alerta roja en caso de que estén vacíos
        setTouched({ email: true, password: true, captcha: true });

        if (Object.keys(formErrors).length === 0 && formData.email && formData.password && captchaInput) {
            // @ts-ignore
            dispatch(loginThunk({
                ...formData,
                captchaId: captchaId,
                captchaInput: captchaInput
            }));
        }
    };

    return (
        // LinearGradient: Fondo premium estilo web
        <LinearGradient
            colors={['#EFF6FF', '#FFFFFF', '#EEF2FF']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.header}>
                    <LinearGradient
                        colors={['#2563EB', '#4F46E5']}
                        style={styles.iconContainer}
                    >
                        <Ionicons name="lock-closed" size={32} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.title}>¡Bienvenido!</Text>
                    <Text style={styles.subtitle}>Ingresa a tu cuenta para continuar</Text>
                </View>

                <View style={styles.formCard}>
                    {/* Campo de Correo Electrónico */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="mail" size={16} color="#6B7280" />
                            <Text style={styles.label}>Correo electrónico</Text>
                        </View>
                        <View style={[styles.inputWrapper, formErrors.email && styles.inputWrapperError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChangeText={(val) => handleInputChange('email', val)}
                                onBlur={() => handleBlur('email')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>
                        {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
                    </View>

                    {/* Campo de Contraseña */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="lock-closed" size={16} color="#6B7280" />
                            <Text style={styles.label}>Contraseña</Text>
                        </View>
                        <View style={[styles.inputWrapper, formErrors.password && styles.inputWrapperError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={formData.password}
                                onChangeText={(val) => handleInputChange('password', val)}
                                onBlur={() => handleBlur('password')}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                                disabled={loading}
                            >
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                        {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}
                    </View>

                    {/* CAPTCHA */}
                    <Captcha
                        onCaptchaChange={handleCaptchaChange}
                        onVerifiedChange={setCaptchaVerified}
                        error={formErrors.captcha}
                        disabled={loading}
                    />

                    {/* Renderización de errores devueltos por Vercel / Redux (ej. "Contraseña incorrecta") */}
                    {error && (
                        <View style={styles.serverError}>
                            <Text style={styles.serverErrorText}>{error}</Text>
                        </View>
                    )}

                    {/* Botón para Iniciar Sesión */}
                    <TouchableOpacity
                        style={[styles.submitBtnContainer, (loading || Object.keys(formErrors).length > 0 || !captchaVerified) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading || Object.keys(formErrors).length > 0 || !captchaVerified}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#2563EB', '#4F46E5']}
                            style={styles.submitBtn}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Iniciar sesión</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                </View>

                {/* Enlace a Registro */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                    <Text style={{ color: '#6B7280', fontSize: 15 }}>¿No tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')} disabled={loading}>
                        <Text style={{ color: '#3B82F6', fontSize: 15, fontWeight: 'bold' }}>Regístrate</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
    },
    inputWrapperError: {
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1F2937',
    },
    eyeIcon: {
        padding: 14,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    serverError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    serverErrorText: {
        color: '#B91C1C',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    submitBtnContainer: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    submitBtnDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
