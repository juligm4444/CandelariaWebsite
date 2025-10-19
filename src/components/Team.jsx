import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { MemberCard } from './MemberCard';
import { teamsAPI } from '../services/api';

// ScrollButton component to avoid repetition
const ScrollButton = ({ direction, onClick, className, ...props }) => (
  <button
    onClick={onClick}
    className={`absolute ${
      direction === 'left' ? 'left-0' : 'right-0'
    } top-1/2 transform -translate-y-1/2 z-10 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:opacity-80 transition-opacity ${
      className || ''
    }`}
    aria-label={`Scroll ${direction}`}
    {...props}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
      />
    </svg>
  </button>
);

export const Team = () => {
  const { t, i18n } = useTranslation();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teams from Django backend
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const lang = i18n.language || 'en'; // Get current language (en/es)
        const response = await teamsAPI.getAll(lang);

        // Fetch members for each team
        const teamsWithMembers = await Promise.all(
          response.data.map(async (team) => {
            try {
              const membersResponse = await teamsAPI.getMembers(team.id, lang);
              return {
                ...team,
                members: membersResponse.data,
              };
            } catch (err) {
              console.error(`Error fetching members for team ${team.id}:`, err);
              return {
                ...team,
                members: [],
              };
            }
          })
        );

        setTeams(teamsWithMembers);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [i18n.language]); // Re-fetch when language changes

  if (loading) {
    return (
      <section id="teams" className="py-16 container min-h-[900px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando equipos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="teams" className="py-16 container min-h-[900px]">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <p className="text-sm mt-2">
            Asegúrate de que el servidor Django esté corriendo en http://localhost:8000
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="teams" className="py-16 container min-h-[900px]">
      <h2 className="text-3xl font-bold text-center mb-8">{t('teams.title', 'Equipos')}</h2>

      {teams.map((team) => {
        const members = team.members || [];
        const teamName = i18n.language === 'es' ? team.name_es : team.name_en;
        const scrollRef = useRef(null);

        const scrollLeft = () => {
          if (scrollRef.current) {
            const cardWidth = scrollRef.current.querySelector('div')?.offsetWidth || 0;
            const gap = 16; // 1rem = 16px (gap-4)
            const scrollAmount = cardWidth + gap;
            scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          }
        };
        const scrollRight = () => {
          if (scrollRef.current) {
            const cardWidth = scrollRef.current.querySelector('div')?.offsetWidth || 0;
            const gap = 16; // 1rem = 16px (gap-4)
            const scrollAmount = cardWidth + gap;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        };

        return (
          <div key={team.id} className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-6">{teamName}</h3>
            <div className="relative max-w-7xl mx-auto">
              <ScrollButton direction="left" onClick={scrollLeft} />
              <ScrollButton direction="right" onClick={scrollRight} />
              <div
                ref={scrollRef}
                className="flex overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-4 py-4 px-12"
                style={{ scrollBehavior: 'smooth' }}
              >
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="flex-none w-[calc(33.333%-0.67rem)]">
                      <MemberCard member={member} />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground w-full">
                    No hay miembros disponibles
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};
