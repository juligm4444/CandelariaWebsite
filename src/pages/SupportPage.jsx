import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useMemo, useState } from 'react';
import { Sun, Zap, Rocket } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';

const PLAN_ICONS = [Sun, Zap, Rocket];

export const SupportPage = () => {
  const { t } = useTranslation();

  const plans = useMemo(() => t('support.plans.items', { returnObjects: true }) || [], [t]);
  const merch = useMemo(() => t('support.merch.items', { returnObjects: true }) || [], [t]);
  const [customAmount, setCustomAmount] = useState('');
  const { createPayment, loading: paying } = usePayments();

  const onCreatePayment = async (type, amount) => {
    const result = await createPayment({ type, amount, currency: 'cop' });
    if (!result.success) {
      window.alert(result.error);
      return;
    }

    window.alert('Payment initialized. Continue in the provider checkout flow.');
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="support-main section-shell">
        <section className="support-hero">
          <div className="support-hero-glow" aria-hidden="true" />
          <h1>
            {t('support.hero.titleA')} <span>{t('support.hero.titleB')}</span>
          </h1>
          <p className="page-intro">{t('support.hero.subtitle')}</p>
        </section>

        <section className="support-plans">
          <div className="support-plans-head">
            <div>
              <span>{t('support.plans.kicker')}</span>
              <h2>{t('support.plans.title')}</h2>
            </div>
            <p className="page-intro">{t('support.plans.subtitle')}</p>
          </div>

          <div className="support-plan-grid">
            {plans.map((plan, index) => (
              <article className="support-plan-card" key={`${plan.name}-${index}`}>
                <div className="support-plan-icon-wrap" aria-hidden="true">
                  {(() => {
                    const Icon = PLAN_ICONS[index % PLAN_ICONS.length];
                    return <Icon size={26} strokeWidth={2.2} />;
                  })()}
                </div>
                <h3>{plan.name}</h3>
                <p className="support-plan-price">{plan.price}</p>
                <ul>
                  {plan.features.map((feature, i) => (
                    <li key={`${feature}-${i}`}>{feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={paying}
                  onClick={() => onCreatePayment('subscription', (index + 1) * 50000)}
                >
                  {plan.action}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="support-contribution">
          <div>
            <h2>
              {t('support.contribution.titleA')} <span>{t('support.contribution.titleB')}</span>
            </h2>
            <p>{t('support.contribution.body')}</p>
          </div>

          <div className="support-contribution-card">
            <label htmlFor="custom-amount">{t('support.contribution.inputLabel')}</label>
            <div className="support-input-shell">
              <span>$</span>
              <input
                id="custom-amount"
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder={t('support.contribution.placeholder')}
              />
            </div>
            <button
              type="button"
              disabled={paying}
              onClick={() => onCreatePayment('donation', Number(customAmount || 0))}
            >
              {t('support.contribution.action')}
            </button>
            <p>{t('support.contribution.safe')}</p>
          </div>
        </section>

        <section className="support-merch">
          <div className="support-merch-head">
            <span>{t('support.merch.kicker')}</span>
            <h2>{t('support.merch.title')}</h2>
          </div>

          <div className="support-merch-grid">
            {merch.map((item, index) => (
              <article key={`${item.name}-${index}`}>
                <div className="support-merch-image-wrap">
                  <img src={item.image} alt={item.alt} />
                  <div className="support-merch-overlay">
                    <button
                      type="button"
                      disabled={paying}
                      onClick={() => onCreatePayment('product', 90000)}
                    >
                      {t('support.merch.cta')}
                    </button>
                  </div>
                </div>
                <div className="support-merch-meta">
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <strong>{item.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
