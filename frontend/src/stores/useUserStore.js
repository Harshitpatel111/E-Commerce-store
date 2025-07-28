import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      checkingAuth: true,
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
          set({ loading: false });
          return toast.error("Passwords do not match");
        }

        try {
          const res = await axios.post("/auth/signup", { name, email, password });
          set({ user: res.data, loading: false });
        } catch (error) {
          set({ loading: false });
          toast.error(error.response?.data?.message || "An error occurred");
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await axios.post("/auth/login", { email, password });
          set({ user: res.data, loading: false });
        } catch (error) {
          set({ loading: false });
          toast.error(error.response?.data?.message || "An error occurred");
        }
      },

      logout: async () => {
        try {
          await axios.post("/auth/logout");
          set({ user: null });
        } catch (error) {
          toast.error(error.response?.data?.message || "An error occurred during logout");
        }
      },

    checkAuth: async () => {
	set({ checkingAuth: true });
	try {
		const response = await axios.get("/auth/profile"); // must send cookie
		set({ user: response.data, checkingAuth: false });
	} catch (error) {
		console.log("⚠️ checkAuth error:", error.message);
		set({ user: null, checkingAuth: false });

		// 👉 TRY to refresh access token
		try {
			await get().refreshToken();
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (refreshError) {
			console.log("❌ refresh failed:", refreshError.message);
		}
	}
},


      refreshToken: async () => {
        if (get().checkingAuth) return;
        set({ checkingAuth: true });
        try {
          const response = await axios.post("/auth/refresh-token");
          set({ checkingAuth: false });
          return response.data;
        } catch (error) {
          set({ user: null, checkingAuth: false });
          throw error;
        }
      }
    }),
    {
      name: "user-store",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated();
      },
    }
  )
);

// Axios interceptor for auto-refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
