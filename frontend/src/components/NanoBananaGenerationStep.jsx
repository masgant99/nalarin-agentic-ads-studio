import React, { useState } from 'react';
import { ChevronRight, Wand2, RefreshCw, Check, Image as ImageIcon } from 'lucide-react';

const NanoBananaGenerationStep = ({ copyData, selectedTemplate, onImagesGenerated, onNext, onBack }) => {
    const [generating, setGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    const handleGenerate = () => {
        setGenerating(true);

        // Mock API call to Nano Banana Pro
        setTimeout(() => {
            const newImages = Array.from({ length: 4 }).map((_, i) => ({
                id: `nb_${Date.now()}_${i}`,
                url: `https://picsum.photos/seed/${Date.now() + i}/1080/1080`, // Placeholder images
                previewUrl: `https://picsum.photos/seed/${Date.now() + i}/400/400`,
                name: `Generated Image ${i + 1}`
            }));

            setGeneratedImages(newImages);
            setGenerating(false);
        }, 3000);
    };

    const toggleImageSelection = (image) => {
        if (selectedImages.find(img => img.id === image.id)) {
            setSelectedImages(prev => prev.filter(img => img.id !== image.id));
        } else {
            setSelectedImages(prev => [...prev, image]);
        }
    };

    const handleContinue = () => {
        onImagesGenerated(selectedImages);
        onNext();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2">Generate Images</h2>
            <p className="text-gray-600 mb-8">Create stunning visuals using Nano Banana Pro AI.</p>

            {/* Generation Controls */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900">Generation Settings</h3>
                        <p className="text-sm text-gray-500">Based on your copy and selected template</p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                    >
                        {generating ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} />
                                Generate Images
                            </>
                        )}
                    </button>
                </div>

                {/* Context Summary */}
                <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <span className="flex items-center gap-1">
                        <span className="font-semibold">Headline:</span> {copyData.headline || 'N/A'}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                        <span className="font-semibold">Template:</span> {selectedTemplate?.name || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Results Grid */}
            {generatedImages.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Generated Results</h3>
                        <span className="text-sm text-gray-500">{selectedImages.length} selected</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {generatedImages.map(image => (
                            <div
                                key={image.id}
                                onClick={() => toggleImageSelection(image)}
                                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedImages.find(img => img.id === image.id)
                                        ? 'border-blue-600 ring-2 ring-blue-100'
                                        : 'border-transparent hover:border-gray-300'
                                    }`}
                            >
                                <img
                                    src={image.previewUrl}
                                    alt={image.name}
                                    className="w-full aspect-square object-cover"
                                />

                                {/* Selection Overlay */}
                                <div className={`absolute inset-0 bg-black/20 transition-opacity ${selectedImages.find(img => img.id === image.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`}>
                                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${selectedImages.find(img => img.id === image.id)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white/80 text-gray-400'
                                        }`}>
                                        <Check size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {generatedImages.length === 0 && !generating && (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mb-8">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Ready to Generate</h3>
                    <p className="text-gray-500">Click the generate button to create images with Nano Banana Pro.</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={selectedImages.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Create Batch ({selectedImages.length}) <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default NanoBananaGenerationStep;
