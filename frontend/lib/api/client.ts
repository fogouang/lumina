import { handleApiError } from "./config";

export const apiClient = {
  async request<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      return await handleApiError(error) as T;
    }
  },
};