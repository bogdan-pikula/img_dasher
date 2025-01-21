import React, { useState, useRef } from 'react';

const parameters = {
  "Time of Day": ["Morning with soft sunlight", "Evening with a glowing sunset"],
  "Season": ["Winter with snow-covered streets", "Summer with lush green trees and clear skies"],
  "Perspective/Angle": ["Aerial view of the cityscape with the building in focus", "Street-level view showing the buildings entrance and surrounding streets"],
  "Architectural Style": ["Modern glass skyscraper with sleek lines", "Historic brick building with a renovated tech-office look"],
  "Developer Activity Inside the Building": ["Developers working collaboratively in a bright, open workspace", "Individuals coding at standing desks with futuristic displays"],
  "Diversity and Inclusivity": ["Multicultural team visibly collaborating on tasks", "Gender-balanced team with a mix of ages working in harmony"],
  "Technological Ambiance": ["Screens and holographic displays projecting futuristic AI models", "Traditional laptops and whiteboards full of brainstorming ideas"],
  "Outdoor Environment Around the Building": ["CN Tower visible in the background alongside other iconic Toronto landmarks", "A vibrant street with pedestrians, bicycles, and streetcars"],
  "Building Signage or Branding": ["A tech startup logo displayed prominently on the building", "A generic but sleek 'AI Innovation Hub' branding"],
  "Weather Conditions": ["Bright, sunny day with clear skies", "Overcast with light rain and reflections on the pavement"],
};

const ImageDasher = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(1);
  const [selectedPath, setSelectedPath] = useState('0000000000');
  const [round, setRound] = useState(0);
  const containerRef = useRef(null);
  const maxRounds = 10;

  const getCurrentOptions = () => {
    if (round >= maxRounds) return [];
    
    const option1 = selectedPath;
    const option2 = selectedPath.substring(0, round) + '1' + '0'.repeat(9 - round);
    
    return [
      { id: 1, src: `/images/${option1}.png`, path: option1 },
      { id: 2, src: `/images/${option2}.png`, path: option2 }
    ];
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePos({ x, y });
    setSpeed(1 + x * 10);
  };

  const handleClick = () => {
    const index = Math.floor(mousePos.y * 2);
    if (index >= 0 && index < 2 && round < maxRounds) {
      const options = getCurrentOptions();
      const selected = options[index];
      setSelectedPath(selected.path);
      setRound(round + 1);
    }
  };

  const currentOptions = getCurrentOptions();
  const parameterNames = Object.keys(parameters);
  const currentParameter = parameterNames[round];

  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        {/* Main interaction area */}
        <div 
          className="relative w-full h-[600px] flex justify-between bg-gray-800 rounded-lg p-8" 
          ref={containerRef} 
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          {/* Left side - Current selected image */}
          <div className="w-1/3">
            <div className="absolute top-4 left-4 text-white space-y-2 z-10">
              <div className="text-xl font-bold">Round: {round + 1} / {maxRounds}</div>
              
              {round < maxRounds ? (
                <div className="bg-gray-700 rounded-lg p-4 mt-4">
                  <div className="text-lg font-semibold mb-2">
                    Selecting: {currentParameter}
                  </div>
                  <div className="text-sm">
                    Choose between:
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>{parameters[currentParameter][0]}</li>
                      <li>{parameters[currentParameter][1]}</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    Move mouse up/down to select, left/right for speed
                  </div>
                </div>
              ) : (
                <div className="text-lg">Selection complete!</div>
              )}
            </div>
            <div className="mt-48">
              <img 
                src={`/images/${selectedPath}.png`}
                alt="Current selection"
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-2 text-white text-sm">
                Selection path: {selectedPath}
              </div>
            </div>
          </div>

          {/* Right side - Current selection options */}
          {round < maxRounds && (
            <div className="w-1/3 h-full flex flex-col justify-center gap-8">
              {currentOptions.map((image, index) => (
                <div
                  key={image.id}
                  className="transition-all duration-300"
                  style={{
                    transform: `scale(${1 + (index === Math.floor(mousePos.y * 2) ? 0.1 : 0)})`
                  }}
                >
                  <img 
                    src={image.src} 
                    alt={`Option ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="mt-2 text-white text-sm text-center">
                    {parameters[currentParameter][index]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDasher;