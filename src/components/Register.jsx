import { useTranslation } from 'react-i18next';

export const Register = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="pt-32 pb-24 container text-center">
      <div>
        <div>
          <h2> {t('register.title')} </h2>
          <div>
            <input type="email" required></input>
            <span>{t('register.email')}</span>
          </div>
          <div>
            <input type="password" required></input>
            <span>{t('register.password')}</span>
          </div>
          <div>
            <input type="password" required></input>
            <span>{t('register.confirmation')}</span>
          </div>
          <div>
            <button type="submit">{t('register.button')}</button>
          </div>
          <p>
            [{t('register.question')} <a href="/login">{t('register.login')}</a>]
          </p>
        </div>
      </div>
    </section>
  );
};
