import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Briefcase, Package, Users, Image, Hash, FileText, Sparkles } from 'lucide-react';
import { useBrands } from '../context/BrandContext';
import ImageTemplateSelector from './ImageTemplateSelector';

export default function ImageAdWizard({ onComplete, onCancel }) {
    const { brands, customerProfiles } = useBrands();
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState({
        brand: null,
        product: null,
        profile: null,
        template: null,
        variationCount: 3,
        campaignDetails: {
            offer: '',
            urgency: '',
            messaging: ''
        }
    });

    const steps = [
        { id: 1, name: 'Brand', icon: Briefcase },
        { id: 2, name: 'Product', icon: Package },
        { id: 3, name: 'Profile', icon: Users },
        { id: 4, name: 'Template', icon: Image },
        { id: 5, name: 'Variations', icon: Hash },
        { id: 6, name: 'Campaign', icon: FileText },
        { id: 7, name: 'Review', icon: Check }
    ];

    const updateData = (field, value) => {
        setWizardData(prev => ({ ...prev, [field]: value }));
    };

    const updateCampaignDetails = (field, value) => {
        setWizardData(prev => ({
            ...prev,
            campaignDetails: { ...prev.campaignDetails, [field]: value }
        }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return wizardData.brand !== null;
            case 2: return wizardData.product !== null;
            case 3: return wizardData.profile !== null;
            case 4: return wizardData.template !== null;
            case 5: return wizardData.variationCount >= 1 && wizardData.variationCount <= 10;
            case 6: return wizardData.campaignDetails.offer && wizardData.campaignDetails.messaging;
            default: return true;
        }
    };

    const handleGenerate = () => {
        if (onComplete) {
            onComplete(wizardData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="text-purple-600" size={28} />
                        Create Template-Based Image Ads
                    </h2>
                    <p className="text-gray-500 mt-1">Generate AI-powered ads using winning templates</p>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center bg-gray-50 px-2">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isActive ? 'bg-purple-600 text-white' :
                                                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                                    </div>
                                    <span className={`text-xs font-medium ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {/* Step 1: Brand Selection */}
                    {currentStep === 1 && (
                        <BrandSelectionStep
                            brands={brands}
                            selectedBrand={wizardData.brand}
                            onSelect={(brand) => updateData('brand', brand)}
                        />
                    )}

                    {/* Step 2: Product Selection */}
                    {currentStep === 2 && (
                        <ProductSelectionStep
                            products={wizardData.brand?.products || []}
                            selectedProduct={wizardData.product}
                            onSelect={(product) => updateData('product', product)}
                        />
                    )}

                    {/* Step 3: Profile Selection */}
                    {currentStep === 3 && (
                        <ProfileSelectionStep
                            profiles={customerProfiles.filter(p => wizardData.brand?.profileIds?.includes(p.id))}
                            selectedProfile={wizardData.profile}
                            onSelect={(profile) => updateData('profile', profile)}
                        />
                    )}

                    {/* Step 4: Template Selection */}
                    {currentStep === 4 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4">Select a Template</h3>
                            <p className="text-gray-600 mb-6">Choose a winning ad template to base your new ads on</p>
                            <ImageTemplateSelector
                                onSelect={(template) => {
                                    updateData('template', template);
                                    nextStep();
                                }}
                                onClose={() => { }}
                                embedded={true}
                            />
                        </div>
                    )}

                    {/* Step 5: Variation Count */}
                    {currentStep === 5 && (
                        <VariationCountStep
                            count={wizardData.variationCount}
                            onChange={(count) => updateData('variationCount', count)}
                        />
                    )}

                    {/* Step 6: Campaign Details */}
                    {currentStep === 6 && (
                        <CampaignDetailsStep
                            details={wizardData.campaignDetails}
                            onChange={updateCampaignDetails}
                        />
                    )}

                    {/* Step 7: Review */}
                    {currentStep === 7 && (
                        <ReviewStep wizardData={wizardData} />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        {currentStep > 1 && currentStep !== 4 && (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                <ChevronLeft size={20} />
                                Back
                            </button>
                        )}
                        {currentStep < steps.length && currentStep !== 4 && (
                            <button
                                onClick={nextStep}
                                disabled={!canProceed()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${canProceed()
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        )}
                        {currentStep === steps.length && (
                            <button
                                onClick={handleGenerate}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
                            >
                                <Sparkles size={20} />
                                Generate Ads
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step Components

function BrandSelectionStep({ brands, selectedBrand, onSelect }) {
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
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
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
                                <Check className="text-purple-600" size={24} />
                            )}
                        </div>
                        {brand.voice && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <span className="font-medium">Voice:</span> {brand.voice}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProductSelectionStep({ products, selectedProduct, onSelect }) {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Select Your Product</h3>
            <p className="text-gray-600 mb-6">Choose the product to feature in the ads</p>
            {products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No products found for this brand. Please add products first.
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map(product => (
                        <div
                            key={product.id}
                            onClick={() => onSelect(product)}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedProduct?.id === product.id
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-gray-900">{product.name}</div>
                                    {product.description && (
                                        <div className="text-sm text-gray-600 mt-1">{product.description}</div>
                                    )}
                                </div>
                                {selectedProduct?.id === product.id && (
                                    <Check className="text-purple-600" size={24} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProfileSelectionStep({ profiles, selectedProfile, onSelect }) {
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
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-gray-900">{profile.name}</div>
                                {selectedProfile?.id === profile.id && (
                                    <Check className="text-purple-600" size={24} />
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

function VariationCountStep({ count, onChange }) {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">How Many Variations?</h3>
            <p className="text-gray-600 mb-6">Choose how many ad variations to generate (1-10)</p>

            <div className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={count}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                        {count}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> More variations give you more options to choose from, but will take longer to generate.
                    </p>
                </div>
            </div>
        </div>
    );
}

function CampaignDetailsStep({ details, onChange }) {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Campaign Details</h3>
            <p className="text-gray-600 mb-6">Provide details to customize your ad copy</p>

            <div className="max-w-2xl space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Offer / Promotion *
                    </label>
                    <input
                        type="text"
                        value={details.offer}
                        onChange={(e) => onChange('offer', e.target.value)}
                        placeholder="e.g., 50% off Black Friday, Buy 2 Get 1 Free"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency / Timing
                    </label>
                    <input
                        type="text"
                        value={details.urgency}
                        onChange={(e) => onChange('urgency', e.target.value)}
                        placeholder="e.g., Limited time, Ends tonight, While supplies last"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Messaging *
                    </label>
                    <textarea
                        value={details.messaging}
                        onChange={(e) => onChange('messaging', e.target.value)}
                        placeholder="e.g., Science-backed results, Trusted by 10,000+ customers, Clinically proven"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );
}

function ReviewStep({ wizardData }) {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Review Your Selections</h3>
            <p className="text-gray-600 mb-6">Verify everything looks correct before generating</p>

            <div className="space-y-4">
                <ReviewItem
                    label="Brand"
                    value={wizardData.brand?.name}
                    icon={Briefcase}
                />
                <ReviewItem
                    label="Product"
                    value={wizardData.product?.name}
                    icon={Package}
                />
                <ReviewItem
                    label="Target Audience"
                    value={wizardData.profile?.name}
                    icon={Users}
                />
                <ReviewItem
                    label="Template"
                    value={wizardData.template?.name || wizardData.template?.template_category}
                    icon={Image}
                />
                <ReviewItem
                    label="Variations"
                    value={`${wizardData.variationCount} ads`}
                    icon={Hash}
                />
                <ReviewItem
                    label="Offer"
                    value={wizardData.campaignDetails.offer}
                    icon={FileText}
                />
                {wizardData.campaignDetails.urgency && (
                    <ReviewItem
                        label="Urgency"
                        value={wizardData.campaignDetails.urgency}
                        icon={FileText}
                    />
                )}
                <ReviewItem
                    label="Messaging"
                    value={wizardData.campaignDetails.messaging}
                    icon={FileText}
                />
            </div>

            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                    <strong>Ready to generate!</strong> Click "Generate Ads" to create {wizardData.variationCount} AI-powered ad{wizardData.variationCount > 1 ? 's' : ''} based on your selections.
                </p>
            </div>
        </div>
    );
}

function ReviewItem({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Icon className="text-purple-600 mt-0.5" size={20} />
            <div>
                <div className="text-sm font-medium text-gray-500">{label}</div>
                <div className="text-gray-900">{value}</div>
            </div>
        </div>
    );
}
