import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Team = () => {
  const { t } = useTranslation();
  const [hoveredTeam, setHoveredTeam] = useState(null);

  const teams = [
    { 
      id: 'committee', 
      name: t('teams.committee.name', 'Committee'),
      functions: [
        t('teams.committee.function1', 'Strategic planning and decision making'),
        t('teams.committee.function2', 'Project oversight and coordination'),
        t('teams.committee.function3', 'Resource allocation and management')
      ]
    },
    { 
      id: 'logistics', 
      name: t('teams.logistics.name', 'Logistics'),
      functions: [
        t('teams.logistics.function1', 'Supply chain management'),
        t('teams.logistics.function2', 'Transportation coordination'),
        t('teams.logistics.function3', 'Event planning and execution')
      ]
    },
    { 
      id: 'hr', 
      name: t('teams.hr.name', 'Human Resources'),
      functions: [
        t('teams.hr.function1', 'Team member recruitment'),
        t('teams.hr.function2', 'Training and development'),
        t('teams.hr.function3', 'Team culture and engagement')
      ]
    },
    { 
      id: 'design', 
      name: t('teams.design.name', 'Design'),
      functions: [
        t('teams.design.function1', 'Vehicle aerodynamics optimization'),
        t('teams.design.function2', 'Structural design and analysis'),
        t('teams.design.function3', 'CAD modeling and prototyping')
      ]
    },
    { 
      id: 'cells', 
      name: t('teams.cells.name', 'Cells'),
      functions: [
        t('teams.cells.function1', 'Solar panel integration'),
        t('teams.cells.function2', 'Energy efficiency optimization'),
        t('teams.cells.function3', 'Battery management systems')
      ]
    },
    { 
      id: 'comtrac', 
      name: t('teams.comtrac.name', 'ComTrac'),
      functions: [
        t('teams.comtrac.function1', 'Communication systems'),
        t('teams.comtrac.function2', 'Telemetry and tracking'),
        t('teams.comtrac.function3', 'Race strategy coordination')
      ]
    },
    { 
      id: 'mechanics', 
      name: t('teams.mechanics.name', 'Mechanics & Fairing'),
      functions: [
        t('teams.mechanics.function1', 'Mechanical systems assembly'),
        t('teams.mechanics.function2', 'Vehicle maintenance and repair'),
        t('teams.mechanics.function3', 'Body construction and finishing')
      ]
    }
  ];

  return (
    <div className="w-full py-16 px-4 bg-white">
      <div className="max-w-full mx-auto px-8">
        {/* Section description */}
        <div className="mb-8">
          <p className="text-black text-lg">
            {t('teams.description', 'Candelaria is divided in 7 different teams. Each one of them plays a crucial role in the project.')}
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