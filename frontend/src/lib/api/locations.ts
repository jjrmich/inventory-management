import apiClient from './client';

export interface Location {
    id: number;
    code: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LocationRequest {
    code: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    active: boolean;
}

export const locationsApi = {
    getAll: () => apiClient.get<Location[]>('/locations').then(r => r.data),
    getById: (id: number) => apiClient.get<Location>(`/locations/${id}`).then(r => r.data),
    getActive: () => apiClient.get<Location[]>('/locations/active').then(r => r.data),
    create: (data: LocationRequest) => apiClient.post<Location>('/locations', data).then(r => r.data),
    update: (id: number, data: LocationRequest) => apiClient.put<Location>(`/locations/${id}`, data).then(r => r.data),
    deactivate: (id: number) => apiClient.patch(`/locations/${id}/deactivate`).then(r => r.data),
    delete: (id: number) => apiClient.delete(`/locations/${id}`).then(r => r.data),
};