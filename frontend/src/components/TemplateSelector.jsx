import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, LayoutGrid, List } from 'lucide-react';
import templates from '../data/templates.json';

const TemplateSelector = ({ selectedTemplate, onSelect, onNext, onBack }) => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Choose a Template</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${selectedTemplate?.id === template.id
                                ? 'border-blue-600 ring-2 ring-blue-100'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="h-40 bg-gray-100 relative">
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                                {selectedTemplate?.id === template.id && (
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                                        <Check size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3 mb-8">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center gap-4 hover:shadow-sm ${selectedTemplate?.id === template.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{template.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{template.description}</p>
                                    </div>
                                    {selectedTemplate?.id === template.id && (
                                        <div className="bg-blue-600 text-white p-1 rounded-full">
                                            <Check size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!selectedTemplate}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors ${!selectedTemplate
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    Next: Generate Ad
                </button>
            </div>
        </div>
    );
};

export default TemplateSelector;
