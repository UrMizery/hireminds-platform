export default function SiteHeader() {
  return (
    <header style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>
      <nav style={{ display: "flex", gap: "20px" }}>
        <a href="/">Home</a>
        <a href="/create-career-passport">Create Your Career Passport</a>
        <a href="/pricing">Upgrade to Premium</a>
        <a href="/sign-in">Sign In</a>
        <a href="/partner/employers">Employers</a>
        <a href="/partner/nonprofits">Nonprofits</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
}
