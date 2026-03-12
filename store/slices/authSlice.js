import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api.js";

/**
 * Thunk para el Inicio de Sesión:
 * Se comunica con la ruta `/auth/login` de nuestro backend en Vercel.
 * Si las credenciales y el captcha son correctos, devuelve la información del usuario y el token de acceso.
 */

export const loginThunk = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/login", payload);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Error de conexión";
        return rejectWithValue(message);
    }
});

/**
 * Thunk para el Registro de Usuario:
 * Transacción asincrónica configurada para manejar futuros registros en la aplicación móvil.
 * Sigue la misma estructura de manejo de errores y conexión que el inicio de sesión.
 */
export const registerThunk = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/register", payload);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Error de conexión";
        return rejectWithValue(message);
    }
});

/**
 * Thunk para verificar la Sesión Actual:
 * Llama a `/auth/me` enviando el token guardado para confirmar si el usuario sigue con una sesión válida.
 */
export const meThunk = createAsyncThunk("auth/me", async () => {
    const { data } = await api.get("/auth/me");
    return data;
});

// Estado inicial global para la autenticación en la app móvil
const initialState = {
    token: null,          // Token JWT de acceso
    user: null,           // Objeto con la información del usuario (nombre, id, rol, etc.)
    loading: false,       // Indicador de estado de carga para bloquear botones mientras esperamos a la API
    error: null,          // Mensaje de error para mostrar en la interfaz (ej. "Contraseña incorrecta")
    isInitialized: false, // Bandera para saber si ya revisamos si el usuario tenía una sesión guardada localmente
};

/**
 * Slice de Autenticación de Redux:
 * Controla reactivamente cómo cambia nuestra tienda global cuando despachamos las acciones de login o logout.
 */
const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setInitialState: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isInitialized = true;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            AsyncStorage.removeItem("token");
            AsyncStorage.removeItem("user");
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loginThunk.pending, s => { s.loading = true; s.error = null; })
            .addCase(loginThunk.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.token = payload.token;
                s.user = payload.user;
                AsyncStorage.setItem("token", payload.token);
                AsyncStorage.setItem("user", JSON.stringify(payload.user));
            })
            .addCase(loginThunk.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload || a.error.message;
            })
            .addCase(registerThunk.pending, s => { s.loading = true; s.error = null; })
            .addCase(registerThunk.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.token = payload.token;
                s.user = payload.user;
                AsyncStorage.setItem("token", payload.token);
                AsyncStorage.setItem("user", JSON.stringify(payload.user));
            })
            .addCase(registerThunk.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload || a.error.message;
            })
            .addCase(meThunk.fulfilled, (s, { payload }) => {
                s.user = payload;
            });
    }
});

export const { logout, setInitialState } = slice.actions;
export default slice.reducer;
