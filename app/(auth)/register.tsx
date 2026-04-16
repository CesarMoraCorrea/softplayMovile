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
import Captcha from '../../components/ui/Captcha';
import { registerThunk } from '../../store/slices/authSlice';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState<any>({});
    const [touched, setTouched] = useState<any>({});
    
    // Estados para el CAPTCHA
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
    }, [user, router]);

    useEffect(() => {
        const errors: any = {};
        if (touched.nombre && !formData.nombre) errors.nombre = "El nombre es requerido";
        
        if (touched.email && !formData.email) {
            errors.email = "El email es requerido";
        } else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Formato de email inválido";
        }
        
        if (touched.telefono && !formData.telefono) {
            errors.telefono = "El teléfono es requerido";
        }

        if (touched.password && !formData.password) {
            errors.password = "La contraseña es requerida";
        } else if (touched.password && formData.password.length < 6) {
            errors.password = "Debe tener al menos 6 caracteres";
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
        setTouched({ nombre: true, email: true, telefono: true, password: true, captcha: true });

        if (
            Object.keys(formErrors).length === 0 && 
            formData.nombre && formData.email && formData.telefono && formData.password && captchaInput
        ) {
            // @ts-ignore
            dispatch(registerThunk({
                name: formData.nombre, // El backend espera 'name'
                email: formData.email,
                telefono: formData.telefono, // Se envía por si el backend lo acepta a futuro
                password: formData.password,
                captchaId: captchaId,
                captchaInput: captchaInput
            }));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
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
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person-add" size={32} color="#FFF" />
                    </View>
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Regístrate para reservar escenarios</Text>
                </View>

                <View style={styles.formCard}>
                    {/* Nombre */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="person" size={16} color="#6B7280" />
                            <Text style={styles.label}>Nombre completo</Text>
                        </View>
                        <View style={[styles.inputWrapper, formErrors.nombre && styles.inputWrapperError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Tu nombre y apellido"
                                value={formData.nombre}
                                onChangeText={(val) => handleInputChange('nombre', val)}
                                onBlur={() => handleBlur('nombre')}
                                editable={!loading}
                            />
                        </View>
                        {formErrors.nombre && <Text style={styles.errorText}>{formErrors.nombre}</Text>}
                    </View>

                    {/* Email */}
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

                    {/* Teléfono */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="call" size={16} color="#6B7280" />
                            <Text style={styles.label}>Teléfono</Text>
                        </View>
                        <View style={[styles.inputWrapper, formErrors.telefono && styles.inputWrapperError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: 3001234567"
                                value={formData.telefono}
                                onChangeText={(val) => handleInputChange('telefono', val)}
                                onBlur={() => handleBlur('telefono')}
                                keyboardType="phone-pad"
                                editable={!loading}
                            />
                        </View>
                        {formErrors.telefono && <Text style={styles.errorText}>{formErrors.telefono}</Text>}
                    </View>

                    {/* Password */}
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

                    {error && (
                        <View style={styles.serverError}>
                            <Text style={styles.serverErrorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.submitBtn, (loading || Object.keys(formErrors).length > 0 || !captchaVerified) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={loading || Object.keys(formErrors).length > 0 || !captchaVerified}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitBtnText}>Registrarse</Text>
                        )}
                    </TouchableOpacity>

                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => router.back()} disabled={loading}>
                        <Text style={styles.footerLink}>Inicia sesión</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFF6FF',
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
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 8,
        zIndex: 1,
    },
    iconContainer: {
        backgroundColor: '#4F46E5',
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
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
        borderRadius: 12,
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
    submitBtn: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 15,
    },
    footerLink: {
        color: '#4F46E5',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
