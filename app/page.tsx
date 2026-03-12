import SiteHeader from "../components/SiteHeader";
import HeroSection from "../components/HeroSection";
import FeatureCard from "../components/FeatureCard";
import CareerPassportCard from "../components/CareerPassportCard";

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <HeroSection />

      <section>
        <h2>What We Do</h2>

        <FeatureCard
          title="For Candidates"
          description="Build your resume, practice interviews, and create your Career Passport."
        />

        <FeatureCard
          title="For Employers"
          description="Find better talent with stronger readiness signals and verified experience."
        />

        <FeatureCard
          title="For Nonprofits"
          description="Support participants with tools, resources, and certificate verification."
        />
      </section>

      <CareerPassportCard />
    </div>
  );
}
