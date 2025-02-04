import React, { useState, useEffect } from 'react';

const ImageAnalysis = ({ imageUrl, originalPrompt, onAnalysisComplete, shouldAnalyze }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let controller = new AbortController();

    const analyzeImage = async () => {
      if (!shouldAnalyze || !imageUrl || !originalPrompt || loading) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        
        const formData = new FormData();
        formData.append('file', imageBlob, 'image.png');
        formData.append('original_prompt', originalPrompt);
        
        const response = await fetch('http://localhost:8001/analyze', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const result = await response.json();
        
        if (isMounted && result.status === 'success') {
          onAnalysisComplete(result.data);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    analyzeImage();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [imageUrl, originalPrompt, shouldAnalyze, onAnalysisComplete]);

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