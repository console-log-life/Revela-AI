import streamlit as st
from utils.styles import GLOBAL_CSS, badge

st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

def render():
    st.markdown("## About Revela AI")
    st.markdown('<p style="color:#8b949e;margin-top:-.5rem;">Adaptive Hiring Intelligence — Built for the CascadeFlow & Hindsight Hackathon</p>', unsafe_allow_html=True)
    st.markdown("---")

    col1, col2 = st.columns([1.6, 1])

    with col1:
        st.markdown("""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1rem;">
  <div style="color:#e6edf3;font-size:1.25rem;font-weight:700;margin-bottom:.75rem;">The Problem We Solve</div>
  <div style="color:#8b949e;font-size:.9rem;line-height:1.8;">
    Technical interviews are broken in two ways:<br/><br/>
    <b style="color:#c9d1d9;">1. They forget.</b> Every session starts from scratch. An interviewer never knows if a candidate has improved their weak areas across multiple rounds.<br/><br/>
    <b style="color:#c9d1d9;">2. They waste money.</b> Every question runs through the most expensive model available, even for trivial tasks. No routing. No budget control. No audit trail.
  </div>
</div>

<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1rem;">
  <div style="color:#e6edf3;font-size:1.25rem;font-weight:700;margin-bottom:.75rem;">How Revela AI Fixes It</div>

  <div style="margin-bottom:1rem;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:.4rem;">
      <span style="background:#1f4a2a;color:#3fb950;padding:2px 10px;border-radius:20px;font-size:.72rem;font-weight:600;">HINDSIGHT</span>
      <span style="color:#e6edf3;font-weight:600;font-size:.9rem;">Persistent Memory Layer</span>
    </div>
    <div style="color:#8b949e;font-size:.85rem;line-height:1.7;padding-left:1rem;border-left:2px solid #21262d;">
      Every candidate gets a long-term profile. Weak areas, strengths, and trajectory reflections persist across sessions.
      Interview 5 is radically different from Interview 1 — because the system remembers everything.
    </div>
  </div>

  <div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:.4rem;">
      <span style="background:#1f304a;color:#58a6ff;padding:2px 10px;border-radius:20px;font-size:.72rem;font-weight:600;">CASCADEFLOW</span>
      <span style="color:#e6edf3;font-weight:600;font-size:.9rem;">Runtime Intelligence Layer</span>
    </div>
    <div style="color:#8b949e;font-size:.85rem;line-height:1.7;padding-left:1rem;border-left:2px solid #21262d;">
      Every inference decision is tracked, logged, and optimized. Simple questions route to fast cheap models.
      Hard questions escalate to premium models. Budget caps enforced. Full audit trail on every call.
      Circuit breaker for zero-downtime resilience.
    </div>
  </div>
</div>""", unsafe_allow_html=True)

        st.markdown("""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1.5rem 2rem;">
  <div style="color:#e6edf3;font-size:1.25rem;font-weight:700;margin-bottom:1rem;">Architecture</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
    <div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:.75rem 1rem;">
      <div style="color:#58a6ff;font-size:.72rem;font-weight:700;margin-bottom:.3rem;">ORCHESTRATOR</div>
      <div style="color:#8b949e;font-size:.8rem;">Coordinates all agents. Handles session lifecycle, sanitization, budget enforcement.</div>
    </div>
    <div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:.75rem 1rem;">
      <div style="color:#3fb950;font-size:.72rem;font-weight:700;margin-bottom:.3rem;">ROUTER AGENT</div>
      <div style="color:#8b949e;font-size:.8rem;">Gatekeeper LLM scores complexity. Routes easy tasks to cheap models, hard to premium.</div>
    </div>
    <div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:.75rem 1rem;">
      <div style="color:#d29922;font-size:.72rem;font-weight:700;margin-bottom:.3rem;">INTERVIEWER AGENT</div>
      <div style="color:#8b949e;font-size:.8rem;">Adaptive question generation. Probes weak areas in repeat sessions.</div>
    </div>
    <div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:.75rem 1rem;">
      <div style="color:#f85149;font-size:.72rem;font-weight:700;margin-bottom:.3rem;">EVALUATOR AGENT</div>
      <div style="color:#8b949e;font-size:.8rem;">Structured JSON response evaluation with Pydantic validation and score extraction.</div>
    </div>
    <div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:.75rem 1rem;">
      <div style="color:#d2a8ff;font-size:.72rem;font-weight:700;margin-bottom:.3rem;">MEMORY MANAGER</div>
      <div style="color:#8b949e;font-size:.8rem;">End-of-session trajectory reflection. Updates persistent Hindsight memory.</div>
    </div>
    <div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:.75rem 1rem;">
      <div style="color:#79c0ff;font-size:.72rem;font-weight:700;margin-bottom:.3rem;">CASCADE SERVICE</div>
      <div style="color:#8b949e;font-size:.8rem;">TTL cache, circuit breaker, latency tracking, policy engine, multi-stage fallover.</div>
    </div>
  </div>
</div>""", unsafe_allow_html=True)

    with col2:
        st.markdown("""
<div style="background:#1f1b2a;border:1px solid #8957e5;border-radius:12px;padding:1.5rem;">
  <div style="color:#d2a8ff;font-size:1rem;font-weight:700;margin-bottom:1rem;">Key Stats</div>
  <div style="margin-bottom:.75rem;">
    <div style="color:#8b949e;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;">Cost Reduction vs GPT-4o Baseline</div>
    <div style="color:#e6edf3;font-size:1.5rem;font-weight:700;">~63%</div>
  </div>
  <div style="margin-bottom:.75rem;">
    <div style="color:#8b949e;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;">Memory Persistence</div>
    <div style="color:#e6edf3;font-size:1.5rem;font-weight:700;">Cross-Session</div>
  </div>
  <div style="margin-bottom:.75rem;">
    <div style="color:#8b949e;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;">Uptime Guarantee</div>
    <div style="color:#e6edf3;font-size:1.5rem;font-weight:700;">Circuit Breaker</div>
  </div>
  <div>
    <div style="color:#8b949e;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;">Model Tiers</div>
    <div style="color:#e6edf3;font-size:1.5rem;font-weight:700;">3 Tier Routing</div>
  </div>
</div>""", unsafe_allow_html=True)

        st.markdown("")

        st.markdown("""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1.5rem;">
  <div style="color:#e6edf3;font-size:1rem;font-weight:700;margin-bottom:.75rem;">Model Tiers</div>
  <div style="margin-bottom:.6rem;">
    <div style="color:#3fb950;font-size:.72rem;font-weight:700;">EFFICIENCY TIER</div>
    <div style="color:#8b949e;font-size:.8rem;">llama-3.1-8b-instant</div>
    <div style="color:#484f58;font-size:.73rem;">Standard questions, fast routing</div>
  </div>
  <div style="margin-bottom:.6rem;">
    <div style="color:#d29922;font-size:.72rem;font-weight:700;">PERFORMANCE TIER</div>
    <div style="color:#8b949e;font-size:.8rem;">llama-3.3-70b-versatile</div>
    <div style="color:#484f58;font-size:.73rem;">Complex analysis, high-stakes eval</div>
  </div>
  <div>
    <div style="color:#f85149;font-size:.72rem;font-weight:700;">SAFETY TIER</div>
    <div style="color:#8b949e;font-size:.8rem;">gemma2-9b-it</div>
    <div style="color:#484f58;font-size:.73rem;">Circuit breaker fallback, budget mode</div>
  </div>
</div>""", unsafe_allow_html=True)

        st.markdown("")

        st.markdown("""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1.5rem;">
  <div style="color:#e6edf3;font-size:1rem;font-weight:700;margin-bottom:.75rem;">Tech Stack</div>
  <div style="display:flex;flex-wrap:wrap;gap:.4rem;">
""", unsafe_allow_html=True)

        techs = [("Python 3.12", "blue"), ("Streamlit", "blue"), ("Groq", "green"),
                 ("Pydantic v2", "yellow"), ("Loguru", "blue"), ("Tenacity", "yellow"),
                 ("Tiktoken", "blue"), ("Portalocker", "green")]
        badges_html = "".join(f'<span class="badge badge-{c}" style="margin:.2rem;">{t}</span>' for t, c in techs)
        st.markdown(f'<div style="display:flex;flex-wrap:wrap;gap:.4rem;background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1rem;">{badges_html}</div>', unsafe_allow_html=True)

        st.markdown("")
        st.markdown("""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:1.25rem;">
  <div style="color:#e6edf3;font-size:.9rem;font-weight:700;margin-bottom:.5rem;">Links</div>
  <div style="color:#58a6ff;font-size:.82rem;line-height:2;">
    <a href="https://hindsight.vectorize.io/" style="color:#58a6ff;text-decoration:none;">Hindsight Docs</a><br/>
    <a href="https://docs.cascadeflow.ai/" style="color:#58a6ff;text-decoration:none;">CascadeFlow Docs</a><br/>
    <a href="https://github.com/Aashuti-Tech-Trek/Revela-AI" style="color:#58a6ff;text-decoration:none;">GitHub Repository</a>
  </div>
</div>""", unsafe_allow_html=True)


render()
