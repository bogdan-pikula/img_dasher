import React, { useState, useCallback, useEffect } from 'react';

const ImageGenerationApp = () => {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [detailOptions, setDetailOptions] = useState([]);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [optionImages, setOptionImages] = useState([]);
  const [selectedDetailValue, setSelectedDetailValue] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [refinementPlan, setRefinementPlan] = useState([]);
  const [currentRefinementStep, setCurrentRefinementStep] = useState(0);

  // Generate the initial image based on user prompt
  const generateImage = useCallback(async (promptText) => {
    setIsGenerating(true);
    setError(null);
    setOptionImages([]);
    setDetailOptions([]);
    setCurrentDetail(null);
    setRefinementPlan([]);
    setCurrentRefinementStep(0);
    
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
      
      // Add to generation history
      setGenerationHistory([{ 
        prompt: promptText, 
        imageUrl: imageUrl,
        detail: null,
        detailValue: null
      }]);
      
      // Get the complete refinement plan
      await getRefinementPlan(imageUrl, promptText);
    } catch (err) {
      setError(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Get complete refinement plan upfront
  const getRefinementPlan = async (imageUrl, originalPrompt) => {
    setIsAnalyzing(true);
    try {
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      const formData = new FormData();
      formData.append('file', imageBlob, 'image.png');
      formData.append('original_prompt', originalPrompt);
      
      const response = await fetch('http://localhost:8001/get-refinement-plan', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const result = await response.json();
      if (result.status === 'success' && result.refinementPlan) {
        setRefinementPlan(result.refinementPlan);
        
        // Set the first detail to refine
        if (result.refinementPlan.length > 0) {
          const firstStep = result.refinementPlan[0];
          setCurrentDetail(firstStep.detail);
          setDetailOptions(firstStep.options);
        }
      }
    } catch (err) {
      setError(`Analysis error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate default options if server doesn't provide them
  const generateDefaultOptions = (detailType, originalPrompt) => {
    let options = [];
    
    // Generate different options based on detail type
    switch (detailType.toLowerCase()) {
      case 'count':
        options = ['one', 'three', 'five', 'many'];
        break;
      case 'color':
        options = ['red', 'blue', 'green', 'multicolored'];
        break;
      case 'size':
        options = ['small', 'medium', 'large', 'huge'];
        break;
      case 'style':
        options = ['realistic', 'cartoon', 'watercolor', 'oil painting'];
        break;
      case 'background':
        options = ['forest', 'beach', 'mountains', 'space'];
        break;
      case 'lighting':
        options = ['daylight', 'sunset', 'night', 'studio lighting'];
        break;
      default:
        options = ['option 1', 'option 2', 'option 3', 'option 4'];
    }
    
    setDetailOptions(options);
  };

  // Generate images for each detail option
  const generateOptionImages = async () => {
    if (!currentDetail || detailOptions.length === 0 || isGeneratingOptions) return;
    
    setIsGeneratingOptions(true);
    setOptionImages([]);
    
    const lastHistoryItem = generationHistory[generationHistory.length - 1];
    const basePrompt = lastHistoryItem.prompt;
    
    try {
      const optionPromises = detailOptions.map(async (option, index) => {
        // Combine base prompt with the detail option
        const detailPrompt = `${basePrompt} with ${currentDetail}: ${option}`;
        
        const response = await fetch('http://localhost:8000/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: detailPrompt,
            num_inference_steps: 4,
            guidance_scale: 0.0,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Option generation failed for option ${index + 1}`);
        }
        
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        return {
          option,
          imageUrl,
          prompt: detailPrompt
        };
      });
      
      const results = await Promise.all(optionPromises);
      setOptionImages(results);
    } catch (err) {
      setError(`Option generation error: ${err.message}`);
    } finally {
      setIsGeneratingOptions(false);
    }
  };

  // When detail is set, generate the option images
  useEffect(() => {
    if (currentDetail && detailOptions.length > 0) {
      generateOptionImages();
    }
  }, [currentDetail, detailOptions]);
  
  // Keep the refinement process going
  useEffect(() => {
    if (refinementPlan.length > 0 && currentRefinementStep < refinementPlan.length) {
      // Automatically set up the current detail and options based on the plan
      const currentDetailPlan = refinementPlan[currentRefinementStep];
      if (currentDetailPlan && currentDetailPlan.detail !== currentDetail) {
        setCurrentDetail(currentDetailPlan.detail);
        setDetailOptions(currentDetailPlan.options);
      }
    }
  }, [refinementPlan, currentRefinementStep]);

  // Handle selection of a detail option
  const handleSelectOption = (option, index) => {
    setSelectedDetailValue(option.option);
    
    // Update prompt with selected detail
    const newPrompt = option.prompt;
    setPrompt(newPrompt);
    
    // Update current image
    setCurrentImage(option.imageUrl);
    
    // Add to generation history
    setGenerationHistory(prev => [
      ...prev,
      {
        prompt: newPrompt,
        imageUrl: option.imageUrl,
        detail: currentDetail,
        detailValue: option.option
      }
    ]);
    
    // Reset options
    setOptionImages([]);
    
    // Move to next refinement step
    const nextStep = currentRefinementStep + 1;
    setCurrentRefinementStep(nextStep);
    
    // If there are more steps in the plan, set up the next detail
    if (nextStep < refinementPlan.length) {
      const nextDetail = refinementPlan[nextStep];
      setCurrentDetail(nextDetail.detail);
      setDetailOptions(nextDetail.options);
    } else {
      // No more steps, we're done with refinements
      setCurrentDetail(null);
      setDetailOptions([]);
    }
  };

  // Initial form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await generateImage(prompt);
  };

  // Reset the generation process
  const handleReset = () => {
    setCurrentImage(null);
    setOptionImages([]);
    setDetailOptions([]);
    setCurrentDetail(null);
    setSelectedDetailValue(null);
    setGenerationHistory([]);
    setRefinementPlan([]);
    setCurrentRefinementStep(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Image Dasher - Iterative Detail Refinement
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none resize-y"
              disabled={isGenerating || isAnalyzing || isGeneratingOptions}
              rows={3}
              style={{ minHeight: '80px' }}
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim() || isAnalyzing || isGeneratingOptions}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isGenerating || isAnalyzing || isGeneratingOptions}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-900 text-white rounded-lg">
            {error}
          </div>
        )}

        {/* Main image display */}
        <div className="relative mb-8">
          {currentImage && (
            <div className="relative">
              <img
                src={currentImage}
                alt="Generated"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-white">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing image for next detail...
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              <div className="text-white">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-8 w-8 text-white mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating image...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current detail suggestion */}
        {currentDetail && (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Suggested Detail Refinement</h2>
            <p className="text-gray-300">
              Let's refine the <span className="font-bold text-blue-400">{currentDetail}</span> in your image.
              {isGeneratingOptions && " Generating options..."}
            </p>
          </div>
        )}

        {/* Option images grid */}
        {optionImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Select your preferred {currentDetail}:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {optionImages.map((option, index) => (
                <div 
                  key={index}
                  className="cursor-pointer hover:scale-102 transition-transform relative"
                  onClick={() => handleSelectOption(option, index)}
                >
                  <div className="relative rounded-lg overflow-hidden bg-gray-800 shadow-lg">
                    <img 
                      src={option.imageUrl} 
                      alt={`Option ${index + 1}: ${option.option}`}
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="text-white font-medium">
                        {option.option}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation history */}
        {generationHistory.length > 1 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Generation History</h2>
            <div className="space-y-4">
              {generationHistory.map((item, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/4 flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={`Generation ${index + 1}`}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-white mb-2">Step {index + 1}</h3>
                    <p className="text-gray-300 mb-2">
                      <span className="font-semibold">Prompt:</span> {item.prompt}
                    </p>
                    {item.detail && (
                      <p className="text-gray-300">
                        <span className="font-semibold">Refined detail:</span>{" "}
                        <span className="text-blue-400">{item.detail}</span> → {item.detailValue}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationApp;


// import React, { useState, useCallback } from 'react';

// const ImageGenerationApp = () => {
//   const [prompt, setPrompt] = useState('');
//   const [currentImage, setCurrentImage] = useState(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [error, setError] = useState(null);

//   const generateImage = useCallback(async (promptText) => {
//     setIsGenerating(true);
//     setError(null);
    
//     try {
//       const response = await fetch('http://localhost:8000/generate', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           prompt: promptText,
//           num_inference_steps: 4,
//           guidance_scale: 0.0,
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Image generation failed');
//       }
      
//       const imageBlob = await response.blob();
//       const imageUrl = URL.createObjectURL(imageBlob);
//       setCurrentImage(imageUrl);
      
//       // Analyze the image after generation
//       await analyzeImage(imageUrl);
//     } catch (err) {
//       setError(`Generation error: ${err.message}`);
//     } finally {
//       setIsGenerating(false);
//     }
//   }, []);

//   const analyzeImage = async (imageUrl) => {
//     setIsAnalyzing(true);
//     try {
//       const imageResponse = await fetch(imageUrl);
//       const imageBlob = await imageResponse.blob();
      
//       const formData = new FormData();
//       formData.append('file', imageBlob, 'image.png');
      
//       const response = await fetch('http://localhost:8001/analyze', {
//         method: 'POST',
//         body: formData,
//       });
      
//       if (!response.ok) {
//         throw new Error('Analysis failed');
//       }
      
//       const result = await response.json();
//       if (result.status === 'success' && result.refined_prompt) {
//         setPrompt(result.refined_prompt);
//       }
//     } catch (err) {
//       setError(`Analysis error: ${err.message}`);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!prompt.trim() || isGenerating) return;
//     await generateImage(prompt);
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold text-white mb-8 text-center">
//           Image Dasher - Iterative Image Generation
//         </h1>
        
//         <form onSubmit={handleSubmit} className="mb-8">
//           <div className="flex flex-col gap-4">
//             <textarea
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               placeholder="Enter your prompt..."
//               className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none resize-y"
//               disabled={isGenerating}
//               rows={3}
//               style={{ minHeight: '80px' }}
//             />
//             <button
//               type="submit"
//               disabled={isGenerating || !prompt.trim()}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isGenerating ? 'Generating...' : 'Generate'}
//             </button>
//           </div>
//         </form>

//         {error && (
//           <div className="mb-8 p-4 bg-red-900 text-white rounded-lg">
//             {error}
//           </div>
//         )}

//         <div className="relative mb-8">
//           {currentImage && (
//             <div className="relative">
//               <img
//                 src={currentImage}
//                 alt="Generated"
//                 className="w-full h-auto rounded-lg shadow-lg"
//               />
//               {isAnalyzing && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
//                   <div className="text-white">Analyzing image...</div>
//                 </div>
//               )}
//             </div>
//           )}
          
//           {!currentImage && !isGenerating && (
//             <div className="h-96 flex items-center justify-center bg-gray-800 rounded-lg">
//               <p className="text-gray-400">
//                 Enter a prompt above to generate an image
//               </p>
//             </div>
//           )}
          
//           {isGenerating && (
//             <div className="h-96 flex items-center justify-center bg-gray-800 rounded-lg">
//               <div className="text-white">Generating image...</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageGenerationApp;