import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Sun, Zap, Rocket, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

/*
 * PurchasesPage
 * Displays previous purchases and allows subscription management.
 * Purchase data is loaded from the backend API when available;
 * otherwise a friendly empty state is shown.
 */

const MEMBERSHIP_TIERS = [
  { id: 'membership-1', name: 'Orbital', nameEs: 'Orbital', price: '$5 /month', Icon: Sun },
  { id: 'membership-2', name: 'Kinetic', nameEs: 'Kinetic', price: '$10 /month', Icon: Zap },
  { id: 'membership-3', name: 'Nebula', nameEs: 'Nebula', price: '$25 /month', Icon: Rocket },
];

const formatDate = (dateStr, locale) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

const StatusBadge = ({ status }) => {
  const map = {
    active: { label: 'Active', labelEs: 'Activa', cls: 'status-active' },
    cancelled: { label: 'Cancelled', labelEs: 'Cancelada', cls: 'status-cancelled' },
    pending: { label: 'Pending', labelEs: 'Pendiente', cls: 'status-pending' },
    completed: { label: 'Completed', labelEs: 'Completado', cls: 'status-completed' },
  };
  const info = map[status] || map.pending;
  return <span className={`purchases-status-badge ${info.cls}`}>{info.label}</span>;
};

const SubscriptionCard = ({ sub, onCancel, onChangeTier, isEs }) => {
  const [expanded, setExpanded] = useState(false);
  const [changingTier, setChangingTier] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === sub.tierId) || MEMBERSHIP_TIERS[0];
  const { Icon } = tier;

  return (
    <article className="purchases-sub-card">
      <div
        className="purchases-sub-header"
        onClick={() => setExpanded((p) => !p)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((p) => !p)}
      >
        <div className="purchases-sub-badge">
          <div className="purchases-sub-icon">
            <Icon size={28} strokeWidth={6.6} />
          </div>
          <div>
            <strong>
              {isEs ? tier.nameEs : tier.name} {isEs ? 'Membresía' : 'Membership'}
            </strong>
            <p className="purchases-sub-price">{tier.price}</p>
          </div>
        </div>
        <div className="purchases-sub-status-wrap">
          <StatusBadge status={sub.status} />
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="purchases-sub-details">
          <div className="purchases-detail-row">
            <span>{isEs ? 'Fecha de inicio' : 'Start date'}</span>
            <strong>{formatDate(sub.startDate, isEs ? 'es' : 'en')}</strong>
          </div>
          <div className="purchases-detail-row">
            <span>{isEs ? 'Próximo pago' : 'Next payment'}</span>
            <strong>{formatDate(sub.nextBillingDate, isEs ? 'es' : 'en')}</strong>
          </div>
          <div className="purchases-detail-row">
            <span>{isEs ? 'Referencia' : 'Reference'}</span>
            <strong className="purchases-ref">{sub.reference}</strong>
          </div>

          {sub.status === 'active' && (
            <div className="purchases-sub-actions">
              {!changingTier ? (
                <button
                  type="button"
                  className="purchases-action-btn"
                  onClick={() => setChangingTier(true)}
                >
                  {isEs ? 'Cambiar plan' : 'Change plan'}
                </button>
              ) : (
                <div className="purchases-tier-picker">
                  <p className="purchases-tier-picker-label">
                    {isEs ? 'Selecciona un nuevo plan:' : 'Select a new plan:'}
                  </p>
                  <div className="purchases-tier-options">
                    {MEMBERSHIP_TIERS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`purchases-tier-option${t.id === sub.tierId ? ' is-current' : ''}`}
                        onClick={() => {
                          if (t.id !== sub.tierId) onChangeTier(sub.id, t.id);
                          setChangingTier(false);
                        }}
                        disabled={t.id === sub.tierId}
                      >
                        <t.Icon size={18} strokeWidth={5} />
                        <span>{isEs ? t.nameEs : t.name}</span>
                        <small>{t.price}</small>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setChangingTier(false)}
                  >
                    {isEs ? 'Cancelar' : 'Cancel'}
                  </button>
                </div>
              )}

              {!confirmCancel ? (
                <button
                  type="button"
                  className="purchases-action-btn purchases-action-btn-danger"
                  onClick={() => setConfirmCancel(true)}
                >
                  {isEs ? 'Cancelar suscripción' : 'Cancel subscription'}
                </button>
              ) : (
                <div className="purchases-confirm-cancel">
                  <AlertTriangle size={16} />
                  <span>
                    {isEs
                      ? '¿Estás seguro? Esta acción no se puede deshacer.'
                      : 'Are you sure? This cannot be undone.'}
                  </span>
                  <button
                    type="button"
                    className="purchases-action-btn purchases-action-btn-danger"
                    onClick={() => {
                      onCancel(sub.id);
                      setConfirmCancel(false);
                    }}
                  >
                    {isEs ? 'Sí, cancelar' : 'Yes, cancel'}
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setConfirmCancel(false)}
                  >
                    {isEs ? 'No' : 'No'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export const PurchasesPage = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isEs = i18n.language === 'es';

  // Placeholder purchase / subscription state.
  // In production these would be fetched from the backend API.
  const [purchases] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const hasPurchases = purchases.length > 0;
  const hasSubs = subscriptions.length > 0;

  const handleCancelSubscription = (subId) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'cancelled' } : s))
    );
  };

  const handleChangeTier = (subId, newTierId) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === subId ? { ...s, tierId: newTierId } : s)));
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="purchases-main section-shell">
        <section className="purchases-hero">
          <h1>
            {isEs ? 'Mis' : 'My'} <span>{isEs ? 'Compras' : 'Purchases'}</span>
          </h1>
          <p className="page-intro">
            {isEs
              ? 'Revisa tus compras anteriores y administra tus suscripciones.'
              : 'Review your previous purchases and manage your active subscriptions.'}
          </p>
        </section>

        {!isAuthenticated && (
          <div className="purchases-login-prompt">
            <p>
              {isEs
                ? 'Inicia sesión para ver tus compras.'
                : 'Please sign in to view your purchases.'}
            </p>
            <Link to="/login" className="landing-primary-button">
              {isEs ? 'Iniciar sesión' : 'Sign in'}
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <>
            {/* Subscriptions section */}
            <section className="purchases-section">
              <h2 className="purchases-section-title">
                {isEs ? 'Suscripciones' : 'Subscriptions'}
              </h2>
              {hasSubs ? (
                <div className="purchases-sub-list">
                  {subscriptions.map((sub) => (
                    <SubscriptionCard
                      key={sub.id}
                      sub={sub}
                      onCancel={handleCancelSubscription}
                      onChangeTier={handleChangeTier}
                      isEs={isEs}
                    />
                  ))}
                </div>
              ) : (
                <div className="purchases-empty">
                  <p>
                    {isEs
                      ? 'No tienes suscripciones activas.'
                      : 'You have no active subscriptions.'}
                  </p>
                  <Link to="/support" className="landing-primary-button">
                    {isEs ? 'Ver planes' : 'View plans'}
                  </Link>
                </div>
              )}
            </section>

            {/* Purchase history section */}
            <section className="purchases-section">
              <h2 className="purchases-section-title">
                {isEs ? 'Historial de compras' : 'Purchase history'}
              </h2>
              {hasPurchases ? (
                <div className="purchases-history-list">
                  {purchases.map((purchase) => (
                    <article key={purchase.id} className="purchase-history-card">
                      <div className="purchase-history-row">
                        <span className="purchase-history-name">{purchase.name}</span>
                        <StatusBadge status={purchase.status} />
                      </div>
                      <div className="purchase-history-row purchase-history-meta">
                        <span>{formatDate(purchase.date, isEs ? 'es' : 'en')}</span>
                        <strong>{purchase.total}</strong>
                      </div>
                      {purchase.reference && (
                        <p className="purchases-ref">Ref: {purchase.reference}</p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="purchases-empty">
                  <p>{isEs ? 'No tienes compras anteriores.' : 'You have no past purchases.'}</p>
                  <Link to="/support" className="landing-primary-button">
                    {isEs ? 'Ir a la tienda' : 'Go to shop'}
                  </Link>
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

export default PurchasesPage;
