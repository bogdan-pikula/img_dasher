import React, { useState, useEffect } from 'react';

const ImageAnalysis = ({ imageUrl, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractPrompt = (analysisText) => {
    // Extract the refined prompt from the analysis text
    // This is a simple implementation - you might want to make it more robust
    const promptMatch = analysisText.match(/prompt that would be used to generate this image[:\s]+([^.]+)/i);
    return promptMatch ? promptMatch[1].trim() : null;
  };

  const highlightKeywords = (prompt) => {
    // Split the prompt into words and highlight key parameters
    const keywords = [
      'lighting', 'angle', 'style', 'color', 'mood', 'composition',
      'perspective', 'time', 'weather', 'season', 'texture', 'detail'
    ];
    
    return prompt.split(' ').map((word, index) => {
      const isKeyword = keywords.some(keyword => 
        word.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return (
        <span 
          key={index} 
          className={isKeyword ? 'text-blue-400 font-semibold' : ''}
        >
          {word}{' '}
        </span>
      );
    });
  };

  useEffect(() => {
    const analyzeImage = async () => {
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
        const refinedPrompt = extractPrompt(result.description);
        
        if (refinedPrompt) {
          onAnalysisComplete(refinedPrompt);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (imageUrl) {
      analyzeImage();
    }
  }, [imageUrl, onAnalysisComplete]);

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