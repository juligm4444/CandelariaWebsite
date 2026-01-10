import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Team = () => {
  const { t } = useTranslation();
  const [hoveredTeam, setHoveredTeam] = useState(null);

  const teams = [
    { 
      id: 'committee', 
      name: 'Committee',
      functions: [
        'Function #1 of hovered team.',
        'Function #2 of hovered team.',
        'Function #3 of hovered team.'
      ]
    },
    { 
      id: 'logistics', 
      name: 'Logistics',
      functions: [
        'Function #1 of hovered team.',
        'Function #2 of hovered team.',
        'Function #3 of hovered team.'
      ]
    },
    { 
      id: 'hr', 
      name: 'Human Resources',
      functions: [
        'Function #1 of hovered team.',
        'Function #2 of hovered team.',
        'Function #3 of hovered team.'
      ]
    },
    { 
      id: 'design', 
      name: 'Design',
      functions: [
        'Function #1 of hovered team.',
        'Function #2 of hovered team.',
        'Function #3 of hovered team.'
      ]
    },
    { 
      id: 'cells', 
      name: 'Cells',
      functions: [
        'Function #1 of hovered team.',
        'Function #2 of hovered team.',
        'Function #3 of hovered team.'
      ]
    },
    { 
      id: 'comtrac', 
      name: 'ComTrac',
      functions: [
        'Function #1 of hovered team.',
        'Function #2 of hovered team.',
        'Function #3 of hovered team.'
      ]
    },
    { 
      id: 'mechanics', 
      name: 'Mechanics & Fairing',
      functions: [
        'Function #1 of hovered team.',
        'Function #2 of hovered team.',
        'Function #3 of hovered team.'
      ]
    }
  ];

  return (
    <div className="w-full py-16 px-4 bg-white">
      <div className="max-w-full mx-auto px-8">
        {/* Section description */}
        <div className="mb-8">
          <p className="text-black text-lg">
            Candelaria is divided in 7 different teams. Each one of them plays a crucial role in the project.
          </p>
        </div>
        
        {/* Teams grid - 7 in one row on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {teams.map((team) => (
            <div
              key={team.id}
              className="relative team-circle cursor-pointer"
              onMouseEnter={() => setHoveredTeam(team.id)}
              onMouseLeave={() => setHoveredTeam(null)}
            >
              {/* Circle with X */}
              <div className="w-24 h-24 mx-auto border-2 border-black rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
                <div className="text-black text-2xl font-bold">✕</div>
              </div>
              
              {/* Team name */}
              <h3 className="text-center text-sm font-medium mt-2 text-black">
                {team.name}
              </h3>
            </div>
          ))}
        </div>
        
        {/* Functions display area */}
        <div className="bg-gray-100 border border-black p-6 rounded min-h-32">
          {hoveredTeam ? (
            <div>
              {teams.find(team => team.id === hoveredTeam)?.functions.map((func, index) => (
                <p key={index} className="text-black mb-2">{func}</p>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Hover over a team to see their functions
            </div>
          )}
        </div>
        
        {/* Meet all the Teams button */}
        <div className="text-center mt-8">
          <button className="bg-white border border-black px-6 py-2 rounded font-medium text-black hover:bg-gray-100 transition-colors">
            Meet all the Teams
          </button>
        </div>
      </div>
    </div>
  );
};
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
              className="relative bg-gray-50 border-2 border-black rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer"
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