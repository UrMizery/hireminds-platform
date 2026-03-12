type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
