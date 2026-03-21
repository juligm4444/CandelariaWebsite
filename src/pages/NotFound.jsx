import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const NotFound = () => {
	const { t } = useTranslation();

	return (
		<div className="app-shell">
			<Navbar />
			<main className="page-wrap">
				<section className="hero-block compact">
					<p className="eyebrow">404</p>
					<h1>{t('notFound.title')}</h1>
					<p>{t('notFound.body')}</p>
					<div className="hero-actions">
						<Link to="/" className="primary-button">
							{t('notFound.action')}
						</Link>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
};