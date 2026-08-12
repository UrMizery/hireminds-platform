"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type FlyerColor =
  | "pink"
  | "blue"
  | "yellow"
  | "purple"
  | "green";

type Flyer = {
  id: string;
  tag: string | null;
  title: string;
  description: string | null;
  details: string | null;
  likes: number;
  color: FlyerColor;
  x: number;
  y: number;
  is_active: boolean;
  created_at?: string | null;
};

const ADMIN_EMAIL = "info@hireminds.app";

const EMPTY_FORM = {
  tag: "",
  title: "",
  description: "",
  details: "",
  color: "blue" as FlyerColor,
};

export default function LiveBulletinBoardPage() {
  const [draggingId, setDraggingId] =
    useState<string | null>(null);

  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  });

  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [savedFlyers, setSavedFlyers] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadBoard();
    loadSavedFlyers();
  }, []);

  async function loadBoard() {
    setLoading(true);
    setMessage("");

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (!authError && authData.user?.email) {
      setIsAdmin(
        authData.user.email.toLowerCase() ===
          ADMIN_EMAIL.toLowerCase()
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("live_bulletin_board")
      .select("*")
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const normalized: Flyer[] =
      (data || []).map((row: any, index: number) => ({
        id: row.id,
        tag: row.tag || "",
        title: row.title || "",
        description: row.description || "",
        details: row.details || "",
        likes: row.likes || 0,
        color: (row.color || "blue") as FlyerColor,
        x:
          typeof row.x === "number"
            ? row.x
            : 60 + (index % 3) * 390,
        y:
          typeof row.y === "number"
            ? row.y
            : 80 + Math.floor(index / 3) * 380,
        is_active: row.is_active !== false,
        created_at: row.created_at || null,
      }));

    setFlyers(normalized);
    setLoading(false);
  }

  function loadSavedFlyers() {
    try {
      const saved = localStorage.getItem(
        "hireminds_saved_bulletins"
      );

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setSavedFlyers(parsed);
      }
    } catch (error) {
      console.error(
        "Unable to load saved bulletins:",
        error
      );
    }
  }

  function persistSavedFlyers(ids: string[]) {
    setSavedFlyers(ids);

    localStorage.setItem(
      "hireminds_saved_bulletins",
      JSON.stringify(ids)
    );
  }

  async function likeFlyer(id: string) {
    const flyer = flyers.find((item) => item.id === id);

    if (!flyer) return;

    const newLikes = flyer.likes + 1;

    setFlyers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              likes: newLikes,
            }
          : item
      )
    );

    const { error } = await supabase
      .from("live_bulletin_board")
      .update({
        likes: newLikes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Like update error:", error);
    }
  }

  function saveFlyer(id: string) {
    if (savedFlyers.includes(id)) return;

    persistSavedFlyers([
      ...savedFlyers,
      id,
    ]);
  }

  function removeSavedFlyer(id: string) {
    persistSavedFlyers(
      savedFlyers.filter((item) => item !== id)
    );
  }

  async function deleteFlyer(id: string) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Delete this bulletin from the board?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("live_bulletin_board")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setFlyers((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setMessage("Bulletin removed.");
  }

  function startDrag(
    e: React.MouseEvent,
    flyer: Flyer
  ) {
    if (!isAdmin) return;

    const target = e.target as HTMLElement;

    if (target.closest("button")) return;

    setDraggingId(flyer.id);

    setOffset({
      x: e.clientX - flyer.x,
      y: e.clientY - flyer.y,
    });
  }

  function moveDrag(e: React.MouseEvent) {
    if (draggingId === null || !isAdmin) return;

    setFlyers((prev) =>
      prev.map((flyer) =>
        flyer.id === draggingId
          ? {
              ...flyer,
              x: e.clientX - offset.x,
              y: e.clientY - offset.y,
            }
          : flyer
      )
    );
  }

  async function stopDrag() {
    if (draggingId === null) return;

    const flyer = flyers.find(
      (item) => item.id === draggingId
    );

    setDraggingId(null);

    if (!flyer || !isAdmin) return;

    const { error } = await supabase
      .from("live_bulletin_board")
      .update({
        x: flyer.x,
        y: flyer.y,
        updated_at: new Date().toISOString(),
      })
      .eq("id", flyer.id);

    if (error) {
      console.error("Position save error:", error);
    }
  }

  function startEdit(flyer: Flyer) {
    if (!isAdmin) return;

    setEditingId(flyer.id);

    setForm({
      tag: flyer.tag || "",
      title: flyer.title || "",
      description: flyer.description || "",
      details: flyer.details || "",
      color: flyer.color,
    });

    setShowAdminPanel(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSaveBulletin() {
    if (!isAdmin) return;

    if (!form.title.trim()) {
      setMessage("Bulletin title is required.");
      return;
    }

    setMessage("");

    if (editingId) {
      const { error } = await supabase
        .from("live_bulletin_board")
        .update({
          tag: form.tag.trim() || null,
          title: form.title.trim(),
          description:
            form.description.trim() || null,
          details:
            form.details.trim() || null,
          color: form.color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Bulletin updated.");
    } else {
      const newPosition = getNextPosition();

      const { error } = await supabase
        .from("live_bulletin_board")
        .insert({
          tag: form.tag.trim() || null,
          title: form.title.trim(),
          description:
            form.description.trim() || null,
          details:
            form.details.trim() || null,
          color: form.color,
          x: newPosition.x,
          y: newPosition.y,
          likes: 0,
          is_active: true,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Bulletin added to the board.");
    }

    setEditingId(null);
    setForm(EMPTY_FORM);

    await loadBoard();
  }

  function getNextPosition() {
    const index = flyers.length;

    const column = index % 3;
    const row = Math.floor(index / 3);

    return {
      x: 50 + column * 420,
      y: 70 + row * 390,
    };
  }

  const savedCount = useMemo(() => {
    return flyers.filter((flyer) =>
      savedFlyers.includes(flyer.id)
    ).length;
  }, [flyers, savedFlyers]);

  return (
    <main
      className="page"
      onMouseMove={moveDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <section className="hero">
        <div>
          <p className="small">
            HireMinds™
          </p>

          <h1>
            LIVE BULLETIN BOARD
          </h1>

          <p className="summary">
            Opportunities, hiring events, career updates,
            announcements, workshops, resources, and things
            happening around HireMinds.
          </p>

          {savedCount > 0 ? (
            <p className="savedSummary">
              ⭐ You have {savedCount} saved bulletin
              {savedCount === 1 ? "" : "s"}.
            </p>
          ) : null}
        </div>

        <div className="heroActions">
          {isAdmin ? (
            <button
              type="button"
              className="adminBtn"
              onClick={() =>
                setShowAdminPanel((prev) => !prev)
              }
            >
              {showAdminPanel
                ? "Close Bulletin Manager"
                : "+ Add Bulletin"}
            </button>
          ) : null}

          <Link
            href="/profile"
            className="backBtn"
          >
            Return To My Profile
          </Link>
        </div>
      </section>

      {message ? (
        <div className="message">
          {message}
        </div>
      ) : null}

      {isAdmin && showAdminPanel ? (
        <section className="adminPanel">
          <div className="adminHeader">
            <div>
              <p className="adminKicker">
                ADMIN
              </p>

              <h2>
                {editingId
                  ? "Edit Bulletin"
                  : "Add Bulletin"}
              </h2>

              <p>
                Add or update board content here. You do not
                need to edit the code.
              </p>
            </div>

            {editingId ? (
              <button
                type="button"
                className="cancelBtn"
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div className="adminGrid">
            <label>
              <span>Tag</span>

              <input
                value={form.tag}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tag: e.target.value,
                  }))
                }
                placeholder="Example: HIRING EVENT"
              />
            </label>

            <label>
              <span>Title</span>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Bulletin title"
              />
            </label>

            <label>
              <span>Color</span>

              <select
                value={form.color}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    color:
                      e.target.value as FlyerColor,
                  }))
                }
              >
                <option value="pink">
                  Pink
                </option>

                <option value="blue">
                  Blue
                </option>

                <option value="yellow">
                  Yellow
                </option>

                <option value="purple">
                  Purple
                </option>

                <option value="green">
                  Green
                </option>
              </select>
            </label>
          </div>

          <label className="fullField">
            <span>Description</span>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Main bulletin message"
            />
          </label>

          <label className="fullField">
            <span>Details</span>

            <textarea
              value={form.details}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  details: e.target.value,
                }))
              }
              placeholder="Date, time, registration instructions, contact information, or other details"
            />
          </label>

          <div className="adminBottom">
            <p>
              New bulletins automatically appear on the board.
              You can drag them afterward to reposition them.
            </p>

            <button
              type="button"
              className="publishBtn"
              onClick={handleSaveBulletin}
            >
              {editingId
                ? "Save Changes"
                : "Add to Board"}
            </button>
          </div>
        </section>
      ) : null}

      {loading ? (
        <div className="loading">
          Loading bulletin board...
        </div>
      ) : (
        <div className="board">
          {flyers.length === 0 ? (
            <div className="emptyBoard">
              <h2>
                Nothing posted yet.
              </h2>

              <p>
                New opportunities and announcements will
                appear here.
              </p>
            </div>
          ) : null}

          {flyers.map((flyer) => {
            const saved =
              savedFlyers.includes(flyer.id);

            return (
              <div
                key={flyer.id}
                onMouseDown={(e) =>
                  startDrag(e, flyer)
                }
                className={`flyer ${flyer.color} ${
                  isAdmin ? "adminFlyer" : ""
                }`}
                style={{
                  left: flyer.x,
                  top: flyer.y,
                }}
              >
                <div className="pin" />

                {saved ? (
                  <div className="saved">
                    ⭐ SAVED
                  </div>
                ) : null}

                {flyer.tag ? (
                  <div className="tag">
                    {flyer.tag}
                  </div>
                ) : null}

                <h2>
                  {flyer.title}
                </h2>

                {flyer.description ? (
                  <p>
                    {flyer.description}
                  </p>
                ) : null}

                {flyer.details ? (
                  <div className="details">
                    {flyer.details}
                  </div>
                ) : null}

                <div className="actions">
                  <button
                    type="button"
                    onClick={() =>
                      likeFlyer(flyer.id)
                    }
                  >
                    👍 {flyer.likes}
                  </button>

                  {!saved ? (
                    <button
                      type="button"
                      onClick={() =>
                        saveFlyer(flyer.id)
                      }
                    >
                      Save ⭐
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        removeSavedFlyer(flyer.id)
                      }
                    >
                      Unsave
                    </button>
                  )}

                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(flyer)
                        }
                      >
                        ✏ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteFlyer(flyer.id)
                        }
                      >
                        🗑 Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;

          padding: 40px;

          background:
            radial-gradient(
              circle at top left,
              #ff34c81e,
              transparent 30%
            ),
            radial-gradient(
              circle at right,
              #31e7ff1f,
              transparent 40%
            ),
            linear-gradient(
              135deg,
              #090b15,
              #15192a,
              #090909
            );

          color: white;

          overflow-x: hidden;
        }

        .hero {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 30px;

          margin-bottom: 30px;
        }

        .small {
          margin: 0 0 8px;

          color: #61e7ff;

          font-weight: 900;

          letter-spacing: 3px;
        }

        h1 {
          font-size: clamp(
            3.3rem,
            7vw,
            72px
          );

          margin: 0;

          line-height: 0.95;
        }

        .summary {
          width: min(
            800px,
            100%
          );

          opacity: 0.8;

          font-size: 18px;

          line-height: 1.65;
        }

        .savedSummary {
          color: #ffe869;

          font-size: 13px;

          font-weight: 800;
        }

        .heroActions {
          display: flex;

          gap: 12px;

          align-items: center;

          flex-wrap: wrap;
        }

        .backBtn,
        .adminBtn {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 14px 22px;

          border-radius: 999px;

          color: white;

          text-decoration: none;

          font-weight: 800;

          height: fit-content;
        }

        .backBtn {
          background: #ffffff12;

          border:
            1px solid #ffffff18;
        }

        .adminBtn {
          border:
            1px solid rgba(
              97,
              231,
              255,
              0.28
            );

          background:
            rgba(
              97,
              231,
              255,
              0.09
            );

          color: #8cefff;

          cursor: pointer;
        }

        .message {
          margin-bottom: 20px;

          padding: 13px 16px;

          border-radius: 14px;

          background:
            rgba(
              97,
              231,
              255,
              0.08
            );

          border:
            1px solid rgba(
              97,
              231,
              255,
              0.17
            );

          color: #bff8ff;

          font-size: 13px;
        }

        /* ADMIN */

        .adminPanel {
          max-width: 1050px;

          margin-bottom: 30px;

          padding: 25px;

          border-radius: 24px;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.09
            );

          box-shadow:
            0 25px 70px rgba(
              0,
              0,
              0,
              0.25
            );

          backdrop-filter:
            blur(16px);
        }

        .adminHeader {
          display: flex;

          justify-content:
            space-between;

          gap: 18px;

          margin-bottom: 20px;
        }

        .adminKicker {
          margin: 0;

          color: #61e7ff;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 0.18em;
        }

        .adminHeader h2 {
          margin: 5px 0 7px;

          font-size: 28px;
        }

        .adminHeader p {
          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.64
            );

          font-size: 13px;
        }

        .cancelBtn {
          height: fit-content;

          padding: 10px 13px;

          border-radius: 12px;

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.12
            );

          background:
            rgba(
              255,
              255,
              255,
              0.04
            );

          color: white;

          cursor: pointer;
        }

        .adminGrid {
          display: grid;

          grid-template-columns:
            1fr 1.7fr 0.8fr;

          gap: 12px;
        }

        .adminGrid label,
        .fullField {
          display: grid;

          gap: 7px;
        }

        .adminGrid span,
        .fullField span {
          color:
            rgba(
              255,
              255,
              255,
              0.67
            );

          font-size: 11px;

          font-weight: 800;
        }

        .adminGrid input,
        .adminGrid select,
        .fullField textarea {
          width: 100%;

          padding: 13px 14px;

          border-radius: 13px;

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.12
            );

          background: #0d101a;

          color: white;

          outline: none;
        }

        .adminGrid select option {
          background: #0d101a;

          color: white;
        }

        .fullField {
          margin-top: 13px;
        }

        .fullField textarea {
          min-height: 85px;

          resize: vertical;
        }

        .adminBottom {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 20px;

          margin-top: 18px;
        }

        .adminBottom p {
          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.54
            );

          font-size: 11px;
        }

        .publishBtn {
          flex-shrink: 0;

          padding: 13px 19px;

          border: none;

          border-radius: 999px;

          background:
            linear-gradient(
              135deg,
              #61e7ff,
              #ffe869
            );

          color: #07101a;

          font-weight: 950;

          cursor: pointer;
        }

        /* BOARD */

        .board {
          position: relative;

          min-height: 1200px;

          border-radius: 45px;

          overflow: hidden;

          background:
            linear-gradient(
              180deg,
              rgba(
                255,
                255,
                255,
                0.03
              ),
              rgba(
                255,
                255,
                255,
                0.01
              )
            );

          box-shadow:
            0 0 100px #b650ff30;
        }

        .loading,
        .emptyBoard {
          padding: 80px;

          text-align: center;

          color:
            rgba(
              255,
              255,
              255,
              0.6
            );
        }

        .emptyBoard h2 {
          color: white;
        }

        .flyer {
          position: absolute;

          width: 360px;

          min-height: 310px;

          padding: 30px;

          border-radius: 35px;

          cursor: default;

          transition: 0.2s;

          background:
            rgba(
              255,
              255,
              255,
              0.05
            );

          backdrop-filter:
            blur(14px);

          border:
            2px solid currentColor;

          box-shadow:
            0 0 35px currentColor;
        }

        .adminFlyer {
          cursor: grab;
        }

        .flyer:hover {
          transform:
            scale(1.03)
            rotate(-1deg);
        }

        .pin {
          position: absolute;

          top: -15px;

          left: 50%;

          transform:
            translateX(-50%);

          width: 30px;

          height: 30px;

          border-radius: 999px;

          background: white;
        }

        .tag {
          font-size: 12px;

          font-weight: 900;

          letter-spacing: 2px;
        }

        .flyer h2 {
          font-size: 32px;

          margin: 10px 0;
        }

        .flyer p {
          line-height: 1.55;

          color:
            rgba(
              255,
              255,
              255,
              0.85
            );
        }

        .details {
          margin-top: 15px;

          display: inline-block;

          padding: 10px;

          border-radius: 14px;

          background: #ffffff14;

          font-size: 12px;

          line-height: 1.45;
        }

        .actions {
          position: absolute;

          bottom: 20px;

          left: 30px;

          right: 30px;

          display: flex;

          gap: 8px;

          flex-wrap: wrap;
        }

        .actions button {
          border: none;

          padding: 9px 12px;

          border-radius: 999px;

          background: #ffffff14;

          color: white;

          font-size: 11px;

          font-weight: 800;

          cursor: pointer;
        }

        .saved {
          position: absolute;

          top: 15px;

          right: 15px;

          background: #fff2;

          padding: 8px 12px;

          border-radius: 999px;

          font-size: 12px;

          font-weight: 900;
        }

        .pink {
          color: #ff47df;
        }

        .blue {
          color: #38dfff;
        }

        .yellow {
          color: #fff053;
        }

        .green {
          color: #8fff5f;
        }

        .purple {
          color: #a984ff;
        }

        @media (
          max-width: 1100px
        ) {
          .page {
            padding: 24px;
          }

          .hero {
            flex-direction: column;
          }

          .adminGrid {
            grid-template-columns:
              1fr;
          }

          .adminBottom {
            align-items:
              stretch;

            flex-direction:
              column;
          }

          .publishBtn {
            width: 100%;
          }

          .board {
            min-height: auto;

            overflow: visible;

            display: grid;

            gap: 20px;

            padding: 25px;
          }

          .flyer {
            position: relative !important;

            left: auto !important;

            top: auto !important;

            width: 100%;

            max-width: none;

            min-height: 300px;
          }
        }
      `}</style>
    </main>
  );
}
