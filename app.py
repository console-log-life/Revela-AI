import nest_asyncio
nest_asyncio.apply()

import streamlit as st
from agents.orchestrator import Orchestrator
from utils.styles import GLOBAL_CSS

st.set_page_config(
    page_title="Revela AI — Adaptive Hiring Intelligence",
    layout="wide",
    page_icon="🎯",
    initial_sidebar_state="expanded",
)

st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

# ── Orchestrator init (once per session) ─────────────────────────
if "orchestrator" not in st.session_state:
    with st.spinner("Initializing Revela AI agents…"):
        try:
            st.session_state.orchestrator = Orchestrator()
        except Exception as e:
            st.error(f"Failed to initialize agents: {e}")
            st.stop()

# ── Sidebar branding (shown on all pages) ────────────────────────
with st.sidebar:
    st.markdown("""
<div style="padding:.25rem 0 1rem;">
  <div style="color:#e6edf3;font-size:1.35rem;font-weight:800;letter-spacing:-.02em;">Revela AI</div>
  <div style="color:#8b949e;font-size:.75rem;margin-top:.1rem;">Adaptive Hiring Intelligence</div>
</div>
<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1.25rem;">
  <span class="badge badge-green">Hindsight</span>
  <span class="badge badge-blue">CascadeFlow</span>
  <span class="badge badge-yellow">Groq</span>
</div>
<div style="border-top:1px solid #21262d;margin-bottom:.75rem;"></div>""", unsafe_allow_html=True)

# ── st.navigation — takes full control of routing ────────────────
interview_page  = st.Page("pages/interview.py",  title="Interview",  icon="🎙️", default=True)
analytics_page  = st.Page("pages/analytics.py",  title="Analytics",  icon="📊")
candidates_page = st.Page("pages/candidates.py", title="Candidates", icon="🧠")
about_page      = st.Page("pages/about.py",      title="About",      icon="ℹ️")

pg = st.navigation(
    {"": [interview_page, analytics_page, candidates_page, about_page]},
    position="sidebar"
)

# ── Live system status in sidebar (below nav) ────────────────────
with st.sidebar:
    st.markdown('<div style="border-top:1px solid #21262d;margin:1rem 0 .75rem;"></div>', unsafe_allow_html=True)
    
    # Hindsight Cloud Sync Toggle (Sponsor Nod)
    st.markdown('<div style="font-size:.75rem; font-weight:600; color:#a1a1aa; margin-bottom:.5rem; text-transform:uppercase; letter-spacing:.05em;">Integrations</div>', unsafe_allow_html=True)
    sync_cloud = st.toggle("Sync to Hindsight Cloud", value=True, help="Simulates syncing local memory to Vectorize Hindsight Cloud Vector DB")
    if sync_cloud:
        st.markdown('<div style="font-size:.7rem; color:#4ade80; margin-top:-0.3rem; margin-bottom:1rem;">☁️ Synced to Vectorize</div>', unsafe_allow_html=True)
    else:
        st.markdown('<div style="font-size:.7rem; color:#71717a; margin-top:-0.3rem; margin-bottom:1rem;">Local memory only</div>', unsafe_allow_html=True)
    
    st.markdown('<div style="border-top:1px solid rgba(255,255,255,0.05);margin:1rem 0 .75rem;"></div>', unsafe_allow_html=True)
    is_open = st.session_state.orchestrator.cascade_service.circuit_open
    dot_col = "#f85149" if is_open else "#3fb950"
    status_text = "Degraded" if is_open else "Healthy"
    st.markdown(f'<div style="font-size:.78rem; margin-bottom:1rem;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:{dot_col};box-shadow:0 0 6px {dot_col};margin-right:6px;"></span>System {status_text}</div>', unsafe_allow_html=True)
    
    # CascadeFlow Star of the Show: Live Audit Trail
    st.markdown('<div style="border-top:1px solid #21262d;margin:1rem 0 .75rem;"></div>', unsafe_allow_html=True)
    st.markdown('<div style="font-size:.75rem; font-weight:600; color:#a1a1aa; margin-bottom:.75rem; text-transform:uppercase; letter-spacing:.05em;">CascadeFlow Runtime Intelligence</div>', unsafe_allow_html=True)
    
    # Get last audit from orchestrator
    last_audit = st.session_state.orchestrator.last_audit if hasattr(st.session_state.orchestrator, "last_audit") else None
    
    if last_audit:
        model_name = last_audit.get("model", "N/A")
        rationale = last_audit.get("rationale", "Standard routing")
        savings = last_audit.get("savings", 0.0)
        
        # Live Savings Ticker
        summary = st.session_state.orchestrator.analytics_service.get_summary()
        total_savings = summary.get("total_savings", 0.0) if summary else 0.0
        
        st.markdown(f"""
        <div class="stat-card" style="padding:.75rem; border:1px solid #30363d; background:rgba(255,255,255,0.02); margin-bottom:.5rem;">
            <div style="font-size:.7rem; color:#8b949e; margin-bottom:.25rem;">Active Tier:</div>
            <div style="font-size:.85rem; font-weight:700; color:#58a6ff;">{model_name}</div>
            <div style="font-size:.65rem; color:#d1d5db; margin-top:.5rem; line-height:1.4;">
                <span style="color:#8b949e; font-weight:600;">Logic:</span> {rationale}
            </div>
        </div>
        <div style="background:rgba(63,185,80,0.1); border:1px solid rgba(63,185,80,0.2); border-radius:6px; padding:.5rem .75rem; text-align:center;">
            <div style="font-size:.65rem; color:#3fb950; text-transform:uppercase; font-weight:700; letter-spacing:.05em;">Total Saved (v/s GPT-4o)</div>
            <div style="font-size:1.1rem; font-weight:800; color:#3fb950;">${total_savings:.4f}</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown('<div style="font-size:.7rem; color:#8b949e; font-style:italic;">Awaiting first inference...</div>', unsafe_allow_html=True)

    # Hindsight Star of the Show: Memory Context
    st.markdown('<div style="border-top:1px solid #21262d;margin:1rem 0 .75rem;"></div>', unsafe_allow_html=True)
    st.markdown('<div style="font-size:.75rem; font-weight:600; color:#a1a1aa; margin-bottom:.75rem; text-transform:uppercase; letter-spacing:.05em;">Hindsight Persistent Context</div>', unsafe_allow_html=True)
    
    candidate_id = st.session_state.get("candidate_id")
    last_trace = getattr(st.session_state.orchestrator, "last_memory_trace", None)
    
    if last_trace:
        weak_recalls = last_trace.get("weak_areas", [])
        st.markdown('<div style="font-size:.7rem; color:#8b949e; margin-bottom:.5rem;">Memory Influence:</div>', unsafe_allow_html=True)
        if weak_recalls:
            st.markdown(f'<div style="font-size:.62rem; color:#f85149; background:rgba(248,81,73,0.05); padding:.3rem .5rem; border-radius:4px; border-left:2px solid #f85149; margin-bottom:.4rem;">🧠 Recalled weakness: "{weak_recalls[0][:60]}..."</div>', unsafe_allow_html=True)
        
        st.markdown(f'<div style="font-size:.62rem; color:#d2a8ff; background:rgba(210,168,255,0.05); padding:.3rem .5rem; border-radius:4px; border-left:2px solid #d2a8ff;">⚡ Strategy: Probing identified gap via {last_audit.get("model","LLM") if last_audit else "LLM"}</div>', unsafe_allow_html=True)
    elif candidate_id:
        st.markdown('<div style="font-size:.7rem; color:#8b949e; font-style:italic;">Analyzing candidate trajectory...</div>', unsafe_allow_html=True)
    else:
        st.markdown('<div style="font-size:.7rem; color:#8b949e; font-style:italic;">Select a candidate to begin.</div>', unsafe_allow_html=True)

pg.run()
