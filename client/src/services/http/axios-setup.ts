import axios, { AxiosError, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '../types';

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

export const mainAxios = axios.create({
    baseURL: DEFAULT_API_URL,
    withCredentials: true,
});

mainAxios.interceptors.response.use(
    (response): AxiosResponse => {
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
            console.error('[API Error]:', error.response.status, error.response.data);
            if(typeof window !== 'undefined') {
                toast.dismiss()
                toast.error(error.response.data.message || 'An error occurred');
            }
        } else {
            console.error('[Network Error]:', error.message);
            if(typeof window !== 'undefined'){
                toast.dismiss()
                toast.error('Network error occurred. Please try again later.');
            }
        }

        return Promise.reject(error);
    }
);