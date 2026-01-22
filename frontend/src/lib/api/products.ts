import apiClient from './client';

export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    category: string;
    price: number;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductRequest {
    sku: string;
    name: string;
    description: string;
    category: string;
    price: number;
    imageUrl?: string;
    active?: boolean;
}

export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    empty: boolean;
}

export const productsApi = {
    getAll: async (page = 0, size = 10, sortBy = 'name', sortDir = 'ASC'): Promise<PageResponse<Product>> => {
        const response = await apiClient.get('/products', {
            params: { page, size, sortBy, sortDir },
        });
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    getBySku: async (sku: string): Promise<Product> => {
        const response = await apiClient.get(`/products/sku/${sku}`);
        return response.data;
    },

    getActive: async (page = 0, size = 10, sortBy = 'name'): Promise<PageResponse<Product>> => {
        const response = await apiClient.get('/products/active', {
            params: { page, size, sortBy },
        });
        return response.data;
    },

    getByCategory: async (category: string, page = 0, size = 10): Promise<PageResponse<Product>> => {
        const response = await apiClient.get(`/products/category/${category}`, {
            params: { page, size },
        });
        return response.data;
    },

    search: async (name: string, page = 0, size = 10): Promise<PageResponse<Product>> => {
        const response = await apiClient.get('/products/search', {
            params: { name, page, size },
        });
        return response.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await apiClient.get('/products/categories');
        return response.data;
    },

    create: async (data: ProductRequest): Promise<Product> => {
        const response = await apiClient.post('/products', data);
        return response.data;
    },

    update: async (id: number, data: ProductRequest): Promise<Product> => {
        const response = await apiClient.put(`/products/${id}`, data);
        return response.data;
    },

    deactivate: async (id: number): Promise<Product> => {
        const response = await apiClient.patch(`/products/${id}/deactivate`);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/products/${id}`);
    },
};