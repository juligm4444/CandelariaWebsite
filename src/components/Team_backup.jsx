import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Team = () => {
  const { t } = useTranslation();
  const [hoveredTeam, setHoveredTeam] = useState(null);

  const teams = [
    { 
      id: 'committee', 
      nameKey: 'teams.committee.name',
      descriptionKey: 'teams.committee.description',
      memberCount: 5 
    },
    { 
      id: 'logistics', 
      nameKey: 'teams.logistics.name',
      descriptionKey: 'teams.logistics.description',
      memberCount: 12 
    },
    { 
      id: 'design', 
      nameKey: 'teams.design.name',
      descriptionKey: 'teams.design.description',
      memberCount: 8 
    },
    { 
      id: 'cells', 
      nameKey: 'teams.cells.name',
      descriptionKey: 'teams.cells.description',
      memberCount: 10 
    },
    { 
      id: 'comtrac', 
      nameKey: 'teams.comtrac.name',
      descriptionKey: 'teams.comtrac.description',
      memberCount: 7 
    },
    { 
      id: 'mechanics', 
      nameKey: 'teams.mechanics.name',
      descriptionKey: 'teams.mechanics.description',
      memberCount: 15 
    },
    { 
      id: 'electronics', 
      nameKey: 'teams.electronics.name',
      descriptionKey: 'teams.electronics.description',
      memberCount: 9 
    },
  ];

  return (
    <div className="w-full py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">{t('teams.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('teams.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="team-card bg-gray-50 border-2 border-black rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
              onMouseEnter={() => setHoveredTeam(team.id)}
              onMouseLeave={() => setHoveredTeam(null)}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {t(team.nameKey).charAt(0)}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-black mb-2">
                  {t(team.nameKey)}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {t(team.descriptionKey)}
                </p>
                
                <div className="border-t border-gray-300 pt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {t('teams.memberCount', { count: team.memberCount })}
                  </p>
                  
                  <button className="text-black font-medium hover:text-gray-600 transition-colors text-sm border border-black px-3 py-1 rounded hover:bg-gray-200">
                    {t('teams.viewTeam')}
                  </button>
                </div>
              </div>
              
              {hoveredTeam === team.id && (
                <div className="absolute inset-0 bg-black bg-opacity-90 rounded-lg p-4 flex items-center justify-center transition-all duration-300">
                  <div className="text-center text-white">
                    <h4 className="font-bold mb-2">{t(team.nameKey)}</h4>
                    <p className="text-sm">{t(team.descriptionKey)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Team = () => {
  const { t } = useTranslation();
  const [hoveredTeam, setHoveredTeam] = useState(null);

  return (
    <div className="flex flex-col gap-30 items-center justify-center overflow-hidden px-0 py-59 relative w-full figma-responsive">
      <div className="flex items-center px-212 py-0 relative w-full">
        <p className="font-normal text-25 text-black">
          Candelaria is divided in 7 different teams. Each one of them plays a crucial role in the project.
        </p>
      </div>
      
      <div className="flex gap-52 items-center justify-center relative w-1500">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-gray-100 border border-black h-231 overflow-hidden relative rounded-20 w-170 cursor-pointer team-card"
            onMouseEnter={() => setHoveredTeam(team.id)}
            onMouseLeave={() => setHoveredTeam(null)}
          >
            <div className="absolute left-[13.5px] w-141 h-141 top-9 bg-gray-300 border border-gray-400 rounded flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="80" rx="8" fill="#9CA3AF"/>
                <text x="40" y="45" textAnchor="middle" fill="#374151" fontSize="12" fontWeight="500">
                  {team.name.split(' ')[0]}
                </text>
              </svg>
            </div>
            <div className="absolute flex flex-col font-normal justify-center text-25 text-black text-center top-175 left-1/2 -translate-x-1/2 leading-tight">
              <p className="whitespace-pre-line">{team.nameEs}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-4 border-black flex flex-col font-normal gap-10 items-start justify-center leading-normal px-188 py-30 relative text-25 text-black w-1500">
        {hoveredTeam ? (
          teamFunctions[hoveredTeam].map((func, index) => (
            <p key={index} className="relative text-justify">{func}</p>
          ))
        ) : (
          <>
            <p className="relative">Function # 1 of hovered team.</p>
            <p className="relative">Function # 2 of hovered team.</p>
            <p className="relative">Function # 3 of hovered team.</p>
          </>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center px-[486px] py-0 relative w-full">
        <button className="bg-white border border-black flex flex-col items-center justify-center px-18 py-15 relative rounded-10 figma-hover">
          <p className="font-normal text-25 text-black text-center whitespace-nowrap">
            Meet all the Teams
          </p>
        </button>
      </div>
    </div>
  );
};
