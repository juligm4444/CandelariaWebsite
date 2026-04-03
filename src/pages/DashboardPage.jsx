import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { membersAPI, publicationsAPI } from '../services/api';
import { resolveMediaUrl } from '../lib/media';
import LeaderIcon from '../assets/icons/leader.svg';
import ColeaderIcon from '../assets/icons/coleader.svg';
import SkullIcon from '../assets/icons/skull.svg';

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '' });
  const [members, setMembers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [formData, setFormData] = useState({
    name_en: '',
    name_es: '',
    abstract_en: '',
    abstract_es: '',
    file: null,
    image: null,
  });

  const language = i18n.language === 'es' ? 'es' : 'en';
  const canManageTeam = !!(user?.is_team_leader || user?.is_coleader);

  const roleLabel = (member) => {
    if (member.is_team_leader) return t('dashboard.roles.leader');
    if (member.is_coleader) return t('dashboard.roles.coleader');
    return t('dashboard.roles.member');
  };

  const sortedTeamMembers = useMemo(() => {
    const copied = [...members];
    return copied.sort((a, b) => {
      const aRank = a.is_team_leader ? 0 : a.is_coleader ? 1 : 2;
      const bRank = b.is_team_leader ? 0 : b.is_coleader ? 1 : 2;
      if (aRank !== bRank) return aRank - bRank;
      const aCreated = a.created_at ? new Date(a.created_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : Number.MAX_SAFE_INTEGER;
      return aCreated - bCreated;
    });
  }, [members]);

  const myPublications = useMemo(() => {
    if (!user) return [];
    return publications.filter((pub) => pub.author_id === user.id);
  }, [publications, user]);

  const teamPublications = useMemo(() => {
    if (!user) return [];
    return publications.filter((pub) => pub.team_id === user.team_id);
  }, [publications, user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const [pubRes, memberRes] = await Promise.all([
        publicationsAPI.getAll(language, user.team_id),
        membersAPI.getAll(language, user.team_id, true),
      ]);
      setPublications(Array.isArray(pubRes.data) ? pubRes.data : []);
      setMembers(Array.isArray(memberRes.data) ? memberRes.data : []);
    } catch {
      setError(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  }, [language, t, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetMessageSoon = () => {
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 2200);
  };

  const confirmAction = (msg) => window.confirm(msg);

  const onCreatePublication = async (event) => {
    event.preventDefault();
    if (!user) return;

    if (!confirmAction(t('dashboard.confirm.createPublication'))) return;

    const payload = new FormData();
    payload.append('name_en', formData.name_en);
    payload.append('name_es', formData.name_es);
    payload.append('abstract_en', formData.abstract_en);
    payload.append('abstract_es', formData.abstract_es);
    payload.append('team', String(user.team_id));
    if (formData.file) payload.append('file', formData.file);
    if (formData.image) payload.append('image', formData.image);

    try {
      await publicationsAPI.create(payload);
      setShowCreateForm(false);
      setFormData({
        name_en: '',
        name_es: '',
        abstract_en: '',
        abstract_es: '',
        file: null,
        image: null,
      });
      setSuccess(t('dashboard.messages.publicationCreated'));
      resetMessageSoon();
      loadData();
    } catch (err) {
      setError(err?.response?.data?.file?.[0] || t('dashboard.messages.publicationCreateError'));
      resetMessageSoon();
    }
  };

  const onDeletePublication = async (slug) => {
    if (!confirmAction(t('dashboard.confirm.deletePublication'))) return;
    try {
      await publicationsAPI.delete(slug);
      setSuccess(t('dashboard.messages.publicationDeleted'));
      resetMessageSoon();
      loadData();
    } catch {
      setError(t('dashboard.messages.publicationDeleteError'));
      resetMessageSoon();
    }
  };

  const onInvite = async () => {
    if (!inviteData.email.trim()) return;
    if (!confirmAction(t('dashboard.confirm.invite'))) return;

    try {
      await membersAPI.invite(inviteData.email.trim(), 'members', true);
      setSuccess(t('dashboard.messages.inviteSuccess'));
      setInviteData({ email: '' });
      setShowInvite(false);
      resetMessageSoon();
    } catch (err) {
      setError(err?.response?.data?.error || t('dashboard.messages.inviteError'));
      resetMessageSoon();
    }
  };

  const onKickMember = async (memberId) => {
    if (!confirmAction(t('dashboard.confirm.kickMember'))) return;
    try {
      await membersAPI.kick(memberId, true);
      setSuccess(t('dashboard.messages.kickSuccess'));
      resetMessageSoon();
      loadData();
    } catch (err) {
      setError(err?.response?.data?.error || t('dashboard.messages.kickError'));
      resetMessageSoon();
    }
  };

  const onTransferLeadership = async (memberId) => {
    if (!confirmAction(t('dashboard.confirm.transferLeadership'))) return;
    try {
      await membersAPI.transferLeadership(memberId, true);
      setSuccess(t('dashboard.messages.transferLeadershipSuccess'));
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      setError(err?.response?.data?.error || t('dashboard.messages.transferLeadershipError'));
      resetMessageSoon();
    }
  };

  const onTransferColeadership = async (memberId) => {
    if (!confirmAction(t('dashboard.confirm.transferColeadership'))) return;
    try {
      await membersAPI.transferColeadership(memberId, true);
      setSuccess(t('dashboard.messages.transferColeadershipSuccess'));
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      setError(err?.response?.data?.error || t('dashboard.messages.transferColeadershipError'));
      resetMessageSoon();
    }
  };

  const onAssignOrRemoveColeader = async (memberId, isColeaderNow) => {
    const verb = isColeaderNow
      ? t('dashboard.confirm.removeColeaderVerb')
      : t('dashboard.confirm.assignColeaderVerb');
    if (!confirmAction(t('dashboard.confirm.confirmColeaderAction', { verb }))) return;

    try {
      await membersAPI.setColeader(memberId, !isColeaderNow, true);
      setSuccess(t('dashboard.messages.coleaderUpdated'));
      resetMessageSoon();
      loadData();
    } catch (err) {
      setError(err?.response?.data?.error || t('dashboard.messages.coleaderUpdateError'));
      resetMessageSoon();
    }
  };

  const canKick = (target) => {
    if (!user || target.id === user.id) return false;
    if (user.is_team_leader) return true;
    if (user.is_coleader) return !target.is_team_leader && !target.is_coleader;
    return false;
  };

  const canShowLeaderTransfer = (target) => !!(user?.is_team_leader && target.is_coleader);
  const canShowColeaderTransfer = (target) =>
    !!(user?.is_coleader && !target.is_team_leader && target.id !== user.id);
  const canShowColeaderSet = (target) =>
    !!(user?.is_team_leader && !target.is_team_leader && target.id !== user.id);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="profile-main">
        <div className="profile-container dashboard-container">
          <div className="profile-header">
            <h1>{t('dashboard.title')}</h1>
            <p>{user?.name}</p>
          </div>

          {loading && <p className="state-msg">{t('common.loading')}</p>}
          {error && <p className="state-msg error">{error}</p>}
          {success && <p className="state-msg">{success}</p>}

          <section className="dashboard-toolbar">
            <button
              type="button"
              className="login-button"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm
                ? t('dashboard.actions.cancel')
                : t('dashboard.actions.createPublication')}
            </button>
          </section>

          {showCreateForm && (
            <form className="dashboard-create-form" onSubmit={onCreatePublication}>
              <div className="register-two-col">
                <div className="form-group">
                  <label>{t('dashboard.form.nameEn')}</label>
                  <input
                    className="form-input"
                    value={formData.name_en}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name_en: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('dashboard.form.nameEs')}</label>
                  <input
                    className="form-input"
                    value={formData.name_es}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name_es: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="register-two-col">
                <div className="form-group">
                  <label>{t('dashboard.form.abstractEn')}</label>
                  <textarea
                    className="form-input"
                    value={formData.abstract_en}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, abstract_en: e.target.value }))
                    }
                    rows={4}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('dashboard.form.abstractEs')}</label>
                  <textarea
                    className="form-input"
                    value={formData.abstract_es}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, abstract_es: e.target.value }))
                    }
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className="register-two-col">
                <div className="form-group">
                  <label>{t('dashboard.form.pdf')}</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="application/pdf"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, file: e.target.files?.[0] || null }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('dashboard.form.image')}</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, image: e.target.files?.[0] || null }))
                    }
                  />
                </div>
              </div>

              <button type="submit" className="login-button">
                {t('dashboard.form.save')}
              </button>
            </form>
          )}

          <section className="dashboard-publications-grid">
            <article className="dashboard-panel">
              <h2>{t('dashboard.myPublications')}</h2>
              {myPublications.length === 0 ? (
                <p className="muted">{t('dashboard.emptyMyPublications')}</p>
              ) : (
                <div className="dashboard-pub-list">
                  {myPublications.map((pub) => (
                    <div key={pub.id} className="dashboard-pub-item">
                      <div>
                        <strong>{pub.name}</strong>
                        <p className="muted">{pub.abstract?.slice(0, 120) || ''}</p>
                      </div>
                      <div className="dashboard-pub-actions">
                        <Link className="publication-read-link" to={`/publications/${pub.slug}`}>
                          {t('dashboard.actions.open')}
                        </Link>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => onDeletePublication(pub.slug)}
                        >
                          {t('dashboard.actions.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="dashboard-panel">
              <h2>{t('dashboard.teamPublications')}</h2>
              {teamPublications.length === 0 ? (
                <p className="muted">{t('dashboard.emptyTeamPublications')}</p>
              ) : (
                <div className="dashboard-pub-list">
                  {teamPublications.map((pub) => (
                    <div key={pub.id} className="dashboard-pub-item">
                      <div>
                        <strong>{pub.name}</strong>
                        <p className="muted">{pub.author_name || t('dashboard.unknownAuthor')}</p>
                      </div>
                      <Link className="publication-read-link" to={`/publications/${pub.slug}`}>
                        {t('dashboard.actions.open')}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          {canManageTeam && (
            <section className="dashboard-panel">
              <h2>{t('dashboard.teamManagement')}</h2>
              <div className="team-management-grid">
                {sortedTeamMembers.map((member) => {
                  const imageUrl = member.image ? resolveMediaUrl(member.image) : null;
                  return (
                    <article key={member.id} className="team-member-bubble">
                      <div className="team-member-bubble-main">
                        <div className="team-member-image-wrap team-member-manage-image-wrap">
                          {imageUrl ? (
                            <img src={imageUrl} alt={member.name} className="team-member-image" />
                          ) : (
                            <div className="team-member-fallback">{member.name?.charAt(0) || 'M'}</div>
                          )}
                        </div>
                        <div className="team-member-body team-member-manage-body">
                          <span>{roleLabel(member)}</span>
                          <h4>{member.name}</h4>
                          <p>{member.career || roleLabel(member)}</p>
                        </div>
                      </div>

                      <div className="team-member-bubble-actions">
                        {canShowLeaderTransfer(member) && (
                          <button
                            type="button"
                            title={t('dashboard.actions.transferLeadershipTitle')}
                            onClick={() => onTransferLeadership(member.id)}
                          >
                            <img
                              src={LeaderIcon}
                              alt={t('dashboard.actions.transferLeadershipTitle')}
                            />
                          </button>
                        )}

                        {canShowColeaderTransfer(member) && (
                          <button
                            type="button"
                            title={t('dashboard.actions.transferColeadershipTitle')}
                            onClick={() => onTransferColeadership(member.id)}
                          >
                            <img
                              src={ColeaderIcon}
                              alt={t('dashboard.actions.transferColeadershipTitle')}
                            />
                          </button>
                        )}

                        {canShowColeaderSet(member) && (
                          <button
                            type="button"
                            title={
                              member.is_coleader
                                ? t('dashboard.actions.removeColeader')
                                : t('dashboard.actions.assignColeader')
                            }
                            onClick={() => onAssignOrRemoveColeader(member.id, member.is_coleader)}
                          >
                            <img
                              src={ColeaderIcon}
                              alt={
                                member.is_coleader
                                  ? t('dashboard.actions.removeColeader')
                                  : t('dashboard.actions.assignColeader')
                              }
                            />
                          </button>
                        )}

                        {canKick(member) && (
                          <button
                            type="button"
                            title={t('dashboard.actions.delete')}
                            onClick={() => onKickMember(member.id)}
                          >
                            <img src={SkullIcon} alt={t('dashboard.actions.delete')} />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}

                <button
                  type="button"
                  className="team-member-bubble invite-bubble"
                  onClick={() => setShowInvite((prev) => !prev)}
                >
                  +
                </button>
              </div>

              {showInvite && (
                <div className="dashboard-invite-box">
                  <input
                    className="form-input"
                    type="email"
                    placeholder="member@uniandes.edu.co"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ email: e.target.value })}
                  />
                  <button type="button" className="login-button" onClick={onInvite}>
                    {t('dashboard.actions.addToWhitelist')}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
