import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Check, Loader, X } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { useToast } from '../context/ToastContext';
import { getAdSets, getPixels, searchGeoLocations } from '../lib/facebookApi';

const OPTIMIZATION_GOALS = [
    { value: 'OFFSITE_CONVERSIONS', label: 'Sales/Purchases', description: 'Optimize for conversions on your website' },
    { value: 'LINK_CLICKS', label: 'Traffic/Clicks', description: 'Get more clicks to your website' },
    { value: 'LANDING_PAGE_VIEWS', label: 'Landing Page Views', description: 'Get more landing page views' },
    { value: 'IMPRESSIONS', label: 'Brand Awareness', description: 'Maximize impressions' },
    { value: 'REACH', label: 'Unique Reach', description: 'Reach unique people' },
    { value: 'POST_ENGAGEMENT', label: 'Engagement', description: 'Get more post engagement' },
    { value: 'THRUPLAY', label: 'Video Completion', description: 'Optimize for video views' },
    { value: 'VIDEO_VIEWS', label: '3s Video Views', description: 'Get 3-second video views' },
    { value: 'LEAD_GENERATION', label: 'Lead Ads', description: 'Collect leads with lead forms' }
];

const CONVERSION_EVENTS = [
    'PURCHASE', 'LEAD', 'COMPLETE_REGISTRATION', 'ADD_TO_CART',
    'INITIATE_CHECKOUT', 'ADD_PAYMENT_INFO', 'CONTACT', 'SUBSCRIBE'
];

const BID_STRATEGIES = [
    { value: 'LOWEST_COST_WITHOUT_CAP', label: 'Lowest Cost (No Cap)' },
    { value: 'LOWEST_COST_WITH_BID_CAP', label: 'Lowest Cost with Bid Cap' },
    { value: 'COST_CAP', label: 'Cost Cap' }
];

const ATTRIBUTION_SETTINGS = [
    { value: '1d_click', label: '1-day click' },
    { value: '7d_click', label: '7-day click' },
    { value: '1d_click_1d_view', label: '1-day click or 1-day view' },
    { value: '7d_click_1d_view', label: '7-day click or 1-day view' },
    { value: '28d_click', label: '28-day click' },
    { value: '28d_click_1d_view', label: '28-day click or 1-day view' }
];

// List of countries with their codes
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'MX', name: 'Mexico' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' }
];

const AdSetStep = ({ onNext, onBack }) => {
    const { campaignData, adsetData, setAdsetData, selectedAdAccount } = useCampaign();
    const { showError, showWarning } = useToast();
    const [mode, setMode] = useState('new');
    const [existingAdsets, setExistingAdsets] = useState([]);
    const [selectedAdset, setSelectedAdset] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAdSets, setLoadingAdSets] = useState(false);
    const [pixels, setPixels] = useState([]);
    const [loadingPixels, setLoadingPixels] = useState(false);
    const [isTargetingOpen, setIsTargetingOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [isSearchingLocations, setIsSearchingLocations] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [locationMode, setLocationMode] = useState('include');

    // Debounced location search
    useEffect(() => {
        const searchLocations = async () => {
            if (countrySearch.length >= 2 && selectedAdAccount) {
                setIsSearchingLocations(true);
                try {
                    const results = await searchGeoLocations(countrySearch, selectedAdAccount.id);
                    setLocationResults(results);
                } catch (error) {
                    console.error('Error searching locations:', error);
                    showError('Failed to search locations. Please try again.');
                    setLocationResults([]);
                } finally {
                    setIsSearchingLocations(false);
                }
            } else {
                setLocationResults([]);
            }
        };

        const timeoutId = setTimeout(searchLocations, 500);
        return () => clearTimeout(timeoutId);
    }, [countrySearch]);

    useEffect(() => {
        if (mode === 'existing' && campaignData.id) {
            fetchExistingAdsets();
        }
    }, [mode, campaignData.id]);

    useEffect(() => {
        if (selectedAdAccount) {
            fetchPixels();
        }
    }, [selectedAdAccount]);

    // Close country dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCountryDropdown && !event.target.closest('.country-picker-container')) {
                setShowCountryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCountryDropdown]);

    const fetchPixels = async () => {
        setLoadingPixels(true);
        try {
            const fetchedPixels = await getPixels(selectedAdAccount.id);
            setPixels(fetchedPixels);
        } catch (error) {
            console.error('Error fetching pixels:', error);
            showWarning('Unable to load pixels. Please check your ad account permissions.');
        } finally {
            setLoadingPixels(false);
        }
    };

    const fetchExistingAdsets = async () => {
        setLoadingAdSets(true);
        try {
            // Use FB Campaign ID if available (for existing campaigns), otherwise fallback to local ID
            // But fetching from FB only makes sense if we have an FB ID
            const campaignIdToUse = campaignData.fbCampaignId || campaignData.id;

            if (!campaignIdToUse || campaignIdToUse.startsWith('camp_')) {
                // If it's a local-only ID (starts with camp_), we can't fetch from FB
                // unless we strip the prefix, but better to rely on fbCampaignId
                console.warn('Cannot fetch ad sets from Facebook: Invalid Campaign ID', campaignIdToUse);
                setExistingAdsets([]);
                return;
            }

            const adSets = await getAdSets(campaignIdToUse);
            setExistingAdsets(adSets);
        } catch (error) {
            console.error('Error fetching ad sets:', error);
            showError(`Error fetching ad sets: ${error.message}`);
        } finally {
            setLoadingAdSets(false);
        }
    };

    const handleSelectExisting = (adset) => {
        setSelectedAdset(adset);

        // Extract pixel and event from promoted_object if available
        let pixelId = '';
        let conversionEvent = '';
        if (adset.promoted_object) {
            pixelId = adset.promoted_object.pixel_id || '';
            conversionEvent = adset.promoted_object.custom_event_type || '';
        }

        setAdsetData({
            ...adset,
            // Map snake_case from API to camelCase for state
            optimizationGoal: adset.optimization_goal,
            dailyBudget: (adset.daily_budget || 0) / 100,
            bidStrategy: adset.bid_strategy || '',
            bidAmount: (adset.bid_amount || 0) / 100,
            pixelId: pixelId,
            conversionEvent: conversionEvent,
            fbAdsetId: adset.id,
            isExisting: true,
            // Ensure targeting is preserved (it's usually 'targeting' in both)
            targeting: adset.targeting || {}
        });
    };

    const handleInputChange = (field, value) => {
        setAdsetData(prev => ({
            ...prev,
            [field]: value,
            isExisting: false
        }));
    };

    const handleTargetingChange = (field, value) => {
        setAdsetData(prev => ({
            ...prev,
            targeting: {
                ...prev.targeting,
                [field]: value
            }
        }));
    };

    const handleNext = async () => {
        if (mode === 'existing' && !selectedAdset) {
            showWarning('Please select an ad set');
            return;
        }

        if (mode === 'new') {
            if (!adsetData.name || !adsetData.optimizationGoal) {
                showWarning('Please fill in all required fields');
                return;
            }

            // Validate targeting
            const hasCountries = adsetData.targeting.geo_locations?.countries?.length > 0 ||
                adsetData.targeting.countries?.length > 0;

            if (!hasCountries) {
                showWarning('Please specify at least one target country');
                return;
            }

            // Validate conversion tracking for OFFSITE_CONVERSIONS
            if (adsetData.optimizationGoal === 'OFFSITE_CONVERSIONS') {
                if (!adsetData.pixelId || !adsetData.conversionEvent) {
                    showWarning('Pixel ID and Conversion Event are required for conversion optimization');
                    return;
                }
            }

            // Validate ABO Budget
            if (campaignData.budgetType === 'ABO' && (!adsetData.dailyBudget || adsetData.dailyBudget <= 0)) {
                showWarning('Please enter a valid Daily Budget');
                return;
            }

            // Validate Bid Amount if strategy requires it
            if ((adsetData.bidStrategy === 'LOWEST_COST_WITH_BID_CAP' || adsetData.bidStrategy === 'COST_CAP') &&
                (!adsetData.bidAmount || adsetData.bidAmount <= 0)) {
                showWarning('Please enter a valid Bid Amount for the selected strategy');
                return;
            }

            // Generate ID if not existing
            if (!adsetData.id && !adsetData.isExisting) {
                const id = `adset_${Date.now()}`;
                setAdsetData(prev => ({ ...prev, id }));
            }
        }

        onNext();
    };

    const parseCountries = (value) => {
        return value.split(',').map(c => c.trim().toUpperCase()).filter(c => c.length > 0);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Ad Set Setup</h2>

            {/* Mode Toggle */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => {
                        setMode('new');
                        setAdsetData(prev => ({
                            ...prev,
                            isExisting: false,
                            fbAdsetId: null
                        }));
                    }}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${mode === 'new'
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                        }`}
                >
                    <Plus className="mx-auto mb-2" size={24} />
                    <div className="font-semibold">Create New Ad Set</div>
                </button>
                <button
                    onClick={() => setMode('existing')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${mode === 'existing'
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                        }`}
                >
                    <Check className="mx-auto mb-2" size={24} />
                    <div className="font-semibold">Use Existing Ad Set</div>
                </button>
            </div>

            {/* Existing Ad Sets List */}
            {mode === 'existing' && (
                <div className="space-y-2 mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Select an Ad Set</h3>
                    {loadingAdSets ? (
                        <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
                            <Loader className="animate-spin" size={20} />
                            <span>Loading ad sets from Facebook...</span>
                        </div>
                    ) : existingAdsets.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No ad sets found for this campaign.</p>
                    ) : (
                        existingAdsets.map(adset => (
                            <div
                                key={adset.id}
                                onClick={() => handleSelectExisting(adset)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAdset?.id === adset.id
                                    ? 'border-amber-600 bg-amber-50'
                                    : 'border-gray-200 hover:border-amber-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-gray-900">{adset.name}</div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${adset.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                adset.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {adset.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {adset.optimizationGoal}
                                            {adset.dailyBudget && ` • Daily: $${(parseInt(adset.dailyBudget) / 100).toFixed(2)}`}
                                            {adset.lifetimeBudget && ` • Lifetime: $${(parseInt(adset.lifetimeBudget) / 100).toFixed(2)}`}
                                        </div>
                                    </div>
                                    {selectedAdset?.id === adset.id && (
                                        <Check className="text-amber-600" size={20} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* New Ad Set Form */}
            {mode === 'new' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ad Set Name *
                        </label>
                        <input
                            type="text"
                            value={adsetData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="US - Adults 25-55"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>

                    {/* Conversion Tracking (only for OFFSITE_CONVERSIONS) */}
                    {adsetData.optimizationGoal === 'OFFSITE_CONVERSIONS' && (
                        <>
                            {/* Pixel ID moved to after ABO Budget */}
                        </>
                    )}

                    {/* Schedule & Optimization Accordion */}
                    {/* ABO Budget Fields */}
                    {campaignData.budgetType === 'ABO' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Daily Budget (USD) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={adsetData.dailyBudget || ''}
                                        onChange={(e) => handleInputChange('dailyBudget', parseInt(e.target.value) || 0)}
                                        placeholder="50"
                                        min="1"
                                        step="1"
                                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bid Strategy
                                </label>
                                <select
                                    value={adsetData.bidStrategy}
                                    onChange={(e) => handleInputChange('bidStrategy', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="">Select bid strategy...</option>
                                    {BID_STRATEGIES.map(strategy => (
                                        <option key={strategy.value} value={strategy.value}>{strategy.label}</option>
                                    ))}
                                </select>
                            </div>

                            {(adsetData.bidStrategy === 'LOWEST_COST_WITH_BID_CAP' || adsetData.bidStrategy === 'COST_CAP') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bid Amount (USD) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={adsetData.bidAmount || ''}
                                            onChange={(e) => handleInputChange('bidAmount', parseInt(e.target.value) || 0)}
                                            placeholder="5"
                                            min="1"
                                            step="1"
                                            className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Pixel ID (Last item in main section) */}
                    {adsetData.optimizationGoal === 'OFFSITE_CONVERSIONS' && (
                        <div className="pb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Facebook Pixel ID *
                            </label>
                            {loadingPixels ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500 p-2 border rounded-lg bg-gray-50">
                                    <Loader className="animate-spin" size={16} />
                                    <span>Loading pixels...</span>
                                </div>
                            ) : (
                                <select
                                    value={adsetData.pixelId}
                                    onChange={(e) => handleInputChange('pixelId', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="">Select a pixel...</option>
                                    {pixels.map(pixel => (
                                        <option key={pixel.id} value={pixel.id}>
                                            {pixel.name} ({pixel.id})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Schedule & Optimization Accordion */}
                    <div className="border-t pt-4">
                        <button
                            onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                            className="flex items-center justify-between w-full py-2 text-left focus:outline-none"
                        >
                            <h3 className="font-semibold text-gray-900">Schedule & Optimization</h3>
                            <ChevronRight
                                size={20}
                                className={`text-gray-500 transition-transform ${isScheduleOpen ? 'rotate-90' : ''}`}
                            />
                        </button>

                        {isScheduleOpen && (
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={adsetData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Defaults to tomorrow at 1:00 AM.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Optimization Goal *
                                    </label>
                                    <select
                                        value={adsetData.optimizationGoal}
                                        onChange={(e) => handleInputChange('optimizationGoal', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">Select optimization goal...</option>
                                        {OPTIMIZATION_GOALS.map(goal => (
                                            <option key={goal.value} value={goal.value}>
                                                {goal.label} - {goal.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Conversion Event (Moved here) */}
                                {adsetData.optimizationGoal === 'OFFSITE_CONVERSIONS' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Conversion Event *
                                            </label>
                                            <select
                                                value={adsetData.conversionEvent}
                                                onChange={(e) => handleInputChange('conversionEvent', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            >
                                                <option value="">Select event...</option>
                                                {CONVERSION_EVENTS.map(event => (
                                                    <option key={event} value={event}>{event}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Attribution Setting */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Attribution Setting
                                            </label>
                                            <select
                                                value={adsetData.attributionSetting}
                                                onChange={(e) => handleInputChange('attributionSetting', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            >
                                                {ATTRIBUTION_SETTINGS.map(setting => (
                                                    <option key={setting.value} value={setting.value}>
                                                        {setting.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Attribution window for conversion tracking (default: 7-day click)
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Targeting Accordion */}
                    <div className="border-t pt-4">
                        <button
                            onClick={() => setIsTargetingOpen(!isTargetingOpen)}
                            className="flex items-center justify-between w-full py-2 text-left focus:outline-none"
                        >
                            <h3 className="font-semibold text-gray-900">Targeting</h3>
                            <ChevronRight
                                size={20}
                                className={`text-gray-500 transition-transform ${isTargetingOpen ? 'rotate-90' : ''}`}
                            />
                        </button>

                        {isTargetingOpen && (
                            <div className="space-y-6 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Locations *
                                    </label>

                                    {/* Advantage+ Audience Toggle */}
                                    <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="advantage-audience"
                                                    type="checkbox"
                                                    checked={adsetData.advantageAudience === 1}
                                                    onChange={(e) => handleInputChange('advantageAudience', e.target.checked ? 1 : 0)}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="text-sm">
                                                <label htmlFor="advantage-audience" className="font-medium text-gray-700">
                                                    Advantage+ Audience
                                                </label>
                                                <p className="text-gray-500">
                                                    Let Facebook automatically find your audience. If unchecked, we'll use your specific targeting options below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Location Mode Toggle & Search */}
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <select
                                                    value={locationMode}
                                                    onChange={(e) => setLocationMode(e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm font-medium ${locationMode === 'include'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                >
                                                    <option value="include">Include</option>
                                                    <option value="exclude">Exclude</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </div>

                                            <div className="relative flex-1 country-picker-container">
                                                <input
                                                    type="text"
                                                    value={countrySearch}
                                                    onChange={(e) => {
                                                        setCountrySearch(e.target.value);
                                                        setShowCountryDropdown(true);
                                                    }}
                                                    onFocus={() => setShowCountryDropdown(true)}
                                                    placeholder={`Search locations to ${locationMode}...`}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                />

                                                {/* Dropdown */}
                                                {showCountryDropdown && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                        {isSearchingLocations ? (
                                                            <div className="px-4 py-2 text-gray-500 text-sm flex items-center gap-2">
                                                                <Loader className="animate-spin" size={14} />
                                                                Searching...
                                                            </div>
                                                        ) : locationResults.length > 0 ? (
                                                            locationResults.map(location => (
                                                                <button
                                                                    key={location.key}
                                                                    onClick={() => {
                                                                        const typeMap = {
                                                                            'country': 'countries',
                                                                            'region': 'regions',
                                                                            'city': 'cities',
                                                                            'geo_market': 'geo_markets'
                                                                        };

                                                                        const baseType = typeMap[location.type];
                                                                        if (!baseType) return;

                                                                        const listType = locationMode === 'include' ? baseType : `excluded_${baseType}`;
                                                                        const currentList = adsetData.targeting.geo_locations?.[listType] || [];

                                                                        // Store full location object for display, or just key/id for API
                                                                        // For simplicity, we'll store the key/id and fetch details or store a minimal object
                                                                        // Facebook API expects keys/ids in the payload
                                                                        // We'll store the object { key, name, type, country_code } in a separate map or just use the key and look it up?
                                                                        // Better to store the object in the array to avoid lookups, but API needs just keys.
                                                                        // Let's store the object in the array, and strip it before sending to API.
                                                                        // Wait, existing code uses simple arrays of strings for countries.
                                                                        // Let's stick to storing objects for non-countries to keep names? 
                                                                        // Or just store the object: { key: '...', name: '...', type: '...' }

                                                                        const locationObj = {
                                                                            key: location.key,
                                                                            name: location.name,
                                                                            type: location.type,
                                                                            country_code: location.country_code,
                                                                            region: location.region,
                                                                            region_id: location.region_id
                                                                        };

                                                                        // Check if already selected
                                                                        const exists = currentList.some(l => l.key === location.key);
                                                                        if (!exists) {
                                                                            handleTargetingChange('geo_locations', {
                                                                                ...adsetData.targeting.geo_locations,
                                                                                [listType]: [...currentList, locationObj]
                                                                            });
                                                                        }

                                                                        setCountrySearch('');
                                                                        setShowCountryDropdown(false);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between group border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">{location.name}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {location.type === 'country' ? 'Country' :
                                                                                location.type === 'region' ? `${location.country_name} (State/Region)` :
                                                                                    location.type === 'city' ? `${location.region || ''}, ${location.country_name} (City)` :
                                                                                        location.type === 'geo_market' ? `${location.country_name} (DMA)` : location.type}
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-gray-300 text-xs group-hover:text-gray-500">{location.type}</span>
                                                                </button>
                                                            ))
                                                        ) : countrySearch.length >= 2 ? (
                                                            <div className="px-4 py-2 text-gray-500 text-sm">No locations found</div>
                                                        ) : (
                                                            <div className="px-4 py-2 text-gray-500 text-sm">Type at least 2 characters...</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selected Locations List */}
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {['countries', 'regions', 'cities', 'geo_markets'].map(type => {
                                                const includedList = adsetData.targeting.geo_locations?.[type] || [];
                                                const excludedList = adsetData.targeting.geo_locations?.[`excluded_${type}`] || [];

                                                return (
                                                    <React.Fragment key={type}>
                                                        {/* Included */}
                                                        {includedList.map((loc, idx) => {
                                                            // Handle legacy string countries or new object locations
                                                            const isString = typeof loc === 'string';
                                                            const key = isString ? loc : loc.key;
                                                            const name = isString ? (COUNTRIES.find(c => c.code === loc)?.name || loc) : loc.name;
                                                            const subtext = isString ? 'Country' : loc.type;

                                                            return (
                                                                <div key={`inc-${type}-${key}-${idx}`} className="flex items-center justify-between bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="bg-green-100 p-1 rounded-full">
                                                                            <Check size={12} className="text-green-600" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900">{name}</div>
                                                                            <div className="text-xs text-gray-500 capitalize">{subtext}</div>
                                                                        </div>
                                                                        <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-100 rounded ml-2">Include</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const newList = includedList.filter((_, i) => i !== idx);
                                                                            handleTargetingChange('geo_locations', {
                                                                                ...adsetData.targeting.geo_locations,
                                                                                [type]: newList
                                                                            });
                                                                        }}
                                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Excluded */}
                                                        {excludedList.map((loc, idx) => {
                                                            const isString = typeof loc === 'string';
                                                            const key = isString ? loc : loc.key;
                                                            const name = isString ? (COUNTRIES.find(c => c.code === loc)?.name || loc) : loc.name;
                                                            const subtext = isString ? 'Country' : loc.type;

                                                            return (
                                                                <div key={`exc-${type}-${key}-${idx}`} className="flex items-center justify-between bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="bg-red-100 p-1 rounded-full">
                                                                            <X size={12} className="text-red-600" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900">{name}</div>
                                                                            <div className="text-xs text-gray-500 capitalize">{subtext}</div>
                                                                        </div>
                                                                        <span className="text-xs text-red-600 font-medium px-2 py-0.5 bg-red-100 rounded ml-2">Exclude</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const newList = excludedList.filter((_, i) => i !== idx);
                                                                            handleTargetingChange('geo_locations', {
                                                                                ...adsetData.targeting.geo_locations,
                                                                                [`excluded_${type}`]: newList
                                                                            });
                                                                        }}
                                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}

                                            {/* Empty State */}
                                            {['countries', 'regions', 'cities', 'geo_markets'].every(type =>
                                                !adsetData.targeting.geo_locations?.[type]?.length &&
                                                !adsetData.targeting.geo_locations?.[`excluded_${type}`]?.length
                                            ) && (
                                                    <div className="text-sm text-gray-500 italic px-1">
                                                        No locations selected. Please search and add locations.
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Age *
                                        </label>
                                        <select
                                            value={adsetData.targeting.ageMin}
                                            onChange={(e) => handleTargetingChange('ageMin', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
                                                <option key={age} value={age}>{age}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Age *
                                        </label>
                                        <select
                                            value={adsetData.targeting.ageMax}
                                            onChange={(e) => handleTargetingChange('ageMax', parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            {Array.from({ length: 48 }, (_, i) => i + 18).map(age => (
                                                <option key={age} value={age}>{age}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender *
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleTargetingChange('genders', [])}
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${!adsetData.targeting.genders || adsetData.targeting.genders.length === 0
                                                ? 'border-amber-600 bg-amber-50 text-amber-700 font-medium'
                                                : 'border-gray-200 hover:border-amber-300 text-gray-600'
                                                }`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => handleTargetingChange('genders', [1])}
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${adsetData.targeting.genders?.includes(1)
                                                ? 'border-amber-600 bg-amber-50 text-amber-700 font-medium'
                                                : 'border-gray-200 hover:border-amber-300 text-gray-600'
                                                }`}
                                        >
                                            Men
                                        </button>
                                        <button
                                            onClick={() => handleTargetingChange('genders', [2])}
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${adsetData.targeting.genders?.includes(2)
                                                ? 'border-amber-600 bg-amber-50 text-amber-700 font-medium'
                                                : 'border-gray-200 hover:border-amber-300 text-gray-600'
                                                }`}
                                        >
                                            Women
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Placements *
                                    </label>
                                    <div className="space-y-3">
                                        {/* Advantage+ (Automatic) */}
                                        <div
                                            onClick={() => handleTargetingChange('publisher_platforms', [])}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${!adsetData.targeting.publisher_platforms || adsetData.targeting.publisher_platforms.length === 0
                                                ? 'border-amber-600 bg-amber-50'
                                                : 'border-gray-200 hover:border-amber-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!adsetData.targeting.publisher_platforms || adsetData.targeting.publisher_platforms.length === 0
                                                    ? 'border-amber-600 bg-amber-600'
                                                    : 'border-gray-400'
                                                    }`}>
                                                    {(!adsetData.targeting.publisher_platforms || adsetData.targeting.publisher_platforms.length === 0) && (
                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span className="font-semibold text-gray-900">Advantage+ placements (Recommended)</span>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-7">
                                                Use Advantage+ placements to maximize your budget and help show your ads to more people.
                                            </p>
                                        </div>

                                        {/* Manual Placements */}
                                        <div
                                            onClick={() => {
                                                if (!adsetData.targeting.publisher_platforms || adsetData.targeting.publisher_platforms.length === 0) {
                                                    handleTargetingChange('publisher_platforms', ['facebook', 'instagram']);
                                                }
                                            }}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${adsetData.targeting.publisher_platforms && adsetData.targeting.publisher_platforms.length > 0
                                                ? 'border-amber-600 bg-amber-50'
                                                : 'border-gray-200 hover:border-amber-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${adsetData.targeting.publisher_platforms && adsetData.targeting.publisher_platforms.length > 0
                                                    ? 'border-amber-600 bg-amber-600'
                                                    : 'border-gray-400'
                                                    }`}>
                                                    {(adsetData.targeting.publisher_platforms && adsetData.targeting.publisher_platforms.length > 0) && (
                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span className="font-semibold text-gray-900">Manual placements</span>
                                            </div>
                                            <p className="text-sm text-gray-500 ml-7 mb-3">
                                                Manually choose the places to show your ad.
                                            </p>

                                            {/* Platform Checkboxes */}
                                            {(adsetData.targeting.publisher_platforms && adsetData.targeting.publisher_platforms.length > 0) && (
                                                <div className="ml-7 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {['facebook', 'instagram', 'audience_network', 'messenger'].map(platform => (
                                                        <label key={platform} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={adsetData.targeting.publisher_platforms.includes(platform)}
                                                                onChange={(e) => {
                                                                    const current = adsetData.targeting.publisher_platforms || [];
                                                                    let updated;
                                                                    if (e.target.checked) {
                                                                        updated = [...current, platform];
                                                                    } else {
                                                                        updated = current.filter(p => p !== platform);
                                                                    }
                                                                    // Prevent deselecting all (which would switch to auto)
                                                                    if (updated.length === 0) {
                                                                        showWarning('At least one platform must be selected for Manual Placements.');
                                                                        return;
                                                                    }
                                                                    handleTargetingChange('publisher_platforms', updated);
                                                                }}
                                                                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                                            />
                                                            <span className="text-gray-700 capitalize">{platform.replace('_', ' ')}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Next Step'} <ChevronRight size={20} />
                </button>
            </div>
        </div >
    );
};

export default AdSetStep;
