import React, { useState, useEffect } from 'react';

const ImageAnalysis = ({ imageUrl, onAnalysisComplete, shouldAnalyze }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractPromptAndAnalysis = (result) => {
    try {
      // Extract the full analysis text
      const fullAnalysis = result.description;
      
      // Extract the refined prompt
      const promptMatch = fullAnalysis.match(/prompt that would be used to generate this image[:\s]+([^.]+)/i);
      const refinedPrompt = promptMatch ? promptMatch[1].trim() : null;
      
      return { analysis: fullAnalysis, prompt: refinedPrompt };
    } catch (err) {
      console.error('Error extracting prompt:', err);
      return { analysis: null, prompt: null };
    }
  };

  useEffect(() => {
    const analyzeImage = async () => {
      if (!shouldAnalyze || !imageUrl) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        
        const formData = new FormData();
        formData.append('file', imageBlob, 'image.png');
        
        const response = await fetch('http://localhost:8001/analyze', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const result = await response.json();
        const { analysis, prompt } = extractPromptAndAnalysis(result);
        
        if (analysis || prompt) {
          onAnalysisComplete(analysis, prompt);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    analyzeImage();
  }, [imageUrl, shouldAnalyze, onAnalysisComplete]);

  if (!shouldAnalyze) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {loading && (
        <div className="bg-gray-800 bg-opacity-90 p-4 rounded-lg text-white">
          Analyzing image...
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 bg-opacity-90 p-4 rounded-lg text-white">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;