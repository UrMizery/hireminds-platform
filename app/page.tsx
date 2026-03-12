import SiteHeader from "./components/SiteHeader";
import HeroSection from "./components/HeroSection";
import FeatureCard from "./components/FeatureCard";
import CareerPassportCard from "./components/CareerPassportCard";

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <HeroSection />

      <section style={{ padding: "40px" }}>
        <h2>What We Do</h2>

        <FeatureCard
          title="For Candidates"
          description="Build a Career Passport, improve your resume, and practice interviews."
        />

        <FeatureCard
          title="For Employers"
          description="Discover candidates with Resume Scores and verified experience."
        />

        <FeatureCard
          title="For Nonprofits"
          description="Support participants with training resources and certificate verification."
        />
      </section>

      <CareerPassportCard />
    </div>
  );
}
