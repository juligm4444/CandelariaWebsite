import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { membersAPI, teamsAPI } from '../services/api';
import LogoCommittee from '../assets/images/LOGO-COM.png';
import LogoHR from '../assets/images/LOGO-RRHH.png';
import LogoDesign from '../assets/images/LOGO-DIS.png';
import LogoChassis from '../assets/images/LOGO-CHA.png';
import LogoCells from '../assets/images/LOGO-CEL.png';
import LogoLogistics from '../assets/images/LOGO-LOG.png';
import LogoBatteries from '../assets/images/LOGO-BAT.png';
import IconBehance from '../assets/icons/behance.svg';
import IconPortfolio from '../assets/icons/portfolio.svg';
import IconGithub from '../assets/icons/github.svg';
import IconInstagram from '../assets/icons/instagram.svg';
import IconLinkedin from '../assets/icons/linkedin.svg';
import IconX from '../assets/icons/x.svg';
import MainLogo from '../assets/images/MainLogo.png';
import { resolveMediaUrl } from '../lib/media';

const LOGO_BY_KEY = {
  committee: LogoCommittee,
  hr: LogoHR,
  design: LogoDesign,
  chassis: LogoChassis,
  cells: LogoCells,
  logistics: LogoLogistics,
  batteries: LogoBatteries,
};

const SOCIAL_ICON_BY_PLATFORM = {
  behance: IconBehance,
  portfolio: IconPortfolio,
  github: IconGithub,
  instagram: IconInstagram,
  linkedin: IconLinkedin,
  x: IconX,
};

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const TeamMemberCard = ({ member }) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = member?.image ? resolveMediaUrl(member.image) : null;
  const showFallback = !imageUrl || imageFailed;
  const socialLinks = Array.isArray(member?.social_links) ? member.social_links : [];

  const handleEnter = () => {
    if (window.innerWidth >= 768) setIsFlipped(true);
  };
  const handleLeave = () => {
    if (window.innerWidth >= 768) setIsFlipped(false);
  };
  const handleClick = () => {
    if (window.innerWidth < 768) setIsFlipped((f) => !f);
  };

  return (
    <article
      className="team-member-flip"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
    >
      <div
        className="team-member-flip-inner"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div className="team-member-flip-face team-member-flip-front">
          <div className="team-member-image-wrap">
            {!showFallback ? (
              <img
                src={imageUrl}
                alt={member.name}
                className="team-member-image"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="team-member-fallback">{member?.name?.charAt(0) || 'C'}</div>
            )}
          </div>
          <div className="team-member-body">
            <span>{member.role}</span>
            <h4>{member.name}</h4>
            <p>{member.career}</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="team-member-flip-face team-member-flip-back"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="team-member-body">
            <h4>{member.name}</h4>
            <p>{member.career}</p>
            <span className="team-member-social-label">{t('team.members.socialMedia')}</span>
            {socialLinks.length > 0 && (
              <div className="team-member-social-row">
                {socialLinks.map((link) => {
                  const icon = SOCIAL_ICON_BY_PLATFORM[link.platform];
                  if (!icon) return null;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="team-member-social-link"
                      aria-label={link.platform}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img src={icon} alt={link.platform} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export const TeamPage = () => {
  const { t, i18n } = useTranslation();
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [memberStart, setMemberStart] = useState(0);
  const [membersPerView, setMembersPerView] = useState(3);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 760) {
        setMembersPerView(1);
      } else if (window.innerWidth < 1080) {
        setMembersPerView(2);
      } else {
        setMembersPerView(3);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [membersResponse, teamsResponse] = await Promise.all([
          membersAPI.getAll(i18n.language),
          teamsAPI.getAll(i18n.language),
        ]);

        setMembers(Array.isArray(membersResponse.data) ? membersResponse.data : []);
        setTeams(Array.isArray(teamsResponse.data) ? teamsResponse.data : []);
      } catch {
        setError(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [i18n.language, t]);

  const teamCatalog = useMemo(() => t('team.catalog', { returnObjects: true }) || [], [t]);

  const catalogMap = useMemo(() => {
    const map = new Map();
    teamCatalog.forEach((item, index) => {
      map.set(item.key, { ...item, order: index });
    });
    return map;
  }, [teamCatalog]);

  const resolvedTeams = useMemo(() => {
    if (teams.length === 0) {
      return teamCatalog.map((item, index) => ({
        id: item.key,
        key: item.key,
        order: index,
        name: item.name,
        summary: item.summary,
        functions: item.functions || [],
        aliases: item.aliases || [],
        logo: LOGO_BY_KEY[item.key] || MainLogo,
      }));
    }

    const mapped = teams.map((team) => {
      const localizedName = i18n.language === 'es' ? team.name_es : team.name_en;
      const found = teamCatalog.find((catalogItem) => {
        return (catalogItem.aliases || []).some((alias) =>
          normalize(localizedName).includes(normalize(alias))
        );
      });

      const key = found?.key || normalize(localizedName).replace(/\s+/g, '-');
      const defaults = catalogMap.get(key);

      return {
        id: team.id,
        key,
        order: defaults?.order ?? 999,
        name: localizedName || team.name_es || team.name_en || t('team.unknownTeam'),
        summary: found?.summary || t('team.fallbackSummary'),
        functions: found?.functions || [],
        aliases: found?.aliases || [],
        logo: LOGO_BY_KEY[key] || MainLogo,
      };
    });

    return mapped.sort((a, b) => {
      if (a.key === 'committee') return -1;
      if (b.key === 'committee') return 1;
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });
  }, [catalogMap, i18n.language, t, teamCatalog, teams]);

  useEffect(() => {
    if (resolvedTeams.length === 0) return;

    const preferred = resolvedTeams.find((team) => team.key === 'committee') || resolvedTeams[0];

    setSelectedTeamId((current) => {
      const stillExists = resolvedTeams.some((team) => String(team.id) === String(current));
      return stillExists ? current : preferred.id;
    });
  }, [resolvedTeams]);

  const selectedTeam = useMemo(() => {
    return (
      resolvedTeams.find((team) => String(team.id) === String(selectedTeamId)) ||
      resolvedTeams[0] ||
      null
    );
  }, [resolvedTeams, selectedTeamId]);

  const teamCards = useMemo(() => {
    if (!selectedTeam) return [];
    return resolvedTeams.filter((team) => String(team.id) !== String(selectedTeam.id)).slice(0, 6);
  }, [resolvedTeams, selectedTeam]);

  const selectedMembers = useMemo(() => {
    if (!selectedTeam) return [];

    const filtered = members.filter((member) => {
      const byId = String(member.team_id || member.team || '') === String(selectedTeam.id);
      const byName = normalize(member.team_name).includes(normalize(selectedTeam.name));
      const byAlias = (selectedTeam.aliases || []).some((alias) =>
        normalize(member.team_name).includes(normalize(alias))
      );

      return byId || byName || byAlias;
    });

    return filtered.sort((a, b) => {
      const aRank = a.is_team_leader ? 0 : a.is_coleader ? 1 : 2;
      const bRank = b.is_team_leader ? 0 : b.is_coleader ? 1 : 2;
      if (aRank !== bRank) return aRank - bRank;

      const aCreated = a.created_at ? new Date(a.created_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : Number.MAX_SAFE_INTEGER;
      if (aCreated !== bCreated) return aCreated - bCreated;

      return (a.id || 0) - (b.id || 0);
    });
  }, [members, selectedTeam]);

  useEffect(() => {
    setMemberStart(0);
  }, [selectedTeamId]);

  const visibleMembers = useMemo(() => {
    const total = selectedMembers.length;
    if (total === 0) return [];

    const count = Math.min(membersPerView, total);
    return Array.from({ length: count }, (_, index) => {
      const memberIndex = (memberStart + index) % total;
      return selectedMembers[memberIndex];
    });
  }, [memberStart, membersPerView, selectedMembers]);

  const moveCarousel = (direction) => {
    if (selectedMembers.length === 0) return;

    setMemberStart((current) => {
      if (direction === 'left') {
        return (current - 1 + selectedMembers.length) % selectedMembers.length;
      }

      return (current + 1) % selectedMembers.length;
    });
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="team-main section-shell">
        <section className="team-hero">
          <h1>
            {t('team.hero.titleA')} <span className="team-title-glow">{t('team.hero.titleB')}</span>
          </h1>
          <p className="page-intro">{t('team.hero.subtitle')}</p>
        </section>

        {loading && <p className="state-msg">{t('common.loading')}</p>}
        {error && <p className="state-msg error">{error}</p>}

        {!loading && !error && selectedTeam && (
          <>
            <section className="team-selected-panel">
              <article className="team-selected-card">
                <div className="team-selected-layout">
                  <div className="team-selected-content">
                    <div className="team-selected-header">
                      <img
                        src={selectedTeam.logo}
                        alt={selectedTeam.name}
                        className="team-selected-logo"
                      />
                      <h2>{selectedTeam.name}</h2>
                    </div>
                    <p className="team-selected-summary">{selectedTeam.summary}</p>
                    <div className="team-selected-functions">
                      {selectedTeam.functions.map((item, index) => (
                        <div key={`${item}-${index}`} className="team-function-item">
                          <span className="team-function-badge">0{index + 1}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="team-selected-photo-placeholder"
                    aria-label={t('team.photoPlaceholder')}
                  >
                    <span>{t('team.photoPlaceholder')}</span>
                  </div>
                </div>
              </article>
            </section>

            <section className="team-selection-grid">
              {teamCards.map((team) => (
                <button
                  key={`${team.id}-${team.name}`}
                  type="button"
                  className="team-compact-card"
                  onClick={() => setSelectedTeamId(team.id)}
                >
                  <img src={team.logo} alt={team.name} className="team-compact-logo" />
                  <div className="team-compact-info">
                    <h3>{team.name}</h3>
                    <p>{team.summary}</p>
                  </div>
                </button>
              ))}
            </section>

            <section className="team-members-section">
              <h2>{t('team.membersTitle')}</h2>

              {selectedMembers.length === 0 ? (
                <article className="panel-card">
                  <h2>{t('team.emptyTitle')}</h2>
                  <p>{t('team.emptyBody')}</p>
                </article>
              ) : (
                <div className="team-members-shell">
                  <button
                    className="team-carousel-arrow"
                    onClick={() => moveCarousel('left')}
                    aria-label={t('team.carousel.prev')}
                    type="button"
                  >
                    {t('team.carousel.prevShort')}
                  </button>

                  <div className="team-members-carousel">
                    {visibleMembers.map((member) => (
                      <TeamMemberCard key={`${member.id}-${selectedTeam.id}`} member={member} />
                    ))}
                  </div>

                  <button
                    className="team-carousel-arrow"
                    onClick={() => moveCarousel('right')}
                    aria-label={t('team.carousel.next')}
                    type="button"
                  >
                    {t('team.carousel.nextShort')}
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};
