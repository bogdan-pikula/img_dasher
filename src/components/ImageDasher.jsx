import React, { useState, useCallback } from 'react';
import ImageAnalysis from './ImageAnalysis';

const ImageGenerationApp = () => {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = useCallback(async (promptText) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          num_inference_steps: 4,
          guidance_scale: 0.0,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Image generation failed');
      }
      
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setCurrentImage(imageUrl);
    } catch (err) {
      setError(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await generateImage(prompt);
  };

  const handleAnalysisComplete = (refinedPrompt) => {
    if (refinedPrompt) {
      setPrompt(refinedPrompt);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Iterative Image Generation
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-900 text-white rounded-lg">
            {error}
          </div>
        )}

        <div className="relative">
          {currentImage && (
            <>
              <img
                src={currentImage}
                alt="Generated"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <ImageAnalysis
                imageUrl={currentImage}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </>
          )}
          
          {!currentImage && !isGenerating && (
            <div className="h-96 flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-gray-400">
                Enter a prompt above to generate an image
              </p>
            </div>
          )}
          
          {isGenerating && (
            <div className="h-96 flex items-center justify-center bg-gray-800 rounded-lg">
              <div className="text-white">Generating image...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationApp;