'use client';
import { useState } from 'react';
import { TransactionRequest } from '@/lib/api/inventory';
import { Product } from '@/lib/api/products';
import { Location } from '@/lib/api/locations';

interface TransactionFormProps {
    products: Product[];
    locations: Location[];
    onSubmit: (data: TransactionRequest) => Promise<void>;
    onCancel: () => void;
}

export default function TransactionForm({ products, locations, onSubmit, onCancel }: TransactionFormProps) {
    const [formData, setFormData] = useState<TransactionRequest>({
        productId: 0,
        type: 'ADDITION',
        quantity: 1,
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'productId' || name === 'fromLocationId' || name === 'toLocationId'
                ? parseInt(value) || 0
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.productId) { setError('Please select a product'); return; }
        if (formData.type === 'ADDITION' && !formData.toLocationId) { setError('Please select a destination location'); return; }
        if (formData.type === 'REMOVAL' && !formData.fromLocationId) { setError('Please select a source location'); return; }
        if (formData.type === 'ADJUSTMENT' && !formData.toLocationId) { setError('Please select a location'); return; }
        if (formData.type === 'TRANSFER' && (!formData.fromLocationId || !formData.toLocationId)) { setError('Please select both source and destination locations'); return; }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showFrom = formData.type === 'REMOVAL' || formData.type === 'TRANSFER';
    const showTo = formData.type === 'ADDITION' || formData.type === 'TRANSFER' || formData.type === 'ADJUSTMENT';

    const typeColors: Record<string, string> = {
        ADDITION: 'text-green-700 bg-green-50 border-green-200',
        REMOVAL: 'text-red-700 bg-red-50 border-red-200',
        TRANSFER: 'text-blue-700 bg-blue-50 border-blue-200',
        ADJUSTMENT: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
                <div className="grid grid-cols-4 gap-2">
                    {(['ADDITION', 'REMOVAL', 'TRANSFER', 'ADJUSTMENT'] as const).map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type, fromLocationId: undefined, toLocationId: undefined }))}
                            className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${
                                formData.type === type
                                    ? typeColors[type]
                                    : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>Select a product...</option>
                    {products.filter(p => p.active).map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                </select>
            </div>

            {showFrom && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
                    <select
                        name="fromLocationId"
                        value={formData.fromLocationId || 0}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={0}>Select source location...</option>
                        {locations.filter(l => l.active).map(l => (
                            <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                        ))}
                    </select>
                </div>
            )}

            {showTo && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.type === 'TRANSFER' ? 'To Location *' : 'Location *'}
                    </label>
                    <select
                        name="toLocationId"
                        value={formData.toLocationId || 0}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={0}>Select destination location...</option>
                        {locations.filter(l => l.active).map(l => (
                            <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.type === 'ADJUSTMENT' ? 'New Quantity *' : 'Quantity *'}
                </label>
                <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional notes..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Processing...' : 'Log Transaction'}
                </button>
            </div>
        </form>
    );
}