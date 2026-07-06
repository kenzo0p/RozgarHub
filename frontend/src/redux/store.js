import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import jobSlice from "./jobSlice.js";
import companySlice from "./companySlice.js";
import applicationSlice from "./applicationSlice.js";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
// ESM build — the CJS path (redux-persist/lib/storage) resolves to a module
// namespace under Vite 8's stricter interop, breaking storage.getItem/setItem
import storage from "redux-persist/es/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  // Only the session survives a reload. Persisting the data slices kept
  // stale jobs/companies/applicants in localStorage (including other users'
  // data on shared machines) — those are always fetched fresh instead.
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authSlice,
  job: jobSlice,
  company: companySlice,
  application: applicationSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
