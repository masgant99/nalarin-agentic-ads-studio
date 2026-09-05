import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import React, { useState, useRef } from 'react';
import { Plus, X, Copy, Check, Upload, Loader, Star } from 'lucide-react';
import ImageTemplateSelector from '../components/ImageTemplateSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper Components
const CopyButton = ({ text, label }) => {
    const { showError } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
            title={`Copy ${label}`}
        >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>
    );
};

const AnalysisField = ({ label, value, fullWidth = false }) => {
    const displayValue = typeof value === 'object' && value !== null
        ? JSON.stringify(value, null, 2)
        : value;

    return (
        <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${fullWidth ? 'col-span-full' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{label}</h3>
                {displayValue && <CopyButton text={displayValue} label={label} />}
            </div>
            <p className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${typeof value === 'object' ? 'font-mono text-xs' : ''}`}>
                {displayValue || <span className="text-gray-400 italic">Not available</span>}
            </p>
        </div>
    );
};

const WinningAds = () => {
    const { showError } = useToast();
    const { authFetch } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const response = await authFetch(`${API_URL}/templates/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            console.log('Upload successful:', result);

            // Refresh the template selector to show new uploads
            setRefreshKey(prev => prev + 1);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            showError('Failed to upload templates. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Helper to safely parse JSON or return object if already parsed
    const safeParse = (data) => {
        if (!data) return null;
        if (typeof data === 'object') return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('JSON parse error:', e);
            return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Star size={32} className="text-amber-600" />
                        Image Templates
                    </h1>
                    <p className="text-gray-600 mt-1">Browse and manage your winning ad templates</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
                    {uploading ? 'Uploading...' : 'Upload Templates'}
                </button>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.zip"
                multiple
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Embedded Template Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ImageTemplateSelector
                    key={refreshKey}
                    onSelect={(template) => {
                        console.log('Selected template:', template);
                        setSelectedTemplate(template);
                    }}
                    onClose={() => { }}
                    embedded={true}
                />
            </div>

            {/* Selected Template Details Modal */}
            {selectedTemplate && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTemplate(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-900">Template Details</h2>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Image */}
                                <div>
                                    <img
                                        src={selectedTemplate.image_url}
                                        alt={selectedTemplate.name}
                                        className="w-full rounded-lg shadow-md mb-4"
                                    />

                                    {/* Quick Info */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
                                        <div className="space-y-2 text-sm">
                                            {selectedTemplate.template_category && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Category</span>
                                                    <span className="text-gray-900 font-medium capitalize">{selectedTemplate.template_category}</span>
                                                </div>
                                            )}
                                            {selectedTemplate.design_style && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Style</span>
                                                    <span className="text-gray-900 font-medium">{selectedTemplate.design_style}</span>
                                                </div>
                                            )}
                                            {selectedTemplate.created_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Created</span>
                                                    <span className="text-gray-900">{new Date(selectedTemplate.created_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Analysis Data */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {selectedTemplate.topic && (
                                                <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    {selectedTemplate.topic}
                                                </span>
                                            )}
                                            {selectedTemplate.mood && (
                                                <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    {selectedTemplate.mood}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Analysis Fields Grid */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedTemplate.subject_matter && (
                                            <AnalysisField label="Subject Matter" value={selectedTemplate.subject_matter} fullWidth />
                                        )}

                                        {selectedTemplate.analysis && (
                                            <AnalysisField label="Visual Analysis" value={selectedTemplate.analysis} fullWidth />
                                        )}

                                        {selectedTemplate.copy_analysis && (
                                            <AnalysisField label="Copy Analysis" value={selectedTemplate.copy_analysis} fullWidth />
                                        )}

                                        {selectedTemplate.structural_analysis && (
                                            <AnalysisField label="Structural Analysis" value={selectedTemplate.structural_analysis} fullWidth />
                                        )}

                                        {selectedTemplate.layering && (
                                            <AnalysisField label="Layering" value={selectedTemplate.layering} fullWidth />
                                        )}

                                        {selectedTemplate.recreation_prompt && (
                                            <AnalysisField label="Recreation Prompt" value={selectedTemplate.recreation_prompt} fullWidth />
                                        )}
                                    </div>

                                    {/* Template Structure */}
                                    {selectedTemplate.template_structure && (() => {
                                        const structure = safeParse(selectedTemplate.template_structure);
                                        if (!structure) return null;
                                        return (
                                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                                <h3 className="font-semibold text-amber-900 mb-3">Template Structure</h3>
                                                <div className="space-y-2 text-sm">
                                                    {structure.template_name && (
                                                        <div><span className="text-amber-700 font-medium">Name:</span> {structure.template_name}</div>
                                                    )}
                                                    {structure.layout_type && (
                                                        <div><span className="text-amber-700 font-medium">Layout:</span> {structure.layout_type}</div>
                                                    )}
                                                    {structure.aspect_ratio && (
                                                        <div><span className="text-amber-700 font-medium">Aspect Ratio:</span> {structure.aspect_ratio}</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Color Palette */}
                                    {selectedTemplate.color_palette && (() => {
                                        const palette = safeParse(selectedTemplate.color_palette);
                                        if (!palette) return null;
                                        return (
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <h3 className="font-semibold text-gray-900 mb-3">Color Palette</h3>
                                                <div className="flex gap-3 flex-wrap">
                                                    {Object.entries(palette).map(([key, color]) => {
                                                        if (key === 'theme' || key === 'color_count') return null;
                                                        return (
                                                            <div key={key} className="flex flex-col items-center">
                                                                <div
                                                                    className="w-12 h-12 rounded border border-gray-300 shadow-sm"
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                                <span className="text-xs text-gray-600 mt-1 capitalize">{key.replace('_', ' ')}</span>
                                                                <span className="text-xs text-gray-400">{color}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {palette.theme && (
                                                    <div className="mt-3 text-sm text-gray-600">
                                                        <span className="font-medium">Theme:</span> {palette.theme}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Typography System */}
                                    {selectedTemplate.typography_system && (
                                        <AnalysisField label="Typography System" value={selectedTemplate.typography_system} fullWidth />
                                    )}

                                    {/* Copy Patterns */}
                                    {selectedTemplate.copy_patterns && (
                                        <AnalysisField label="Copy Patterns" value={selectedTemplate.copy_patterns} fullWidth />
                                    )}

                                    {/* Visual Elements */}
                                    {selectedTemplate.visual_elements && (
                                        <AnalysisField label="Visual Elements" value={selectedTemplate.visual_elements} fullWidth />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WinningAds;
