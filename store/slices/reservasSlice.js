import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api.js";

/**
 * Thunk para obtener las reservas del usuario autenticado.
 * Llama al endpoint GET /reservas/mias del backend.
 */
export const misReservasThunk = createAsyncThunk(
    "reservas/misReservas",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/reservas/mias");
            return data;
        } catch (error) {
            const message = error.response?.data?.message || "Error al cargar reservas";
            return rejectWithValue(message);
        }
    }
);

/**
 * Thunk para cancelar una reserva del usuario.
 * Llama al endpoint DELETE /reservas/:id del backend.
 */
export const cancelarReservaThunk = createAsyncThunk(
    "reservas/cancelar",
    async (reservaId, { rejectWithValue }) => {
        try {
            await api.delete(`/reservas/${reservaId}`);
            return reservaId;
        } catch (error) {
            const message = error.response?.data?.message || "Error al cancelar la reserva";
            return rejectWithValue(message);
        }
    }
);

// Estado inicial del módulo de reservas
const initialState = {
    list: [],        // Array de reservas del usuario
    loading: false,  // Indicador de carga
    error: null,     // Mensaje de error si aplica
};

const reservasSlice = createSlice({
    name: "reservas",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Carga de reservas
            .addCase(misReservasThunk.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(misReservasThunk.fulfilled, (s, { payload }) => {
                s.loading = false;
                s.list = payload;
            })
            .addCase(misReservasThunk.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload || a.error.message;
            })
            // Cancelación de reserva
            .addCase(cancelarReservaThunk.pending, (s) => {
                s.loading = true;
            })
            .addCase(cancelarReservaThunk.fulfilled, (s, { payload: reservaId }) => {
                s.loading = false;
                // Removemos la reserva cancelada de la lista en lugar de refetch
                s.list = s.list.filter((r) => r._id !== reservaId);
            })
            .addCase(cancelarReservaThunk.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload || a.error.message;
            });
    },
});

export default reservasSlice.reducer;
