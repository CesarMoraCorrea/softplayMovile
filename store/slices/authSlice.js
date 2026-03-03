import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api.js";

export const loginThunk = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/login", payload);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Error de conexión";
        return rejectWithValue(message);
    }
});

// Dummy thunk if register needed, similarly migrated like web
export const registerThunk = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/register", payload);
        return data;
    } catch (error) {
        const message = error.response?.data?.message || "Error de conexión";
        return rejectWithValue(message);
    }
});

export const meThunk = createAsyncThunk("auth/me", async () => {
    const { data } = await api.get("/auth/me");
    return data;
});

const initialState = {
    token: null,
    user: null,
    loading: false,
    error: null,
    isInitialized: false,
};

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
