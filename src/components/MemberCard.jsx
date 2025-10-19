import { useState } from 'react';

export const MemberCard = ({ member }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Define colors for sections
  const topSectionColor = 'bg-primary/20';
  const bottomSectionColor = 'bg-card';

  return (
    <div
      className="w-full h-[28rem] [perspective:1000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-lg border border-border shadow-lg flex flex-col">
          {/* Top section: image/initial */}
          <div className={`flex items-center justify-center ${topSectionColor} rounded-t-lg h-1/2`}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-primary bg-white shadow-lg">
              {member?.image_url ? (
                <img
                  src={member.image_url}
                  alt={member?.name || 'Miembro'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                member?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
          </div>
          {/* Bottom section: info */}
          <div
            className={`flex flex-col items-center justify-center ${bottomSectionColor} rounded-b-lg h-1/2 p-6`}
          >
            <h3 className="text-xl font-extrabold text-center mb-2 text-foreground">
              {member?.name || 'Nombre no disponible'}
            </h3>
            <p className="text-sm text-muted-foreground text-center font-bold">
              {member?.role || 'Rol no disponible'}
            </p>
            <p className="text-sm text-center leading-relaxed text-muted-foreground">
              {member?.charge || 'Cargo no disponible'}
            </p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg bg-card border border-border shadow-lg p-6 flex flex-col items-center justify-center text-center`}
        >
          <h3 className="text-xl font-bold mb-4 text-foreground">{member?.name}</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Rol:</span> {member?.role}
            </p>
            <p>
              <span className="font-semibold text-foreground">Cargo:</span> {member?.charge}
            </p>
            <p>
              <span className="font-semibold text-foreground">Carrera:</span> {member?.career}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
