import { useTranslation } from "react-i18next";

export const Mission = () => {
  const { t } = useTranslation();

  return (
    <div className="h-328 overflow-hidden relative w-full">
      {/* Background images */}
      <div className="absolute h-328 left-781 top-0 w-929 bg-gray-200 border border-gray-400">
        {/* Right image placeholder */}
      </div>
      <div className="absolute h-328 left-210 top-0 w-930 bg-gray-300 border border-gray-400">
        {/* Left image placeholder */}
      </div>
      
      {/* Mission content */}
      <div className="absolute font-normal left-239 text-25 text-black top-59 w-708">
        <p className="leading-normal mb-0">
          <span>What drives </span>
          <span className="font-bold">Candelaria</span>:
        </p>
        <ul className="list-disc mt-4">
          <li className="leading-normal mb-0 ml-[37.5px]">
            <span className="font-bold">Interdisciplinary collaboration</span>
            <span> to design and build a high-performance solar vehicle.</span>
          </li>
          <li className="leading-normal mb-0 ml-[37.5px]">
            <span className="font-bold">Research and knowledge generation</span>
            <span> in solar mobility, shared through publications and education.</span>
          </li>
          <li className="leading-normal ml-[37.5px]">
            <span className="font-bold">Design excellence and real-world performance</span>, validated through testing and international competitions.
          </li>
        </ul>
      </div>
    </div>
  );
};