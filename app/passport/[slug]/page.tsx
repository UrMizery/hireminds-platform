type PassportPageProps = {
  params: {
    slug: string;
  };
};

export default function PassportPage({ params }: PassportPageProps) {
  return (
    <div>
      <h1>Career Passport</h1>
      <p>Profile: {params.slug}</p>

      <h2>Professional Headline</h2>
      <p>Customer Support | Workforce Ready | Verified Experience</p>

      <h2>Scores</h2>
      <p>Resume Score: 84 / 100</p>
      <p>Interview Readiness Score: 76 / 100</p>

      <h2>Verified Experience</h2>
      <p>ABC Telecom — Customer Service Representative ★</p>

      <h2>Verified Certificates</h2>
      <p>YWCA Tech Lab — Python Certificate ★</p>

      <h2>Video Introduction</h2>
      <p>Optional video will appear here.</p>
    </div>
  );
}
