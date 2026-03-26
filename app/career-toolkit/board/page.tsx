"use client";

const categories = ["All", "Announcements", "Opportunities", "Tips", "Questions", "Advice"];

const samplePosts = [
  {
    author: "HireMinds Admin",
    role: "Moderator",
    type: "Announcements",
    title: "Hartford area employers hiring this week",
    text:
      "We’re seeing active openings in healthcare support, warehouse, customer service, and admin. Check back often because new leads will be posted here.",
    time: "Posted today",
    likes: 18,
    comments: [
      {
        author: "Community Member",
        text: "Thank you for sharing this. Please keep posting healthcare leads too.",
      },
      {
        author: "HireMinds Admin",
        text: "Absolutely. We’ll continue posting healthcare and support roles.",
      },
    ],
  },
  {
    author: "Community Member",
    role: "Job Seeker",
    type: "Questions",
    title: "Interview nerves before meeting an employer",
    text:
      "What helps you stay calm before an interview? I know my stuff, but I still get nervous right before I walk in.",
    time: "2 hours ago",
    likes: 9,
    comments: [
      {
        author: "Career Coach",
        text: "Practice your first answer out loud before you go in. Once the first answer is strong, the rest usually flows better.",
      },
      {
        author: "Community Member",
        text: "I also take 3 deep breaths in the car before going inside.",
      },
    ],
  },
  {
    author: "HireMinds Admin",
    role: "Moderator",
    type: "Tips",
    title: "Quick resume tip",
    text:
      "Use stronger action words and list results when possible. Instead of saying 'helped customers,' try 'resolved customer issues and maintained high service standards.'",
    time: "Yesterday",
    likes: 24,
    comments: [
      {
        author: "Community Member",
        text: "This is helpful. Action words really do make resumes sound better.",
      },
    ],
  },
  {
    author: "Community Member",
    role: "Job Seeker",
    type: "Advice",
    title: "Best way to explain a career gap",
    text:
      "I kept my answer short, honest, and focused on what I’m ready to do now. That worked better than overexplaining.",
    time: "Yesterday",
    likes: 15,
    comments: [
      {
        author: "Community Member",
        text: "Yes, short and confident is usually the best approach.",
      },
    ],
  },
  {
    author: "HireMinds Admin",
    role: "Moderator",
    type: "Opportunities",
    title: "Free community workshop",
    text:
      "A local partner is hosting a free job readiness workshop next week. We’ll post the date, location, and signup details here once finalized.",
    time: "This week",
    likes: 12,
    comments: [],
  },
];

export default function CareerToolkitBoardPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>Career ToolKit</p>
          <h1 style={styles.title}>HireMinds Community Feed</h1>
          <p style={styles.subtitle}>
            A shared community space for announcements, opportunities, questions, helpful advice,
            and positive support for job seekers.
          </p>

          <div style={styles.heroButtons}>
            <a href="/career-toolkit" style={styles.linkButton}>
              Back to Career ToolKit
            </a>
          </div>
        </section>

        <section style={styles.composerCard}>
          <div style={styles.composerTop}>
            <div>
              <p style={styles.sectionKicker}>Share With The Community</p>
              <h2 style={styles.sectionTitle}>Post a tip, opportunity, question, or update</h2>
            </div>
            <span style={styles.liveBadge}>Live Feed</span>
          </div>

          <div style={styles.categoryRow}>
            {categories.map((category) => (
              <span key={category} style={styles.categoryChip}>
                {category}
              </span>
            ))}
          </div>

          <div style={styles.composerBox}>
            <div style={styles.composerInputFake}>What would you like to share with the community?</div>

            <div style={styles.composerActions}>
              <button type="button" style={styles.primaryButton}>
                Create Post
              </button>
              <button type="button" style={styles.secondaryButton}>
                Ask a Question
              </button>
            </div>
          </div>

          <p style={styles.helperText}>
            Keep posts helpful, respectful, and positive. This space is meant for community support,
            job leads, advice, and useful updates.
          </p>
        </section>

        <section style={styles.feedHeaderCard}>
          <div style={styles.feedHeaderTop}>
            <div>
              <p style={styles.sectionKicker}>Community Activity</p>
              <h2 style={styles.sectionTitle}>Latest Posts</h2>
            </div>

            <div style={styles.feedFilters}>
              {categories.map((category) => (
                <span key={category} style={styles.filterChip}>
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.feedWrap}>
          {samplePosts.map((post, index) => (
            <article key={`${post.title}-${index}`} style={styles.postCard}>
              <div style={styles.postHeader}>
                <div>
                  <div style={styles.authorRow}>
                    <span style={styles.authorName}>{post.author}</span>
                    <span style={styles.authorRole}>{post.role}</span>
                  </div>
                  <p style={styles.postMeta}>{post.time}</p>
                </div>

                <span style={styles.postType}>{post.type}</span>
              </div>

              <h3 style={styles.postTitle}>{post.title}</h3>
              <p style={styles.postText}>{post.text}</p>

              <div style={styles.postActions}>
                <button type="button" style={styles.reactionButton}>
                  👍 Helpful ({post.likes})
                </button>
                <button type="button" style={styles.reactionButton}>
                  💬 Comment
                </button>
                <button type="button" style={styles.reactionButton}>
                  📌 Save
                </button>
              </div>

              <div style={styles.commentComposer}>
                <div style={styles.commentInputFake}>Write a positive comment, question, or helpful tip...</div>
                <button type="button" style={styles.commentButton}>
                  Post
                </button>
              </div>

              {post.comments.length ? (
                <div style={styles.commentsWrap}>
                  {post.comments.map((comment, commentIndex) => (
                    <div key={`${comment.author}-${commentIndex}`} style={styles.commentCard}>
                      <p style={styles.commentAuthor}>{comment.author}</p>
                      <p style={styles.commentText}>{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
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
  composerCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  feedHeaderCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
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
  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  sectionKicker: {
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
  sectionTitle: {
    margin: 0,
    fontSize: "28px",
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
  composerTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#111827",
    border: "1px solid #374151",
    color: "#f3f4f6",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  categoryRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  categoryChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#101010",
    border: "1px solid #2f2f2f",
    color: "#f3f4f6",
    fontSize: "14px",
    fontWeight: 600,
  },
  composerBox: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "20px",
    padding: "16px",
  },
  composerInputFake: {
    minHeight: "72px",
    borderRadius: "16px",
    border: "1px solid #2f2f2f",
    background: "#0b0b0c",
    color: "#8f8f98",
    padding: "16px",
    fontSize: "15px",
    display: "flex",
    alignItems: "flex-start",
  },
  composerActions: {
    display: "flex",
    gap: "12px",
    marginTop: "14px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
    cursor: "pointer",
  },
  helperText: {
    margin: "14px 0 0",
    color: "#a1a1aa",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  feedHeaderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  feedFilters: {
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
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  authorRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  authorName: {
    color: "#f5f5f5",
    fontSize: "16px",
    fontWeight: 700,
  },
  authorRole: {
    color: "#a1a1aa",
    fontSize: "13px",
  },
  postMeta: {
    margin: "4px 0 0",
    color: "#8f8f98",
    fontSize: "13px",
  },
  postType: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#111827",
    border: "1px solid #374151",
    color: "#f3f4f6",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
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
    lineHeight: 1.75,
    fontSize: "15px",
  },
  postActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "14px",
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
  commentComposer: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
    marginBottom: "14px",
  },
  commentInputFake: {
    borderRadius: "14px",
    border: "1px solid #2f2f2f",
    background: "#0b0b0c",
    color: "#8f8f98",
    padding: "14px 16px",
    fontSize: "14px",
  },
  commentButton: {
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
    cursor: "pointer",
  },
  commentsWrap: {
    display: "grid",
    gap: "10px",
  },
  commentCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "16px",
    padding: "14px",
  },
  commentAuthor: {
    margin: "0 0 6px",
    color: "#f5f5f5",
    fontSize: "14px",
    fontWeight: 700,
  },
  commentText: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};
