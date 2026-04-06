import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Zap, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

const formatMoney = (amount, currency = 'usd') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);

const MEMBERSHIP_ICONS = [Sun, Zap, Rocket];

const getMembershipIndex = (productId) => {
  const match = String(productId).match(/membership-(\d+)/);
  return match ? Number(match[1]) - 1 : 0;
};

const CartItemThumbnail = ({ item }) => {
  if (item.kind === 'membership') {
    const iconIndex = getMembershipIndex(item.productId);
    const Icon = MEMBERSHIP_ICONS[iconIndex % MEMBERSHIP_ICONS.length];
    return (
      <div className="cart-item-thumb cart-item-thumb-membership">
        <div className="cart-membership-badge">
          <Icon size={28} strokeWidth={6.6} />
        </div>
      </div>
    );
  }

  if (item.meta?.image) {
    return (
      <div className="cart-item-thumb">
        <img src={item.meta.image} alt={item.name} />
      </div>
    );
  }

  return <div className="cart-item-thumb cart-item-thumb-placeholder" />;
};

export const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const paying = false;
  const { items, subtotal, totalItems, incrementItem, decrementItem, removeItem } = useCart();
  const [checkoutBlockedMessageVisible, setCheckoutBlockedMessageVisible] = useState(false);

  const currency = useMemo(() => items[0]?.currency || 'usd', [items]);

  const onCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: t('cart.loginRequiredTitle'),
        description: t('cart.loginRequiredBody'),
      });
      navigate('/login');
      return;
    }

    if (subtotal <= 0) return;
    setCheckoutBlockedMessageVisible(true);
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="cart-main section-shell">
        <section className="cart-header">
          <h1>
            Your <span>Cart</span>
          </h1>
          <p className="page-intro">Review your selected digital products before checkout.</p>
        </section>

        <section className="cart-layout">
          <div className="cart-items-panel">
            {items.length === 0 ? (
              <div className="cart-empty-state">
                <h2>Your cart is empty</h2>
                <p>Add memberships and gear from the support page to continue.</p>
                <Link to="/support" className="landing-primary-button cart-empty-cta">
                  Go To Support
                </Link>
              </div>
            ) : (
              <div className="cart-items-list">
                {items.map((item) => (
                  <article key={item.key} className="cart-item-card">
                    <div className="cart-item-main">
                      <CartItemThumbnail item={item} />
                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p>{item.kind === 'membership' ? 'Membership' : 'Product'}</p>
                        {item.meta?.size && (
                          <p className="cart-item-meta-tag">Size: {item.meta.size}</p>
                        )}
                        {item.meta?.design && (
                          <p className="cart-item-meta-tag">Design: {item.meta.design}</p>
                        )}
                      </div>
                      <strong className="cart-item-price">
                        {formatMoney(item.price, item.currency)}
                      </strong>
                      {item.kind !== 'membership' && (
                        <div className="cart-qty-control">
                          <button type="button" onClick={() => decrementItem(item.key)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => incrementItem(item.key)}>
                            +
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        className="ghost-button cart-remove-button"
                        onClick={() => removeItem(item.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="cart-summary-panel">
            <h2>Summary</h2>
            <div className="cart-summary-line">
              <span>Different products</span>
              <strong>{items.length}</strong>
            </div>
            <div className="cart-summary-line">
              <span>Total items</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="cart-summary-line cart-summary-total">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal, currency)}</strong>
            </div>

            <button
              type="button"
              className="landing-primary-button cart-checkout-button"
              onClick={onCheckout}
              disabled={items.length === 0 || paying}
            >
              {paying ? t('cart.processing') : t('cart.proceedToCheckout')}
            </button>

            {checkoutBlockedMessageVisible && (
              <p className="cart-checkout-disabled">{t('cart.purchasesUnavailable')}</p>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
