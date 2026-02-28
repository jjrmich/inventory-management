'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { inventoryApi, InventoryRecord, TransactionRecord, TransactionRequest } from '@/lib/api/inventory';
import { productsApi, Product } from '@/lib/api/products';
import { locationsApi, Location } from '@/lib/api/locations';
import { useRole } from '@/lib/hooks/useRole';
import Modal from '@/components/ui/Modal';
import TransactionForm from '@/components/inventory/TransactionForm';

type Tab = 'stock' | 'transactions' | 'lowstock';

const typeStyles: Record<string, string> = {
    ADDITION: 'bg-green-100 text-green-800',
    REMOVAL: 'bg-red-100 text-red-800',
    TRANSFER: 'bg-blue-100 text-blue-800',
    ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
};

export default function InventoryPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const { canEdit } = useRole();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<Tab>('stock');
    const [inventory, setInventory] = useState<InventoryRecord[]>([]);
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [lowStock, setLowStock] = useState<InventoryRecord[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const fetchAll = async () => {
        try {
            setIsLoading(true);
            const [txns, low, prods, locs] = await Promise.all([
                inventoryApi.getAllTransactions(),
                inventoryApi.getLowStock(),
                productsApi.getAll(),
                locationsApi.getAll(),
            ]);
            setTransactions(txns);
            setLowStock(low);
            setProducts(prods.content);
            setLocations(locs);
        } catch (err: any) {
            setError('Failed to load inventory data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInventoryByLocation = async () => {
        if (locations.length === 0) return;
        try {
            const results = await Promise.all(
                locations.filter(l => l.active).map(l => inventoryApi.getByLocation(l.id))
            );
            setInventory(results.flat());
        } catch (err) {
            setError('Failed to load stock levels');
        }
    };

    useEffect(() => {
        if (user) fetchAll();
    }, [user]);

    useEffect(() => {
        if (locations.length > 0) fetchInventoryByLocation();
    }, [locations]);

    const handleTransaction = async (data: TransactionRequest) => {
        await inventoryApi.processTransaction(data);
        setIsModalOpen(false);
        await fetchAll();
        await fetchInventoryByLocation();
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">Loading...</div></div>;
    }
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                    <div className="flex items-center gap-4">
                        {lowStock.length > 0 && (
                            <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                                ⚠ {lowStock.length} low stock
                            </span>
                        )}
                        <span className="text-sm text-gray-600">
                            {user.firstName} {user.lastName} &mdash; <span className="font-medium">{user.role}</span>
                        </span>
                        <button onClick={logout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
                )}

                {/* Tabs + Action */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex border-b border-gray-200">
                        {([
                            { key: 'stock', label: 'Stock Levels' },
                            { key: 'transactions', label: `Transactions (${transactions.length})` },
                            { key: 'lowstock', label: `Low Stock ${lowStock.length > 0 ? `(${lowStock.length})` : ''}` },
                        ] as { key: Tab; label: string }[]).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {canEdit && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            + Log Transaction
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <>
                        {/* Stock Levels Tab */}
                        {activeTab === 'stock' && (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min / Max</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {inventory.length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No stock records yet. Log a transaction to get started.</td></tr>
                                        ) : (
                                            inventory.map(inv => (
                                                <tr key={inv.id} className={`hover:bg-gray-50 ${inv.lowStock ? 'bg-red-50' : ''}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.productName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{inv.productSku}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.locationName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{inv.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {inv.minQuantity} / {inv.maxQuantity ?? '—'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {inv.lowStock ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Low Stock</span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">OK</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Transactions Tab */}
                        {activeTab === 'transactions' && (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.length === 0 ? (
                                            <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No transactions yet</td></tr>
                                        ) : (
                                            [...transactions].reverse().map(t => (
                                                <tr key={t.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formatDate(t.createdAt)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeStyles[t.type]}`}>
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.productName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.fromLocationName || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.toLocationName || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{t.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.performedBy}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{t.notes || '—'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Low Stock Tab */}
                        {activeTab === 'lowstock' && (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                {lowStock.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="text-4xl mb-2">✅</div>
                                        <div className="text-gray-500">All stock levels are healthy</div>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-red-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {lowStock.map(inv => (
                                                <tr key={inv.id} className="hover:bg-red-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.productName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{inv.productSku}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.locationName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{inv.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.minQuantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                                                        -{inv.minQuantity - inv.quantity}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Modal
                isOpen={isModalOpen}
                title="Log Transaction"
                onClose={() => setIsModalOpen(false)}
            >
                <TransactionForm
                    products={products}
                    locations={locations}
                    onSubmit={handleTransaction}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}