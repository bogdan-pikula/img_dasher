import React, { useState, useEffect } from 'react';

const ImageAnalysis = ({ 
  imageUrl, 
  originalPrompt, 
  onAnalysisComplete, 
  shouldAnalyze 
}) => {
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
        
        const response = await fetch('http://localhost:8001/analyze-for-detail', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        
        const result = await response.json();
        
        if (isMounted && result.status === 'success') {
          onAnalysisComplete({
            suggestedDetail: result.suggestedDetail,
            detailOptions: result.detailOptions || []
          });
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
  }, [imageUrl, originalPrompt, shouldAnalyze, onAnalysisComplete, loading]);

  if (!shouldAnalyze) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {loading && (
        <div className="bg-gray-800 bg-opacity-90 p-4 rounded-lg text-white">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing image for next detail to refine...</span>
          </div>
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
// import React, { useState, useEffect } from 'react';

// const ImageAnalysis = ({ imageUrl, originalPrompt, onAnalysisComplete, shouldAnalyze }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;
//     let controller = new AbortController();

//     const analyzeImage = async () => {
//       if (!shouldAnalyze || !imageUrl || !originalPrompt || loading) return;
      
//       setLoading(true);
//       setError(null);
      
//       try {
//         const imageResponse = await fetch(imageUrl);
//         const imageBlob = await imageResponse.blob();
        
//         const formData = new FormData();
//         formData.append('file', imageBlob, 'image.png');
//         formData.append('original_prompt', originalPrompt);
        
//         const response = await fetch('http://localhost:8001/analyze', {
//           method: 'POST',
//           body: formData,
//           signal: controller.signal
//         });
        
//         if (!response.ok) {
//           throw new Error('Analysis failed');
//         }
        
//         const result = await response.json();
        
//         if (isMounted && result.status === 'success') {
//           onAnalysisComplete(result.data);
//         }
//       } catch (err) {
//         if (err.name === 'AbortError') {
//           return;
//         }
//         if (isMounted) {
//           setError(err.message);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     analyzeImage();

//     return () => {
//       isMounted = false;
//       controller.abort();
//     };
//   }, [imageUrl, originalPrompt, shouldAnalyze, onAnalysisComplete]);

//   if (!shouldAnalyze) return null;

//   return (
//     <div className="absolute inset-0 flex items-center justify-center">
//       {loading && (
//         <div className="bg-gray-800 bg-opacity-90 p-4 rounded-lg text-white">
//           Analyzing image...
//         </div>
//       )}
      
//       {error && (
//         <div className="bg-red-900 bg-opacity-90 p-4 rounded-lg text-white">
//           Error: {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageAnalysis;