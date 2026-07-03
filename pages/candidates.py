import streamlit as st
import json
import os
from datetime import datetime
from utils.styles import GLOBAL_CSS, badge, status_dot

st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

def _orch():
    return st.session_state.orchestrator

def _load_memory_raw():
    try:
        with open("data/memory.json", "r") as f:
            return json.load(f)
    except Exception:
        return {}

def render():
    st.markdown("### Candidate Profiles")
    st.markdown('<p style="color:#8b949e;margin-top:-.5rem;">Hindsight persistent memory — long-term candidate trajectories across interview sessions</p>', unsafe_allow_html=True)
    st.markdown("---")

    raw = _load_memory_raw()

    if not raw:
        st.markdown("""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:3rem;text-align:center;">
  <div style="font-size:2.5rem;">🧠</div>
  <div style="color:#484f58;font-size:1.1rem;margin-top:.75rem;">No candidate memory yet.</div>
  <div style="color:#484f58;font-size:.85rem;margin-top:.4rem;">Complete an interview session to see persistent profiles here.</div>
</div>""", unsafe_allow_html=True)
        return

    # ── Candidate selector ───────────────────────────────────────
    cands = list(raw.keys())

    col_sel, col_clear = st.columns([3, 1])
    with col_sel:
        selected = st.selectbox("Select Candidate", cands, key="cand_sel")
    with col_clear:
        st.markdown("<div style='margin-top:1.65rem;'>", unsafe_allow_html=True)
        if st.button("Clear Memory", key="btn_clear_mem"):
            _orch().hindsight_service.clear_memory(selected)
            st.success(f"Memory cleared for {selected}")
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

    if not selected:
        return

    ctx = _orch().hindsight_service.get_candidate_context(selected)
    all_entries = raw.get(selected, [])

    # ── Profile header ───────────────────────────────────────────
    reflections = [e for e in all_entries if e.get("category") == "Reflection"]
    interactions = [e for e in all_entries if e.get("category") == "Interaction"]
    weaknesses   = [e for e in all_entries if e.get("category") == "Weakness"]
    strengths    = [e for e in all_entries if e.get("category") == "Strength"]
    sessions_done = len(reflections)

    # Health score heuristic
    wk_count = len(weaknesses)
    st_count  = len(strengths)
    if wk_count + st_count == 0:
        health = 50
    else:
        health = int((st_count / (wk_count + st_count)) * 100)

    health_col = "green" if health >= 60 else "yellow" if health >= 40 else "red"

    st.markdown(f"""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1.5rem;margin-bottom:1.25rem;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
    <div>
      <div style="color:#e6edf3;font-size:1.3rem;font-weight:700;">{selected}</div>
      <div style="color:#8b949e;font-size:.85rem;margin-top:.2rem;">{len(all_entries)} memory entries across {sessions_done} completed session{"s" if sessions_done != 1 else ""}</div>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <div style="text-align:center;">
        <div style="color:#8b949e;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;">Sessions</div>
        <div style="color:#e6edf3;font-size:1.5rem;font-weight:700;">{sessions_done}</div>
      </div>
      <div style="text-align:center;">
        <div style="color:#8b949e;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;">Interactions</div>
        <div style="color:#e6edf3;font-size:1.5rem;font-weight:700;">{len(interactions)}</div>
      </div>
      <div style="text-align:center;">
        <div style="color:#8b949e;font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;">Health</div>
        <div style="color:{"#3fb950" if health_col=="green" else "#d29922" if health_col=="yellow" else "#f85149"};font-size:1.5rem;font-weight:700;">{health}%</div>
      </div>
    </div>
  </div>
</div>""", unsafe_allow_html=True)

    # Export Dossier
    unique_weak = list(dict.fromkeys(ctx.get("weak_areas", [])))
    unique_str = list(dict.fromkeys(ctx.get("strengths", [])))
    
    dossier_md = f"# Candidate Dossier: {selected}\n\n"
    dossier_md += f"**Health Score:** {health}%\n"
    dossier_md += f"**Sessions Completed:** {sessions_done}\n\n"
    dossier_md += "## 🚀 Confirmed Strengths\n"
    for s in unique_str: dossier_md += f"- {s}\n"
    dossier_md += "\n## ⚠️ Focus Areas (Weaknesses)\n"
    for w in unique_weak: dossier_md += f"- {w}\n"
    dossier_md += "\n## 🧠 Session Reflections\n"
    for r in reflections:
        ts = r.get("timestamp", "")[:16].replace("T", " ")
        full = r.get("full_reflection") or r.get("key_finding", "")
        dossier_md += f"**Session at {ts}:**\n{full}\n\n"
        
    st.download_button("📥 Export Candidate Dossier (Markdown)", data=dossier_md, file_name=f"Dossier_{selected}.md", mime="text/markdown", help="Export the Hindsight-generated candidate profile to share with hiring managers.")


    # ── Tabs ─────────────────────────────────────────────────────
    tab_traj, tab_weak, tab_strong, tab_hist, tab_raw = st.tabs([
        "Trajectory", "Weak Areas", "Strengths", "Interaction Log", "Raw Memory"
    ])

    # ── Trajectory tab ───────────────────────────────────────────
    with tab_traj:
        if not reflections:
            st.info("No session reflections yet. Complete a session to generate trajectory analysis.")
        else:
            for i, r in enumerate(reversed(reflections[-5:]), 1):
                ts = r.get("timestamp", "")[:16].replace("T", " ")
                sid = r.get("session_id", "—")[:8]
                full = r.get("full_reflection") or r.get("key_finding", "")
                with st.expander(f"Session Reflection #{len(reflections)-i+1} — {ts}", expanded=(i == 1)):
                    st.markdown(f'<div style="color:#c9d1d9;font-size:.87rem;line-height:1.75;">{full}</div>', unsafe_allow_html=True)
                    st.caption(f"Session ID: {sid}…")

    # ── Weak areas tab ───────────────────────────────────────────
    with tab_weak:
        unique_weak = list(dict.fromkeys(ctx.get("weak_areas", [])))
        if not unique_weak:
            st.success("No weak areas on record. Strong candidate!")
        else:
            st.markdown(f'<div style="color:#f85149;font-size:.8rem;margin-bottom:.75rem;">{len(unique_weak)} identified area{"s" if len(unique_weak)!=1 else ""} needing improvement</div>', unsafe_allow_html=True)
            for w in unique_weak:
                st.markdown(f"""
<div style="background:#2a1b1c;border:1px solid #da3633;border-left:4px solid #f85149;border-radius:6px;padding:.75rem 1rem;margin:.4rem 0;">
  <div style="color:#ffb4b4;font-size:.87rem;line-height:1.6;">{w}</div>
</div>""", unsafe_allow_html=True)

    # ── Strengths tab ────────────────────────────────────────────
    with tab_strong:
        unique_str = list(dict.fromkeys(ctx.get("strengths", [])))
        if not unique_str:
            st.info("No confirmed strengths yet.")
        else:
            st.markdown(f'<div style="color:#3fb950;font-size:.8rem;margin-bottom:.75rem;">{len(unique_str)} confirmed strength{"s" if len(unique_str)!=1 else ""}</div>', unsafe_allow_html=True)
            for s in unique_str:
                st.markdown(f"""
<div style="background:#1b2a1e;border:1px solid #2ea043;border-left:4px solid #3fb950;border-radius:6px;padding:.75rem 1rem;margin:.4rem 0;">
  <div style="color:#a6ffb4;font-size:.87rem;line-height:1.6;">{s}</div>
</div>""", unsafe_allow_html=True)

    # ── Interaction log tab ──────────────────────────────────────
    with tab_hist:
        ints = [e for e in all_entries if e.get("category") == "Interaction"]
        if not ints:
            st.info("No interaction history yet.")
        else:
            for item in reversed(ints[-20:]):
                ts = item.get("timestamp", "")[:16].replace("T", " ")
                sid_short = item.get("session_id", "—")[:8]
                q = item.get("question", "—")
                r = item.get("response", "—")
                with st.expander(f"{ts} — Session {sid_short}…"):
                    st.markdown(f'<div style="color:#8b949e;font-size:.78rem;font-weight:600;margin-bottom:.3rem;">QUESTION</div>', unsafe_allow_html=True)
                    st.markdown(f'<div style="color:#c9d1d9;font-size:.87rem;line-height:1.6;margin-bottom:.75rem;">{q}</div>', unsafe_allow_html=True)
                    st.markdown(f'<div style="color:#8b949e;font-size:.78rem;font-weight:600;margin-bottom:.3rem;">RESPONSE</div>', unsafe_allow_html=True)
                    st.markdown(f'<div style="color:#8b949e;font-size:.87rem;line-height:1.6;">{r}</div>', unsafe_allow_html=True)

    # ── Raw memory tab ───────────────────────────────────────────
    with tab_raw:
        import pandas as pd
        df = pd.DataFrame(all_entries)
        if not df.empty:
            disp_cols = [c for c in ["timestamp", "category", "session_id", "key_finding"] if c in df.columns]
            st.dataframe(df[disp_cols], use_container_width=True, hide_index=True)
            raw_json = json.dumps(all_entries, indent=2, default=str)
            st.download_button("Download Memory JSON", data=raw_json,
                               file_name=f"{selected}_memory.json", mime="application/json")


render()
