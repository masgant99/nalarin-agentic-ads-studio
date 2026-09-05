import React from 'react';
import { Check } from 'lucide-react';

export default function ProfileSelectionStep({ profiles, selectedProfile, onSelect }) {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Select Target Audience</h3>
            <p className="text-gray-600 mb-6">Choose the customer profile to target</p>
            {profiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No customer profiles found for this brand. Please add profiles first.
                </div>
            ) : (
                <div className="space-y-3">
                    {profiles.map(profile => (
                        <div
                            key={profile.id}
                            onClick={() => onSelect(profile)}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedProfile?.id === profile.id
                                ? 'border-amber-600 bg-amber-50'
                                : 'border-gray-200 hover:border-amber-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-gray-900">{profile.name}</div>
                                {selectedProfile?.id === profile.id && (
                                    <Check className="text-amber-600" size={24} />
                                )}
                            </div>
                            {profile.demographics && (
                                <div className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Demographics:</span> {profile.demographics}
                                </div>
                            )}
                            {profile.pain_points && (
                                <div className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Pain Points:</span> {profile.pain_points}
                                </div>
                            )}
                            {profile.goals && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Goals:</span> {profile.goals}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
