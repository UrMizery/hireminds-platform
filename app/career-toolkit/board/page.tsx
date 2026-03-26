"use client";

export default function CareerToolkitBoardPage() {
  const categories = ["All", "Opportunity", "Tips", "Announcements"];
  const samplePosts = [
    {
      type: "Announcement",
      title: "Resume Review Workshop",
      text: "Join our upcoming workshop for resume tips, formatting help, and ways to improve employer readiness.",
      date: "Posted this week",
    },
    {
      type: "Opportunity",
      title: "Entry-Level Hiring Leads",
      text: "New hiring leads will be shared here for candidates looking for customer service, warehouse, admin, and support roles.",
      date: "Posted recently",
    },
    {
      type: "Tips",
      title: "Research the Company First",
      text: "Before an interview, review the company website, services, mission, and recent updates so your answers feel more informed.",
      date: "Career Tips",
    },
    {
      type: "Announcement",
      title: "Interview Basics Class",
      text: "A short class on how to answer common interview questions, present yourself professionally, and prepare strong examples.",
      date: "Coming soon",
    },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>Career ToolKit</p>
          <h1 style={styles.title}>Blackboard / Billboard</h1>
        <p style={styles.subtitle}>
  A live board for announcements, opportunities, and helpful tips from HireMinds.
  This space can be used to share community updates, hiring leads, workshops,
  and important information for job seekers.
</p>

          <div style={styles.heroButtons}>
            <a href="/career-toolkit" style={styles.linkButton}>
              Back to Career ToolKit
            </a>
          </div>
        </section>

       <section style={styles.filterCard}>
  <p style={styles.kicker}>Board Categories</p>
  <div style={styles.filterRow}>
    {categories.map((category) => (
      <span key={category} style={styles.filterChip}>
        {category}
      </span>
    ))}
  </div>
</section>
        
        <section style={styles.feedWrap}>
          {samplePosts.map((post, index) => (
            <article key={index} style={styles.postCard}>
              <div style={styles.postTop}>
                <span style={styles.tag}>{post.type}</span>
                <span style={styles.date}>{post.date}</span>
              </div>

              <h2 style={styles.postTitle}>{post.title}</h2>
              <p style={styles.postText}>{post.text}</p>

              <div style={styles.actionRow}>
  <button type="button" style={styles.reactionButton}>
    👍 Helpful
  </button>
  <button type="button" style={styles.reactionButton}>
    💬 Ask a Question
  </button>
  <button type="button" style={styles.reactionButton}>
    📌 Save
  </button>
</div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "32px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: {
    maxWidth: "1320px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
  },
  heroCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "38px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  heroButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
  },
 filterCard: {
  background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
  border: "1px solid #262626",
  borderRadius: "24px",
  padding: "24px",
},

filterRow: {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
},

filterChip: {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "#111827",
  border: "1px solid #374151",
  color: "#f3f4f6",
  fontSize: "14px",
  fontWeight: 600,
},
  feedWrap: {
    display: "grid",
    gap: "18px",
  },
  postCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "22px",
  },
  postTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#111827",
    border: "1px solid #374151",
    color: "#f3f4f6",
    fontSize: "12px",
    fontWeight: 700,
  },
  date: {
    color: "#9ca3af",
    fontSize: "13px",
  },
  postTitle: {
    margin: "0 0 10px",
    fontSize: "24px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  postText: {
    margin: "0 0 16px",
    color: "#c8c8c8",
    lineHeight: 1.7,
    fontSize: "15px",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  reactionButton: {
    padding: "10px 14px",
    borderRadius: "14px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 600,
    cursor: "pointer",
  },
};
