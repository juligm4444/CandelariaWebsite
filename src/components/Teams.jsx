import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { MemberCard } from './MemberCard';

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

export const Teams = () => {
  const { t } = useTranslation();

  // Get all teams from i18n
  const teamsData = t('teams', { returnObjects: true }) || {};

  // Committee swiper logic
  const committeeData = teamsData.committee?.members || {};
  const committeeMembers = Object.values(committeeData).filter(
    (member) => member && member.name && member.name.trim() !== ''
  );
  const committeeScrollRef = useRef(null);

  const committeeScrollLeft = () => {
    if (committeeScrollRef.current) {
      const cardWidth = committeeScrollRef.current.querySelector('div')?.offsetWidth || 0;
      const gap = 16; // 1rem = 16px (gap-4)
      const scrollAmount = cardWidth + gap;
      committeeScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  const committeeScrollRight = () => {
    if (committeeScrollRef.current) {
      const cardWidth = committeeScrollRef.current.querySelector('div')?.offsetWidth || 0;
      const gap = 16; // 1rem = 16px (gap-4)
      const scrollAmount = cardWidth + gap;
      committeeScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="teams" className="py-16 container">
      <h2 className="text-3xl font-bold text-center mb-8">Equipos</h2>

      {/* Committee Swiper */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-center mb-6">Comité</h3>
        <div className="relative max-w-7xl mx-auto">
          <ScrollButton direction="left" onClick={committeeScrollLeft} />
          <ScrollButton direction="right" onClick={committeeScrollRight} />
          <div
            ref={committeeScrollRef}
            className="flex overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-4 py-4 px-12"
            style={{ scrollBehavior: 'smooth' }}
          >
            {committeeMembers.length > 0 ? (
              committeeMembers.map((member, idx) => (
                <div
                  key={`committee-member-${idx}`}
                  className="flex-none w-[calc(33.333%-0.67rem)]"
                >
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

      {/* Other teams */}
      {Object.entries(teamsData)
        .filter(([teamKey]) => teamKey !== 'committee')
        .map(([teamKey, team]) => {
          const membersObj = team.members || {};
          const members = Array.isArray(membersObj)
            ? membersObj
            : Object.values(membersObj).filter(
                (member) => member && member.name && member.name.trim() !== ''
              );
          const teamName = t(
            `teams.${teamKey}.name`,
            teamKey.charAt(0).toUpperCase() + teamKey.slice(1)
          );
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
            <div key={teamKey} className="mb-16">
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
                    members.map((member, idx) => (
                      <div
                        key={`member-${teamKey}-${idx}`}
                        className="flex-none w-[calc(33.333%-0.67rem)]"
                      >
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
