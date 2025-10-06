import { Hero } from '../sections/Hero';
import { Navbar } from '../components/Navbar';
export const Home = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main>
      <Hero />
      {/* Placeholder sections to build out */}
    </main>
  </div>
);