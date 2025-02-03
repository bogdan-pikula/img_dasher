import React, { useState } from 'react';

const ImageAnalysis = ({ imageUrl, onAnalysisChange, currentAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processAnalysisText = (text) => {
    const assistantResponse = text.split('assistant')[1]?.trim();
    if (!assistantResponse) return null;

    const sections = assistantResponse.split('**').filter(Boolean);
    
    return sections.map(section => {
      const [paramName, ...descriptionParts] = section.split(':');
      const description = descriptionParts.join(':').trim();

      const bulletPoints = description
        .split('+')
        .map(point => point.trim())
        .filter(Boolean);

      return {
        parameter: paramName.trim(),
        details: bulletPoints.length > 0 ? bulletPoints : [description]
      };
    });
  };

  const analyzeImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      const formData = new FormData();
      formData.append('file', imageBlob, 'image.png');
      
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const result = await response.json();
      const processedResult = processAnalysisText(result.description);
      onAnalysisChange(processedResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center">
      <div className="relative w-full">
        {/* Analysis sections positioned around the image */}
        {currentAnalysis && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Left section */}
              <div className="space-y-4 pr-4">
                {currentAnalysis.slice(0, Math.ceil(currentAnalysis.length / 3)).map((section, index) => (
                  <div key={index} className="bg-gray-800 bg-opacity-90 p-3 rounded">
                    <div className="text-blue-400 font-bold">{section.parameter}</div>
                    <div className="text-gray-300 text-xs">
                      {section.details.map((detail, i) => (
                        <div key={i}>• {detail}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Center - empty to show image */}
              <div className="relative">
                <button 
                  onClick={analyzeImage}
                  disabled={loading}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 pointer-events-auto"
                >
                  {loading ? 'Analyzing...' : 'Analyze Image'}
                </button>
              </div>
              
              {/* Right section */}
              <div className="space-y-4 pl-4">
                {currentAnalysis.slice(Math.ceil(currentAnalysis.length / 3)).map((section, index) => (
                  <div key={index} className="bg-gray-800 bg-opacity-90 p-3 rounded">
                    <div className="text-blue-400 font-bold">{section.parameter}</div>
                    <div className="text-gray-300 text-xs">
                      {section.details.map((detail, i) => (
                        <div key={i}>• {detail}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!currentAnalysis && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button 
              onClick={analyzeImage}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}
        
        {error && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-red-400 bg-gray-800 p-2 rounded">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysis;

// import React, { useState } from 'react';

// const ImageAnalysis = ({ imageUrl }) => {
//   const [analysis, setAnalysis] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const processAnalysisText = (text) => {
//     // Extract only the assistant's response
//     const assistantResponse = text.split('assistant')[1]?.trim();
//     if (!assistantResponse) return null;

//     // Split into sections by "***" and process each section
//     const sections = assistantResponse.split('**').filter(Boolean);
    
//     return sections.map(section => {
//       // Split the parameter name from its description
//       const [paramName, ...descriptionParts] = section.split(':');
//       const description = descriptionParts.join(':').trim();

//       // Split description into bullet points if they exist
//       const bulletPoints = description
//         .split('+')
//         .map(point => point.trim())
//         .filter(Boolean);

//       return {
//         parameter: paramName.trim(),
//         details: bulletPoints.length > 0 ? bulletPoints : [description]
//       };
//     });
//   };

//   const analyzeImage = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const imageResponse = await fetch(imageUrl);
//       const imageBlob = await imageResponse.blob();
      
//       const formData = new FormData();
//       formData.append('file', imageBlob, 'image.png');
      
//       const response = await fetch('http://localhost:8000/analyze', {
//         method: 'POST',
//         body: formData,
//       });
      
//       if (!response.ok) {
//         throw new Error('Analysis failed');
//       }
      
//       const result = await response.json();
//       setAnalysis(result.description);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processedAnalysis = analysis ? processAnalysisText(analysis) : null;

//   return (
//     <div className="mt-4 p-4 bg-gray-700 rounded-lg">
//       <button 
//         onClick={analyzeImage}
//         disabled={loading}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? 'Analyzing...' : 'Analyze Image'}
//       </button>
      
//       {error && (
//         <div className="mt-2 text-red-400">
//           Error: {error}
//         </div>
//       )}
      
//       {processedAnalysis && (
//         <div className="mt-4 space-y-4">
//           <h3 className="text-white font-semibold mb-2">Analysis Result:</h3>
//           {processedAnalysis.map((section, index) => (
//             <div key={index} className="border-l-2 border-blue-500 pl-4">
//               <div className="text-blue-400 font-bold text-lg">
//                 {section.parameter}
//               </div>
//               <div className="text-gray-300 text-sm space-y-1">
//                 {section.details.map((detail, detailIndex) => (
//                   <div key={detailIndex} className="ml-2">
//                     • {detail}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageAnalysis;