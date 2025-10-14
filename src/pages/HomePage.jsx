import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { Mission } from '../components/Mission';
import { Teams } from '../components/Teams';

export const HomePage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main>
      <Hero />
      <Mission />
      <Teams />
    </main>
  </div>
);
