import { Navbar } from '../components/Navbar';
import { Team } from '../components/Team';

export const TeamPage = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="pt-24">
      <Team />
    </main>
  </div>
);
