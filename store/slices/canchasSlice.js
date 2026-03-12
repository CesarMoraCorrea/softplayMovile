import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

/**
 * Thunk para obtener la lista de Sedes (Complejos deportivos):
 * Se conecta al endpoint `/sedes` del backend. Acepta opcionalmente un string de consulta (query)
 * para filtrar la búsqueda (por ejemplo, buscar por nombre, o enviar coordenadas lat/lng para ver cercanía).
 */
export const fetchCanchas = createAsyncThunk("canchas/list", async (query = "") => {
    const url = query ? `/sedes?${query}` : "/sedes";
    const { data } = await api.get(url);
    return data;
});

/**
 * Slice de Redux para manejar las Sedes (Canchas):
 * Mantiene en memoria global la lista de sedes cargadas para que vistas como el Mapa o la Lista
 * no tengan que hacer peticiones duplicadas a la API cada que el usuario navega entre ellas.
 */
const canchasSlice = createSlice({
    name: "canchas",
    initialState: {
        list: [],        // Arreglo donde guardamos todas las sedes obtenidas de la base de datos
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCanchas.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCanchas.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.list = payload;
            })
            .addCase(fetchCanchas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Error al cargar las sedes";
            });
    },
});

export default canchasSlice.reducer;
