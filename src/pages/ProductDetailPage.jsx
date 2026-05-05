import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PRODUCT_CATALOG } from '../lib/productCatalog';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/use-toast';

const formatMoney = (amount, currency = 'usd') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();

  const product = PRODUCT_CATALOG[productId];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[1] : null);
  const [selectedDesign, setSelectedDesign] = useState(product?.designs ? 0 : null);

  if (!product) {
    return (
      <div className="app-shell">
        <Navbar />
        <main className="product-detail-main section-shell">
          <div className="product-detail-not-found">
            <h1>{t('productDetail.notFound')}</h1>
            <Link to="/support" className="landing-primary-button">
              {t('productDetail.backToShop')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isEs = i18n.language === 'es';
  const name = isEs ? product.nameEs : product.name;
  const material = isEs ? product.materialEs : product.material;

  const handleAddToCart = () => {
    const meta = {
      image: product.images[0],
      description: material,
    };
    if (selectedSize) meta.size = selectedSize;
    if (product.designs && selectedDesign !== null) {
      meta.design = product.designs[selectedDesign].label;
    }

    addItem({
      kind: product.kind,
      productId: product.id,
      name,
      price: product.price,
      currency: product.currency,
      meta,
    });

    toast({
      title: isEs ? 'Añadido al carrito' : 'Added to cart',
      description: isEs ? `${name} fue añadido a tu carrito.` : `${name} was added to your cart.`,
    });
  };

  const displayImages =
    product.designs && selectedDesign !== null
      ? [product.designs[selectedDesign].image, ...product.images.slice(1)]
      : product.images;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="product-detail-main section-shell">
        <button type="button" className="product-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          {isEs ? 'Volver' : 'Back'}
        </button>

        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="product-gallery-main">
              <img src={displayImages[activeImage]} alt={name} className="product-gallery-hero" />
            </div>
            <div className="product-gallery-thumbs">
              {displayImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`product-thumb${i === activeImage ? ' is-active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt={`${name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-info">
            <h1 className="product-info-name">
              {name.split(' ').length > 1 ? (
                <>
                  {name.split(' ').slice(0, -1).join(' ')} <span>{name.split(' ').at(-1)}</span>
                </>
              ) : (
                name
              )}
            </h1>

            <p className="product-info-price">{formatMoney(product.price, product.currency)}</p>

            {/* Design selector for bottles */}
            {product.designs && (
              <div className="product-option-group">
                <span className="product-option-label">{isEs ? 'Diseño' : 'Design'}</span>
                <div className="product-design-options">
                  {product.designs.map((design, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`product-design-btn${i === selectedDesign ? ' is-active' : ''}`}
                      onClick={() => {
                        setSelectedDesign(i);
                        setActiveImage(0);
                      }}
                    >
                      <img src={design.image} alt={isEs ? design.labelEs : design.label} />
                      <span>{isEs ? design.labelEs : design.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector for hoodies */}
            {product.sizes && (
              <div className="product-option-group">
                <span className="product-option-label">{isEs ? 'Talla' : 'Size'}</span>
                <div className="product-size-options">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`product-size-btn${size === selectedSize ? ' is-active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material / description */}
            <div className="product-info-material">
              <span className="product-option-label">{isEs ? 'Material' : 'Material'}</span>
              <p>{material}</p>
            </div>

            <button
              type="button"
              className="landing-primary-button product-add-to-cart"
              onClick={handleAddToCart}
            >
              {isEs ? 'Agregar al carrito' : 'Add to cart'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
