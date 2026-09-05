import React, { useState } from 'react';
import { X, Plus, Trash2, Link as LinkIcon, Unlink } from 'lucide-react';
import { useBrands } from '../context/BrandContext';
import { useToast } from '../context/ToastContext';
import { validateBrandName, validateHexColor, validateProductName, validateProductDescription, validateBrandVoice, validateTextInput } from '../utils/validation';

const BrandForm = ({ onClose, onSave, initialData = null }) => {
    const { customerProfiles, brands } = useBrands();
    const { showError } = useToast();

    // Get all products from all brands
    const allProducts = brands.flatMap(brand =>
        brand.products.map(product => ({
            ...product,
            brandName: brand.name,
            brandId: brand.id
        }))
    );

    const [formData, setFormData] = useState(initialData || {
        name: '',
        logo: '',
        colors: { primary: '#3B82F6', secondary: '#10B981', highlight: '#F59E0B' },
        voice: '',
        products: [],
        profileIds: []
    });

    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState('');

    const handleLinkProduct = () => {
        if (selectedProductId && !formData.products.find(p => p.id === selectedProductId)) {
            const product = allProducts.find(p => p.id === selectedProductId);
            if (product) {
                setFormData({
                    ...formData,
                    products: [...formData.products, {
                        id: product.id,
                        name: product.name,
                        description: product.description
                    }]
                });
                setSelectedProductId('');
            }
        }
    };

    const removeProduct = (id) => {
        setFormData({
            ...formData,
            products: formData.products.filter(p => p.id !== id)
        });
    };

    const handleLinkProfile = () => {
        if (selectedProfileId && !formData.profileIds?.includes(selectedProfileId)) {
            setFormData({
                ...formData,
                profileIds: [...(formData.profileIds || []), selectedProfileId]
            });
            setSelectedProfileId('');
        }
    };

    const handleUnlinkProfile = (id) => {
        setFormData({
            ...formData,
            profileIds: (formData.profileIds || []).filter(pid => pid !== id)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            // Validate all fields
            const validatedData = {
                ...formData,
                name: validateBrandName(formData.name),
                voice: validateBrandVoice(formData.voice),
                colors: {
                    primary: validateHexColor(formData.colors.primary),
                    secondary: validateHexColor(formData.colors.secondary),
                    highlight: validateHexColor(formData.colors.highlight || '#F59E0B')
                },
                products: formData.products || [],
                profileIds: formData.profileIds || []
            };
            onSave(validatedData);
        } catch (err) {
            showError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Brand' : 'Add New Brand'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                            <input
                                required
                                type="text"
                                maxLength={100}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Voice/Tone</label>
                            <textarea
                                value={formData.voice}
                                maxLength={500}
                                onChange={e => setFormData({ ...formData, voice: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="2"
                                placeholder="e.g. Professional, Friendly, Witty..."
                            />
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
                        <div className="flex gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Primary</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.colors.primary}
                                        onChange={e => setFormData({ ...formData, colors: { ...formData.colors, primary: e.target.value } })}
                                        className="h-10 w-10 rounded cursor-pointer border-0"
                                    />
                                    <span className="text-sm text-gray-600 font-mono">{formData.colors.primary}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Secondary</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.colors.secondary}
                                        onChange={e => setFormData({ ...formData, colors: { ...formData.colors, secondary: e.target.value } })}
                                        className="h-10 w-10 rounded cursor-pointer border-0"
                                    />
                                    <span className="text-sm text-gray-600 font-mono">{formData.colors.secondary}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Highlight</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.colors.highlight}
                                        onChange={e => setFormData({ ...formData, colors: { ...formData.colors, highlight: e.target.value } })}
                                        className="h-10 w-10 rounded cursor-pointer border-0"
                                    />
                                    <span className="text-sm text-gray-600 font-mono">{formData.colors.highlight}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex gap-2">
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="">Select a product to assign...</option>
                                    {allProducts
                                        .filter(p => !formData.products.find(fp => fp.id === p.id))
                                        .map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} (currently in: {product.brandName})
                                            </option>
                                        ))
                                    }
                                </select>
                                <button
                                    type="button"
                                    onClick={handleLinkProduct}
                                    disabled={!selectedProductId}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <LinkIcon size={20} />
                                </button>
                            </div>

                            {formData.products.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {formData.products.map(product => (
                                        <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                            <div>
                                                <div className="font-medium text-sm">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.description}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(product.id)}
                                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                title="Remove Product"
                                            >
                                                <Unlink size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {allProducts.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    No products available. Create them in the Products page first.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Customer Profiles */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Linked Customer Profiles</label>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex gap-2">
                                <select
                                    value={selectedProfileId}
                                    onChange={(e) => setSelectedProfileId(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="">Select a profile to link...</option>
                                    {customerProfiles
                                        .filter(p => !(formData.profileIds || []).includes(p.id))
                                        .map(profile => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.name}
                                            </option>
                                        ))
                                    }
                                </select>
                                <button
                                    type="button"
                                    onClick={handleLinkProfile}
                                    disabled={!selectedProfileId}
                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <LinkIcon size={20} />
                                </button>
                            </div>

                            {(formData.profileIds || []).length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {(formData.profileIds || []).map(profileId => {
                                        const profile = customerProfiles.find(p => p.id === profileId);
                                        if (!profile) return null;
                                        return (
                                            <div key={profile.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                                <div>
                                                    <div className="font-medium text-sm">{profile.name}</div>
                                                    <div className="text-xs text-gray-500">{profile.demographics}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnlinkProfile(profile.id)}
                                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                    title="Unlink Profile"
                                                >
                                                    <Unlink size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {customerProfiles.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    No profiles available. Create them in the Customer Profiles page first.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Save Brand
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BrandForm;
