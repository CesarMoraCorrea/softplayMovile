import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/authSlice.js";
import canchas from "./slices/canchasSlice.js";

// Por ahora solo agregamos el slice de auth, los demás los podemos ir agregando
export default configureStore({
    reducer: { auth, canchas }
});
