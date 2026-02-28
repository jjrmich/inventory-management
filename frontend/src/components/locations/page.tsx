'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { locationsApi, Location, LocationRequest } from '@/lib/api/locations';
import { useRole } from '@/lib/hooks/useRole';
import Modal from '@/components/ui/Modal';
import LocationForm from '@/components/locations/LocationForm';

export default function LocationsPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const { canEdit, isAdmin } = useRole();
    const router = useRouter();

    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const fetchLocations = async () => {
        try {
            setIsLoading(true);
            const data = await locationsApi.getAll();
            setLocations(data);
        } catch (err: any) {
            setError('Failed to load locations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchLocations();
    }, [user]);

    const handleCreate = async (data: LocationRequest) => {
        await locationsApi.create(data);
        setIsModalOpen(false);
        fetchLocations();
    };

    const handleUpdate = async (data: LocationRequest) => {
        if (!editingLocation) return;
        await locationsApi.update(editingLocation.id, data);
        setIsModalOpen(false);
        setEditingLocation(null);
        fetchLocations();
    };

    const handleDeactivate = async (id: number) => {
        await locationsApi.deactivate(id);
        setConfirmDeactivateId(null);
        fetchLocations();
    };

    const openCreateModal = () => {
        setEditingLocation(null);
        setIsModalOpen(true);
    };

    const openEditModal = (location: Location) => {
        setEditingLocation(location);
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
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {user.firstName} {user.lastName} &mdash; <span className="font-medium">{user.role}</span>
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm text-gray-500">{locations.length} location{locations.length !== 1 ? 's' : ''}</h2>
                    {canEdit && (
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            + Add Location
                        </button>
                    )}
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading locations...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    {canEdit && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {locations.length === 0 ? (
                                    <tr>
                                        <td colSpan={canEdit ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                                            No locations yet
                                        </td>
                                    </tr>
                                ) : (
                                    locations.map((location) => (
                                        <tr key={location.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{location.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{location.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.city || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.state || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.phone || '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    location.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {location.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {canEdit && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditModal(location)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        {location.active && (
                                                            <button
                                                                onClick={() => setConfirmDeactivateId(location.id)}
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

            <Modal
                isOpen={isModalOpen}
                title={editingLocation ? 'Edit Location' : 'Add Location'}
                onClose={() => { setIsModalOpen(false); setEditingLocation(null); }}
            >
                <LocationForm
                    location={editingLocation}
                    onSubmit={editingLocation ? handleUpdate : handleCreate}
                    onCancel={() => { setIsModalOpen(false); setEditingLocation(null); }}
                />
            </Modal>

            <Modal
                isOpen={confirmDeactivateId !== null}
                title="Deactivate Location"
                onClose={() => setConfirmDeactivateId(null)}
            >
                <p className="text-gray-600 mb-6">Are you sure you want to deactivate this location?</p>
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