'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { productsApi, Product, ProductRequest } from '@/lib/api/products';
import { useRole } from '@/lib/hooks/useRole';
import Modal from '@/components/ui/Modal';
import ProductForm from '@/components/products/ProductForm';

export default function ProductsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { canEdit, isAdmin } = useRole();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Confirm deactivate state
    const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const fetchProducts = async (search?: string) => {
        try {
            setIsLoading(true);
            let data;
            if (search && search.trim()) {
                data = await productsApi.search(search.trim());
            } else {
                data = await productsApi.getAll();
            }
            setProducts(data.content);
        } catch (err: any) {
            setError('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchProducts();
    }, [user]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (user) fetchProducts(searchQuery);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleCreate = async (data: ProductRequest) => {
        await productsApi.create(data);
        setIsModalOpen(false);
        fetchProducts(searchQuery);
    };

    const handleUpdate = async (data: ProductRequest) => {
        if (!editingProduct) return;
        await productsApi.update(editingProduct.id, data);
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts(searchQuery);
    };

    const handleDeactivate = async (id: number) => {
        await productsApi.deactivate(id);
        setConfirmDeactivateId(null);
        fetchProducts(searchQuery);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Toolbar */}
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Products</h2>
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-72 px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {canEdit && (
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            + Add Product
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading products...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    {canEdit && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={canEdit ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                                            {searchQuery ? 'No products match your search' : 'No products yet'}
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{product.sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    product.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {canEdit && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditModal(product)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        {product.active && (
                                                            <button
                                                                onClick={() => setConfirmDeactivateId(product.id)}
                                                                className="text-red-600 hover:text-red-800 font-medium"
                                                            >
                                                                Deactivate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
            >
                <ProductForm
                    product={editingProduct}
                    onSubmit={editingProduct ? handleUpdate : handleCreate}
                    onCancel={() => { setIsModalOpen(false); setEditingProduct(null); }}
                />
            </Modal>

            {/* Deactivate Confirmation Modal */}
            <Modal
                isOpen={confirmDeactivateId !== null}
                title="Deactivate Product"
                onClose={() => setConfirmDeactivateId(null)}
            >
                <p className="text-gray-600 mb-6">Are you sure you want to deactivate this product? It will no longer appear in active product lists.</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setConfirmDeactivateId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => confirmDeactivateId && handleDeactivate(confirmDeactivateId)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Deactivate
                    </button>
                </div>
            </Modal>
        </div>
    );
}