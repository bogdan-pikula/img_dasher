import React, { useState } from 'react';

const ImageAnalysis = ({ imageUrl }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processAnalysisText = (text) => {
    // Extract only the assistant's response
    const assistantResponse = text.split('assistant')[1]?.trim();
    if (!assistantResponse) return null;

    // Split into sections by "***" and process each section
    const sections = assistantResponse.split('**').filter(Boolean);
    
    return sections.map(section => {
      // Split the parameter name from its description
      const [paramName, ...descriptionParts] = section.split(':');
      const description = descriptionParts.join(':').trim();

      // Split description into bullet points if they exist
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
      setAnalysis(result.description);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processedAnalysis = analysis ? processAnalysisText(analysis) : null;

  return (
    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
      <button 
        onClick={analyzeImage}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>
      
      {error && (
        <div className="mt-2 text-red-400">
          Error: {error}
        </div>
      )}
      
      {processedAnalysis && (
        <div className="mt-4 space-y-4">
          <h3 className="text-white font-semibold mb-2">Analysis Result:</h3>
          {processedAnalysis.map((section, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-4">
              <div className="text-blue-400 font-bold text-lg">
                {section.parameter}
              </div>
              <div className="text-gray-300 text-sm space-y-1">
                {section.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="ml-2">
                    • {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;

// import React, { useState } from 'react';

// const ImageAnalysis = ({ imageUrl }) => {
//   const [analysis, setAnalysis] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const analyzeImage = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Fetch the image first
//       const imageResponse = await fetch(imageUrl);
//       const imageBlob = await imageResponse.blob();
      
//       // Create form data
//       const formData = new FormData();
//       formData.append('file', imageBlob, 'image.png');
      
//       // Send to analysis server
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
      
//       {analysis && (
//         <div className="mt-4">
//           <h3 className="text-white font-semibold mb-2">Analysis Result:</h3>
//           <p className="text-gray-200">{analysis}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImageAnalysis;