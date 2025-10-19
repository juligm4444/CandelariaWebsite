import { useState } from 'react';

export const TeamCard = ({ team }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-120 h-[28rem] mx-4 [perspective:1000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-1000 ease-in-out ${
          isFlipped ? '[transform:rotateX(180deg)]' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-lg border border-border shadow-lg flex flex-col"></div>
      </div>
    </div>
  );
};
