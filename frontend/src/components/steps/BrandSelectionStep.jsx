import React from 'react';
import { Check } from 'lucide-react';

export default function BrandSelectionStep({ brands = [], selectedBrand, onSelect }) {
    if (!brands || brands.length === 0) {
        return (
            <div>
                <h3 className="text-xl font-bold mb-4">Select Your Brand</h3>
                <p className="text-gray-600 mb-6">Choose the brand for this ad campaign</p>
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                    No brands available. Please create a brand first.
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Select Your Brand</h3>
            <p className="text-gray-600 mb-6">Choose the brand for this ad campaign</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brands.map(brand => (
                    <div
                        key={brand.id}
                        onClick={() => onSelect(brand)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedBrand?.id === brand.id
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: brand.colors.primary }}
                            >
                                {brand.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">{brand.name}</div>
                                <div className="text-xs text-gray-500">
                                    {brand.products.length} Products • {brand.profileIds?.length || 0} Profiles
                                </div>
                            </div>
                            {selectedBrand?.id === brand.id && (
                                <Check className="text-amber-600" size={24} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
