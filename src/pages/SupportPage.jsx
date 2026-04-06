import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useMemo, useState } from 'react';
import { Sun, Zap, Rocket } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useCart } from '../contexts/CartContext';

const PLAN_ICONS = [Sun, Zap, Rocket];
const MEMBERSHIP_USD_AMOUNTS = [5, 10, 25];

export const SupportPage = () => {
  const { t } = useTranslation();

  const plans = useMemo(() => t('support.plans.items', { returnObjects: true }) || [], [t]);
  const merch = useMemo(() => t('support.merch.items', { returnObjects: true }) || [], [t]);
  const [customAmount, setCustomAmount] = useState('');
  const { toast } = useToast();
  const { addItem } = useCart();

  const onAddPlanToCart = (plan, index) => {
    const amount = MEMBERSHIP_USD_AMOUNTS[index] || 5;
    addItem({
      kind: 'membership',
      productId: `membership-${index + 1}`,
      name: `${plan.name} Membership`,
      price: amount,
      currency: 'usd',
      meta: {
        features: plan.features || [],
      },
    });

    toast({
      title: 'Added to cart',
      description: `${plan.name} membership was added to your cart.`,
    });
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="support-main section-shell">
        <section className="support-hero">
          <div className="support-hero-glow" aria-hidden="true" />
          <div className="support-hero-grid">
            <div className="support-hero-image-wrap">
              <img src={t('about.hero.image')} alt={t('about.support.imageAlt')} />
            </div>
            <div className="support-hero-copy">
              <h1>
                {t('support.hero.titleA')} <span>{t('support.hero.titleB')}</span>
              </h1>
              <p className="page-intro">{t('support.hero.subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="support-plans">
          <div className="support-plans-head">
            <span>{t('support.plans.kicker')}</span>
            <h2>
              Choose a <span>Plan</span>
            </h2>
            <p className="page-intro">{t('support.plans.subtitle')}</p>
          </div>

          <div className="support-plan-grid">
            {plans.map((plan, index) => (
              <article className="support-plan-card" key={`${plan.name}-${index}`}>
                <div className="support-plan-icon-wrap" aria-hidden="true">
                  {(() => {
                    const Icon = PLAN_ICONS[index % PLAN_ICONS.length];
                    return <Icon size={78} strokeWidth={6.6} />;
                  })()}
                </div>
                <h3>{plan.name}</h3>
                <p className="support-plan-price">{plan.price}</p>
                <ul>
                  {plan.features.map((feature, i) => (
                    <li key={`${feature}-${i}`}>{feature}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => onAddPlanToCart(plan, index)}>
                  Subscribe
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
            <button type="button" disabled>
              {t('support.contribution.action')}
            </button>
            <p className="support-contribution-warning">{t('cart.purchasesUnavailable')}</p>
            <p>{t('support.contribution.safe')}</p>
          </div>
        </section>

        <section className="support-merch">
          <div className="support-merch-head">
            <span>{t('support.merch.kicker')}</span>
            <h2>
              Official <span>Gear</span>
            </h2>
          </div>

          <div className="support-merch-grid">
            {merch.map((item, index) => (
              <article key={`${item.name}-${index}`}>
                <Link to={`/product/merch-${index + 1}`} className="support-merch-card-link">
                  <div className="support-merch-image-wrap">
                    <img src={item.image} alt={item.alt} />
                  </div>
                  <div className="support-merch-meta">
                    <div>
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                    </div>
                    <strong>{item.price}</strong>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
