import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { membersAPI } from '../services/api';

export const TeamPage = () => {
  const { t, i18n } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await membersAPI.getAll(i18n.language);
        setMembers(Array.isArray(response.data) ? response.data : []);
      } catch {
        setError(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [i18n.language, t]);

  const availableTeams = useMemo(() => {
    return [...new Set(members.map((member) => member.team_name).filter(Boolean))].sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return members.filter((member) => {
      const matchesTeam = selectedTeam === 'all' || member.team_name === selectedTeam;
      if (!query) return matchesTeam;

      const haystack = `${member.name || ''} ${member.role || ''} ${member.career || ''}`.toLowerCase();
      return matchesTeam && haystack.includes(query);
    });
  }, [members, searchTerm, selectedTeam]);

  const groupedMembers = useMemo(() => {
    return filteredMembers.reduce((acc, member) => {
      const teamName = member.team_name || t('team.unknownTeam');
      if (!acc[teamName]) acc[teamName] = [];
      acc[teamName].push(member);
      return acc;
    }, {});
  }, [filteredMembers, t]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrap">
        <section className="hero-block compact">
          <p className="eyebrow">{t('team.eyebrow')}</p>
          <h1>{t('team.title')}</h1>
          <p>{t('team.subtitle')}</p>
        </section>

        <section className="filter-row">
          <input
            type="text"
            className="filter-input"
            placeholder={t('team.searchPlaceholder')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className="filter-select"
            value={selectedTeam}
            onChange={(event) => setSelectedTeam(event.target.value)}
          >
            <option value="all">{t('team.allTeams')}</option>
            {availableTeams.map((teamName) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </section>

        {loading && <p className="state-msg">{t('common.loading')}</p>}
        {error && <p className="state-msg error">{error}</p>}

        {!loading && !error && filteredMembers.length === 0 && (
          <article className="panel-card">
            <h2>{t('team.emptyTitle')}</h2>
            <p>{t('team.emptyBody')}</p>
          </article>
        )}

        {!loading && !error &&
          Object.entries(groupedMembers).map(([teamName, teamMembers]) => (
            <section className="team-section" key={teamName}>
              <h2>{teamName}</h2>
              <div className="member-grid">
                {teamMembers.map((member) => (
                  <article className="member-card" key={member.id}>
                    <div className="avatar-wrap">
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="avatar" />
                      ) : (
                        <div className="avatar-fallback">{member.name?.charAt(0)}</div>
                      )}
                    </div>
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                    <p className="muted">{member.career}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
      </main>
      <Footer />
    </div>
  );
};
