import apiClient from './client';

export interface InventoryRecord {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    locationId: number;
    locationName: string;
    locationCode: string;
    quantity: number;
    minQuantity: number;
    maxQuantity: number | null;
    lowStock: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionRecord {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    fromLocationId: number | null;
    fromLocationName: string | null;
    toLocationId: number | null;
    toLocationName: string | null;
    type: 'ADDITION' | 'REMOVAL' | 'TRANSFER' | 'ADJUSTMENT';
    quantity: number;
    notes: string | null;
    performedBy: string;
    createdAt: string;
}

export interface InventoryRequest {
    productId: number;
    locationId: number;
    quantity: number;
    minQuantity?: number;
    maxQuantity?: number;
}

export interface TransactionRequest {
    productId: number;
    fromLocationId?: number;
    toLocationId?: number;
    type: 'ADDITION' | 'REMOVAL' | 'TRANSFER' | 'ADJUSTMENT';
    quantity: number;
    notes?: string;
}

export const inventoryApi = {
    setInventory: (data: InventoryRequest) =>
        apiClient.post<InventoryRecord>('/inventory', data).then(r => r.data),
    processTransaction: (data: TransactionRequest) =>
        apiClient.post<TransactionRecord>('/inventory/transactions', data).then(r => r.data),
    getByProduct: (productId: number) =>
        apiClient.get<InventoryRecord[]>(`/inventory/product/${productId}`).then(r => r.data),
    getByLocation: (locationId: number) =>
        apiClient.get<InventoryRecord[]>(`/inventory/location/${locationId}`).then(r => r.data),
    getLowStock: () =>
        apiClient.get<InventoryRecord[]>('/inventory/low-stock').then(r => r.data),
    getAllTransactions: () =>
        apiClient.get<TransactionRecord[]>('/inventory/transactions').then(r => r.data),
    getTransactionsByProduct: (productId: number, page = 0, size = 20) =>
        apiClient.get(`/inventory/transactions/product/${productId}?page=${page}&size=${size}`).then(r => r.data),
};