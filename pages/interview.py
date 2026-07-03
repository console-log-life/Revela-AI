import streamlit as st
import asyncio
from utils.styles import GLOBAL_CSS, status_dot, badge

st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

def _orch():
    return st.session_state.orchestrator

def _init_state():
    defaults = {
        "session_active": False,
        "current_question": None,
        "trace_log": [],
        "current_session_id": None,
        "q_count": 0,
        "session_scores": [],
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

def render():
    _init_state()

    # ── Sidebar controls ─────────────────────────────────────────
    with st.sidebar:
        st.markdown('<div style="color:#e6edf3;font-size:1.1rem;font-weight:700;padding:.5rem 0;">Candidate Setup</div>', unsafe_allow_html=True)
        candidate_id   = st.text_input("Candidate ID", value="CAND-001", key="iv_cid")
        candidate_name = st.text_input("Name",         value="Alex Rivera", key="iv_name")
        candidate_role = st.selectbox("Role", [
            "Frontend Engineer", "Backend Engineer", "ML Engineer",
            "Full-Stack Engineer", "DevOps Engineer", "Data Engineer"
        ], key="iv_role")

        st.markdown("---")
        st.markdown('<div style="color:#e6edf3;font-size:.85rem;font-weight:600;">Chaos Engineering</div>', unsafe_allow_html=True)
        simulate_fail = st.toggle("Simulate Provider Failure",
            help="Trips the Circuit Breaker to demo resilience / failover.", key="iv_fail")
        _orch().cascade_service.simulate_failure = simulate_fail

        st.markdown("---")
        # Memory context in sidebar
        dashboard = _orch().get_dashboard_context(candidate_id)
        memory = dashboard["memory"]
        st.markdown(f'<div style="color:#8b949e;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;">Sessions Completed</div><div style="color:#e6edf3;font-size:1.4rem;font-weight:700;">{memory["session_count"]}</div>', unsafe_allow_html=True)

        if memory["weak_areas"]:
            st.markdown('<div style="color:#f85149;font-size:.72rem;font-weight:600;text-transform:uppercase;margin-top:.75rem;">Known Weak Areas</div>', unsafe_allow_html=True)
            for area in memory["weak_areas"][:3]:
                st.markdown(f'<div style="background:#2a1b1c;border-left:3px solid #f85149;padding:6px 10px;margin:4px 0;border-radius:4px;font-size:.78rem;color:#ffb4b4;">{area[:90]}{"…" if len(area)>90 else ""}</div>', unsafe_allow_html=True)

        if memory["strengths"]:
            st.markdown('<div style="color:#3fb950;font-size:.72rem;font-weight:600;text-transform:uppercase;margin-top:.75rem;">Confirmed Strengths</div>', unsafe_allow_html=True)
            for s in memory["strengths"][:3]:
                st.markdown(f'<div style="background:#1b2a1e;border-left:3px solid #3fb950;padding:6px 10px;margin:4px 0;border-radius:4px;font-size:.78rem;color:#a6ffb4;">{s[:90]}{"…" if len(s)>90 else ""}</div>', unsafe_allow_html=True)

        if memory["session_count"] == 0 and not memory["weak_areas"]:
            st.info("No previous sessions. First interview!", icon="ℹ️")

    # ── Refresh dashboard for main area ─────────────────────────
    dashboard    = _orch().get_dashboard_context(candidate_id)
    is_open      = _orch().cascade_service.circuit_open
    lat_hist     = _orch().cascade_service.latency_history
    avg_lat      = sum(lat_hist[-5:]) / 5 if lat_hist else 0
    budget_status = dashboard["budget_status"]
    cache_count  = len(_orch().cascade_service.cache)

    # ── Circuit breaker banner ───────────────────────────────────
    if is_open:
        st.markdown("""
<div class="alert-red">
  <h4>CIRCUIT BREAKER OPEN — SAFE MODE ACTIVE</h4>
  <p>Primary provider offline. All requests routed to safety tier. Auto-recovery in ~30s.</p>
</div>""", unsafe_allow_html=True)
        st.markdown("")

    # ── Status bar ───────────────────────────────────────────────
    s1, s2, s3, s4 = st.columns(4)
    dot_color = "red" if is_open else "green"
    b_color = "green" if budget_status == "normal" else "yellow" if budget_status == "low" else "red"
    with s1: st.markdown(f'{status_dot(dot_color)} **Providers:** {"DEGRADED" if is_open else "Healthy"}', unsafe_allow_html=True)
    with s2: st.markdown(f'{status_dot("green" if not is_open else "red")} **Circuit:** {"CLOSED" if not is_open else "OPEN"}', unsafe_allow_html=True)
    with s3: st.markdown(f'{status_dot("green")} **Cache:** {cache_count} entries', unsafe_allow_html=True)
    with s4: st.markdown(f'{status_dot(b_color)} **Budget:** {budget_status.upper()}', unsafe_allow_html=True)

    st.markdown("---")

    # ── Main 2-column layout ─────────────────────────────────────
    left, right = st.columns([2.2, 1], gap="large")

    # ════════════════════════════════ LEFT: Interview ═══════════════
    with left:
        st.markdown("### Live Interview")

        if not st.session_state.session_active:
            # Show start card
            mem_ctx = dashboard["memory"]
            sc = mem_ctx["session_count"]
            if sc > 0:
                st.markdown(f"""
<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:1rem;">
  <div style="color:#8b949e;font-size:.8rem;margin-bottom:.4rem;">RETURNING CANDIDATE</div>
  <div style="color:#e6edf3;font-size:1rem;font-weight:600;">{candidate_name}</div>
  <div style="color:#8b949e;font-size:.82rem;margin-top:.3rem;">{sc} previous session{"s" if sc!=1 else ""} on record. Interview will probe identified weak areas.</div>
</div>""", unsafe_allow_html=True)

            if st.button("Start Interview Session", key="btn_start"):
                with st.spinner("Initializing session & generating first question..."):
                    try:
                        sid = _orch().start_session(candidate_id)
                        st.session_state.current_session_id = sid
                        st.session_state.session_active = True
                        st.session_state.trace_log = []
                        st.session_state.q_count = 0
                        st.session_state.session_scores = []

                        q_data = asyncio.run(_orch().get_next_question({
                            "id": candidate_id, "name": candidate_name, "role": candidate_role
                        }))
                        st.session_state.current_question = q_data
                        st.session_state.q_count = 1

                        audit = q_data.get("audit", {})
                        st.session_state.trace_log.append(
                            f'[{audit.get("trace_id","?")[:8]}] ROUTED -> {q_data.get("model","?")} | diff={q_data.get("difficulty","?")} | policy={audit.get("policy","?")}'
                        )
                        st.rerun()
                    except Exception as e:
                        st.error(f"Failed to start session: {e}")
        else:
            # Show persisted chat history
            hist = _orch().get_session_history(candidate_id, st.session_state.current_session_id)
            for item in hist:
                with st.chat_message("assistant", avatar="🤖"):
                    st.markdown(f'<div style="color:#e6edf3;">{item["question"]}</div>', unsafe_allow_html=True)
                with st.chat_message("user", avatar="👤"):
                    st.markdown(f'<div style="color:#c9d1d9;">{item["response"]}</div>', unsafe_allow_html=True)

            # Current question
            q = st.session_state.current_question
            if q:
                with st.chat_message("assistant", avatar="🤖"):
                    audit = q.get("audit", {})
                    model_used = q.get("model", "unknown")
                    diff = q.get("difficulty", "Medium")
                    diff_color = {"easy": "green", "medium": "blue", "hard": "red"}.get(diff.lower(), "blue")

                    st.markdown(f"""
<div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:8px 12px;margin-bottom:.75rem;font-size:.78rem;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;">
  <span class="badge badge-blue">{model_used}</span>
  <span class="badge badge-{diff_color}">{diff}</span>
  <span style="color:#8b949e;">Q{st.session_state.q_count} &nbsp;|&nbsp; policy: {audit.get("policy","—")}</span>
  {"<span style='color:#d29922;'>⚠ memory context injected</span>" if st.session_state.get("q_count",1) > 1 else ""}
</div>""", unsafe_allow_html=True)
                    st.markdown(f'<div style="color:#e6edf3;font-size:.95rem;line-height:1.7;">{q["question"]}</div>', unsafe_allow_html=True)

            # Chat input
            user_resp = st.chat_input("Type your answer here…")
            if user_resp:
                with st.spinner("Evaluating response via Cascade Pipeline…"):
                    try:
                        ev = asyncio.run(_orch().process_response(
                            candidate_id, q["question"], user_resp
                        ))
                        if ev:
                            st.session_state.session_scores.append(ev.score)
                            e_audit = ev.runtime_metrics.get("audit", {})
                            st.session_state.trace_log.append(
                                f'[{e_audit.get("trace_id","?")[:8]}] EVAL score={ev.score}/10 conf={e_audit.get("confidence",0):.2f}'
                            )

                            next_q = asyncio.run(_orch().get_next_question({
                                "id": candidate_id, "name": candidate_name, "role": candidate_role
                            }))
                            st.session_state.current_question = next_q
                            st.session_state.q_count = st.session_state.q_count + 1

                            n_audit = next_q.get("audit", {})
                            st.session_state.trace_log.append(
                                f'[{n_audit.get("trace_id","?")[:8]}] ROUTED -> {next_q.get("model","?")} | policy={n_audit.get("policy","?")}'
                            )
                            st.rerun()
                        else:
                            st.error("Evaluation engine failed. Attempting recovery…")
                    except Exception as e:
                        st.error(f"System Error: {e}")
                        st.session_state.trace_log.append(f'[ERROR] {str(e)[:100]}')

            # End session button
            st.markdown("")
            with st.container():
                col_end, _ = st.columns([1, 2])
                with col_end:
                    st.markdown('<div class="danger-btn">', unsafe_allow_html=True)
                    if st.button("End Session & Save Memory", key="btn_end"):
                        with st.spinner("Generating trajectory reflection & persisting memory…"):
                            try:
                                reflection = asyncio.run(_orch().end_session({
                                    "id": candidate_id,
                                    "name": candidate_name,
                                    "session_id": st.session_state.current_session_id
                                }))
                                avg_score = sum(st.session_state.session_scores) / len(st.session_state.session_scores) if st.session_state.session_scores else 0
                                st.session_state.trace_log.append("[SESSION] Reflection complete. Hindsight memory updated.")
                                st.session_state.session_active = False
                                st.session_state.current_question = None

                                st.success(f"Session complete! Avg score: {avg_score:.1f}/10")
                                with st.expander("Session Reflection (Hindsight Memory)", expanded=True):
                                    st.markdown(f'<div style="color:#c9d1d9;font-size:.88rem;line-height:1.7;">{reflection}</div>', unsafe_allow_html=True)
                                st.rerun()
                            except Exception as e:
                                st.error(f"Error ending session: {e}")
                    st.markdown('</div>', unsafe_allow_html=True)

        # ── Trace feed ─────────────────────────────────────────
        st.markdown("")
        st.markdown('<div class="section-heading" style="color:#8b949e;font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;font-weight:700;">Live Trace Feed</div>', unsafe_allow_html=True)
        if st.session_state.trace_log:
            lines_html = ""
            for line in reversed(st.session_state.trace_log[-20:]):
                if "ERROR" in line:
                    c = "#f85149"
                elif "EVAL" in line:
                    c = "#d29922"
                elif "ROUTED" in line:
                    c = "#58a6ff"
                elif "SESSION" in line:
                    c = "#3fb950"
                else:
                    c = "#8b949e"
                lines_html += f'<div style="color:{c};">{line}</div>'
            st.markdown(f'<div class="trace-feed">{lines_html}</div>', unsafe_allow_html=True)
        else:
            st.markdown('<div class="trace-feed" style="color:#484f58;">Awaiting session start…</div>', unsafe_allow_html=True)

    # ════════════════════════════════ RIGHT: Inference Lifecycle ═
    with right:
        st.markdown("### Inference Lifecycle")

        logs = dashboard["audit_trail"]
        last = logs[-1] if logs else {}

        last_model   = last.get("model", "—")
        last_policy  = last.get("policy", "—")
        last_conf    = last.get("confidence")
        last_lat     = last.get("latency_ms", 0)
        last_reason  = last.get("rationale", "Awaiting first request")
        last_savings = last.get("savings", 0)

        # Mini metrics
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Latency", f"{last_lat:.0f}ms", delta=None)
        with m2:
            conf_str = f"{last_conf:.2f}" if last_conf is not None else "—"
            st.metric("Confidence", conf_str)

        st.metric("Savings/Call", f"${last_savings:.4f}")

        # Pipeline steps
        st.markdown("")
        st.markdown('<div style="color:#8b949e;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.5rem;">Decision Pipeline</div>', unsafe_allow_html=True)

        steps = [
            ("Query", "Candidate query received"),
            ("Memory", f"Hindsight context: {dashboard['memory']['session_count']} sessions"),
            ("Gate", f"Confidence: {conf_str}"),
            ("Policy", f"Policy: {last_policy}"),
            ("Route", f"Model: {last_model}"),
            ("Exec", f"Latency: {last_lat:.0f}ms"),
            ("Persist", "Memory updated"),
        ]

        step_active = None
        if logs:
            step_active = 5

        for i, (icon, label) in enumerate(steps):
            is_act = (step_active is not None and i <= step_active)
            bg = "#0d1117" if is_act else "#0a0e17"
            border = "#388bfd" if (step_active is not None and i == step_active) else ("#21262d" if is_act else "#161b22")
            txt_col = "#e6edf3" if is_act else "#484f58"
            st.markdown(f"""
<div style="background:{bg};border:1px solid {border};border-radius:6px;padding:6px 10px;margin:2px 0;font-size:.78rem;color:{txt_col};">
  <span style="color:#8b949e;font-size:.65rem;min-width:36px;display:inline-block;">{icon}</span>{label}
</div>""", unsafe_allow_html=True)
            if i < len(steps) - 1:
                st.markdown('<div style="text-align:center;color:#21262d;font-size:.65rem;">↓</div>', unsafe_allow_html=True)

        # Rationale
        st.markdown("")
        st.markdown(f"""
<div style="background:#161b22;border-left:3px solid #388bfd;border-radius:0 6px 6px 0;padding:8px 12px;font-size:.78rem;color:#8b949e;">
  <span style="color:#58a6ff;font-weight:600;">Rationale:</span> {last_reason[:120]}
</div>""", unsafe_allow_html=True)

        # Active policy YAML
        st.markdown("")
        st.markdown('<div style="color:#8b949e;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.35rem;">Active Routing Policy</div>', unsafe_allow_html=True)
        try:
            policy = _orch().cascade_service.policy_engine.get_strategy("normal", 0.5)
            st.code(f"policy: {policy.name}\nmin_confidence: {policy.min_confidence}\nmax_latency_ms: {policy.max_latency_ms}\ncomplexity_gate: {policy.complexity_threshold}", language="yaml")
        except Exception:
            pass

        # Session score sparkline
        if st.session_state.session_scores:
            import pandas as pd
            st.markdown("")
            st.markdown('<div style="color:#8b949e;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:.35rem;">Session Score Trend</div>', unsafe_allow_html=True)
            df = pd.DataFrame({"Score": st.session_state.session_scores})
            st.line_chart(df, height=100, use_container_width=True)


render()
