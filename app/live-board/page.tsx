"use client";

import Link from "next/link";
import { useState } from "react";

type Flyer = {
  id: number;
  tag: string;
  title: string;
  description: string;
  likes: number;
  saved: boolean;
  color: "pink" | "blue" | "yellow" | "purple" | "green";
};

export default function LiveBulletinBoardPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([
    {
      id: 1,
      tag: "MONTHLY Q&A",
      title: "OPEN ROOM",
      description: "Last Tuesday • 6–7 PM • Room opens 5:50 PM",
      likes: 24,
      saved: false,
      color: "pink",
    },
    {
      id: 2,
      tag: "TRAINING PREVIEW",
      title: "CUSTOMER SERVICE DEMO",
      description: "Practice pathways, sharpen skills, and preview assessments.",
      likes: 17,
      saved: false,
      color: "blue",
    },
    {
      id: 3,
      tag: "OPPORTUNITY",
      title: "HIRING EVENT",
      description: "Multiple positions available. Come ready. Let’s talk.",
      likes: 31,
      saved: false,
      color: "green",
    },
    {
      id: 4,
      tag: "COMMUNITY",
      title: "PARTNER SPOTLIGHT",
      description: "Highlighting partners creating visibility and opportunity.",
      likes: 10,
      saved: false,
      color: "yellow",
    },
    {
      id: 5,
      tag: "SKILL BUILDER",
      title: "DIGITAL LITERACY",
      description: "Build online confidence, career readiness, and tool navigation.",
      likes: 12,
      saved: false,
      color: "purple",
    },
  ]);

  const [newFlyer, setNewFlyer] = useState({
    tag: "",
    title: "",
    description: "",
    color: "pink" as Flyer["color"],
  });

  function likeFlyer(id: number) {
    setFlyers((prev) =>
      prev.map((flyer) =>
        flyer.id === id ? { ...flyer, likes: flyer.likes + 1 } : flyer
      )
    );
  }

  function saveFlyer(id: number) {
    setFlyers((prev) =>
      prev.map((flyer) =>
        flyer.id === id ? { ...flyer, saved: true } : flyer
      )
    );
  }

  function removeSavedFlyer(id: number) {
    setFlyers((prev) =>
      prev.map((flyer) =>
        flyer.id === id ? { ...flyer, saved: false } : flyer
      )
    );
  }

  function addFlyer() {
    if (!newFlyer.title.trim()) return;

    setFlyers((prev) => [
      ...prev,
      {
        id: Date.now(),
        tag: newFlyer.tag || "NEW DROP",
        title: newFlyer.title,
        description: newFlyer.description,
        likes: 0,
        saved: false,
        color: newFlyer.color,
      },
    ]);

    setNewFlyer({
      tag: "",
      title: "",
      description: "",
      color: "pink",
    });
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">HireMinds™ Open Room</p>
          <h1>Live Bulletin Board</h1>
          <p className="summary">
            A vibrant interactive wall for mini flyers, updates, opportunities,
            likes, saves, quick reactions, and new drops.
          </p>
        </div>

        <Link href="/profile" className="profileLink">
          ← Back to My Profile
        </Link>
      </section>

      <section className="adminBox">
        <div>
          <p className="eyebrow">Add to the board</p>
          <h2>Drop a New Flyer</h2>
        </div>

        <div className="formGrid">
          <input
            placeholder="Flyer tag"
            value={newFlyer.tag}
            onChange={(e) =>
              setNewFlyer({ ...newFlyer, tag: e.target.value })
            }
          />

          <input
            placeholder="Flyer title"
            value={newFlyer.title}
            onChange={(e) =>
              setNewFlyer({ ...newFlyer, title: e.target.value })
            }
          />

          <select
            value={newFlyer.color}
            onChange={(e) =>
              setNewFlyer({
                ...newFlyer,
                color: e.target.value as Flyer["color"],
              })
            }
          >
            <option value="pink">Pink Glow</option>
            <option value="blue">Blue Glow</option>
            <option value="yellow">Yellow Glow</option>
            <option value="purple">Purple Glow</option>
            <option value="green">Green Glow</option>
          </select>

          <textarea
            placeholder="Flyer details"
            value={newFlyer.description}
            onChange={(e) =>
              setNewFlyer({ ...newFlyer, description: e.target.value })
            }
          />

          <button onClick={addFlyer}>Add Flyer</button>
        </div>
      </section>

      <section className="boardWrap">
        <div className="boardHeader">
          <p>Drag. Like. Save. Explore.</p>
          <span>💋 ⁉️ ‼️</span>
        </div>

        <div className="bulletinWall">
          {flyers.map((flyer) => (
            <article
              key={flyer.id}
              className={`flyerCard ${flyer.color} ${
                flyer.saved ? "isSaved" : ""
              }`}
              draggable
            >
              <div className="pin" />

              {flyer.saved && <div className="savedBadge">Saved ⭐</div>}

              <p className="flyerTag">{flyer.tag}</p>
              <h2>{flyer.title}</h2>
              <p className="flyerDescription">{flyer.description}</p>

              <div className="flyerActions">
                <button onClick={() => likeFlyer(flyer.id)}>
                  👍 {flyer.likes}
                </button>

                {!flyer.saved ? (
                  <button onClick={() => saveFlyer(flyer.id)}>Save ⭐</button>
                ) : (
                  <button onClick={() => removeSavedFlyer(flyer.id)}>
                    🗑 Remove
                  </button>
                )}

                <button className="lipsButton">💋⁉️‼️</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          width: 100%;
          padding: 38px 4vw 60px;
          background:
            radial-gradient(circle at top left, rgba(255, 0, 214, 0.22), transparent 35%),
            radial-gradient(circle at top right, rgba(0, 229, 255, 0.18), transparent 30%),
            linear-gradient(135deg, #12091f, #10131f 45%, #090b13);
          color: white;
        }

        .hero {
          max-width: 1700px;
          margin: 0 auto 26px;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-end;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #60f7ff;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(3rem, 6vw, 6.8rem);
          line-height: 0.92;
          font-weight: 950;
          letter-spacing: -0.06em;
        }

        .summary {
          max-width: 950px;
          margin: 20px 0 0;
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.78);
          font-weight: 700;
        }

        .profileLink {
          color: white;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 13px 18px;
          background: rgba(255, 255, 255, 0.07);
          font-weight: 900;
          white-space: nowrap;
        }

        .adminBox {
          max-width: 1700px;
          margin: 0 auto 28px;
          padding: 24px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 40px rgba(255, 0, 214, 0.12);
        }

        .adminBox h2 {
          margin: 0 0 18px;
          font-size: 2rem;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr 220px;
          gap: 14px;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 18px;
          padding: 15px 16px;
          background: rgba(0, 0, 0, 0.28);
          color: white;
          font-weight: 800;
          outline: none;
        }

        textarea {
          grid-column: span 2;
          min-height: 70px;
          resize: vertical;
        }

        .formGrid button {
          border: none;
          border-radius: 18px;
          padding: 15px 20px;
          background: linear-gradient(135deg, #ff3bd5, #31e7ff);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        .boardWrap {
          max-width: 1700px;
          margin: 0 auto;
          border-radius: 44px;
          padding: 26px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
            rgba(10, 12, 23, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.13);
          box-shadow:
            0 0 90px rgba(157, 73, 255, 0.22),
            inset 0 0 60px rgba(255, 255, 255, 0.04);
        }

        .boardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 12px 22px;
          font-size: 1.4rem;
          font-weight: 950;
          color: #f7ff38;
        }

        .boardHeader p {
          margin: 0;
        }

        .boardHeader span {
          font-size: 1.7rem;
        }

        .bulletinWall {
          min-height: 82vh;
          padding: 58px;
          border-radius: 36px;
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 58px;
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 49, 214, 0.16), transparent 34%),
            radial-gradient(circle at 80% 70%, rgba(49, 231, 255, 0.13), transparent 34%),
            linear-gradient(135deg, rgba(25, 28, 44, 0.96), rgba(13, 17, 32, 0.98));
        }

        .flyerCard {
          min-height: 310px;
          padding: 34px 30px 26px;
          border-radius: 30px;
          position: relative;
          cursor: grab;
          backdrop-filter: blur(14px);
          transition: 0.25s ease;
          border: 2px solid currentColor;
          background: rgba(255, 255, 255, 0.055);
          box-shadow:
            0 0 28px currentColor,
            inset 0 0 28px rgba(255, 255, 255, 0.05);
        }

        .flyerCard:hover {
          transform: scale(1.045) rotate(-1deg);
          z-index: 5;
        }

        .pink {
          color: #ff4fe0;
        }

        .blue {
          color: #35e7ff;
        }

        .yellow {
          color: #ffe946;
        }

        .purple {
          color: #9c7cff;
        }

        .green {
          color: #b7ff2a;
        }

        .pin {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: #ff5dec;
          box-shadow: 0 0 25px #ff5dec;
        }

        .savedBadge {
          position: absolute;
          top: 18px;
          right: 18px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          color: white;
          font-size: 0.75rem;
          font-weight: 950;
        }

        .flyerTag {
          margin: 0 0 14px;
          font-size: 0.82rem;
          font-weight: 950;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .flyerCard h2 {
          margin: 0;
          color: white;
          font-size: 2.25rem;
          line-height: 0.95;
          font-weight: 950;
          letter-spacing: -0.04em;
          text-transform: uppercase;
        }

        .flyerDescription {
          margin: 20px 0 28px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 1rem;
          line-height: 1.5;
          font-weight: 750;
        }

        .flyerActions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 24px;
        }

        .flyerActions button {
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        .lipsButton {
          margin-left: auto;
        }

        .isSaved {
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05)),
            rgba(255, 255, 255, 0.04);
        }

        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          textarea {
            grid-column: span 1;
          }

          .bulletinWall {
            padding: 30px;
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
