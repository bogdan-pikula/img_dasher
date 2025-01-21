import React, { useState, useRef } from 'react';

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

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center p-8">
      <div 
        className="relative w-full max-w-6xl h-[600px] flex justify-between" 
        ref={containerRef} 
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* Left side - Current selected image */}
        <div className="w-1/3">
          <div className="absolute top-4 left-4 text-white space-y-2 z-10">
            <div>Round: {round + 1} / {maxRounds}</div>
            <div className="text-sm">
              {round < maxRounds ? "Move mouse up/down to select an option" : "Selection complete!"}
            </div>
          </div>
          <div className="mt-16">
            <img 
              src={`/images/${selectedPath}.png`}
              alt="Current selection"
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-2 text-white text-sm">
              Current path: {selectedPath}
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
                  {image.path}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDasher;
// import React, { useState, useRef } from 'react';

// const ImageDasher = () => {
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
//   const [speed, setSpeed] = useState(1);
//   const [selectedPath, setSelectedPath] = useState('0000000000');
//   const [round, setRound] = useState(0);
//   const containerRef = useRef(null);
//   const maxRounds = 10;

//   const getCurrentOptions = () => {
//     if (round >= maxRounds) return [];
    
//     const option1 = selectedPath;
//     const option2 = selectedPath.substring(0, round) + '1' + '0'.repeat(9 - round);
    
//     return [
//       { id: 1, src: `/images/${option1}.png`, path: option1 },
//       { id: 2, src: `/images/${option2}.png`, path: option2 }
//     ];
//   };

//   const handleMouseMove = (e) => {
//     if (!containerRef.current) return;

//     const rect = containerRef.current.getBoundingClientRect();
//     const x = (e.clientX - rect.left) / rect.width;
//     const y = (e.clientY - rect.top) / rect.height;

//     setMousePos({ x, y });
//     setSpeed(1 + x * 10);
//   };

//   const handleClick = () => {
//     const index = Math.floor(mousePos.y * 2);
//     if (index >= 0 && index < 2 && round < maxRounds) {
//       const options = getCurrentOptions();
//       const selected = options[index];
//       setSelectedPath(selected.path);
//       setRound(round + 1);
//     }
//   };

//   const currentOptions = getCurrentOptions();

//   return (
//     <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
//       <div 
//         className="relative w-full max-w-4xl h-96" 
//         ref={containerRef} 
//         onMouseMove={handleMouseMove}
//         onClick={handleClick}
//       >
//         {/* Current selected image */}
//         <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-64 h-64">
//           <img 
//             src={`/images/${selectedPath}.png`}
//             alt="Current selection"
//             className="w-full h-full object-cover rounded-lg"
//           />
//           <div className="mt-2 text-white text-sm">
//             Current path: {selectedPath}
//           </div>
//         </div>

//         {/* Current selection options */}
//         {round < maxRounds && (
//           <div className="absolute right-0 top-0 h-full w-64 flex flex-col">
//             {currentOptions.map((image, index) => (
//               <div
//                 key={image.id}
//                 className="flex-1 transition-all duration-300 p-2"
//                 style={{
//                   transform: `scale(${1 + (index === Math.floor(mousePos.y * 2) ? 0.2 : 0)})`
//                 }}
//               >
//                 <img 
//                   src={image.src} 
//                   alt={`Option ${index + 1}`}
//                   className="w-full h-full object-cover rounded-lg"
//                 />
//                 <div className="mt-1 text-white text-xs text-center">
//                   {image.path}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Status and Instructions */}
//         <div className="absolute top-4 left-4 text-white space-y-2">
//           <div>Round: {round + 1} / {maxRounds}</div>
//           <div className="text-sm">
//             {round < maxRounds ? "Move mouse up/down to select, left/right for speed" : "Selection complete!"}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageDasher;