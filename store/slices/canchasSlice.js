import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Acepta un query string (e.g. "q=x&lat=...&lng=...")
export const fetchCanchas = createAsyncThunk("canchas/list", async (query = "") => {
    const url = query ? `/sedes?${query}` : "/sedes";
    const { data } = await api.get(url);
    return data;
});

const canchasSlice = createSlice({
    name: "canchas",
    initialState: {
        list: [],
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
