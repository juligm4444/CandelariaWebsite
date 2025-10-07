import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { Mission } from '../components/Mission';
export const HomePage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main>
      <Hero />
      <Mission />
      {/* Placeholder sections to build out */}
    </main>
  </div>
);