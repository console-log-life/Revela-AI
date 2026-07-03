import streamlit as st
import pandas as pd
import json
import os
from utils.styles import GLOBAL_CSS, status_dot, badge

st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

def _orch():
    return st.session_state.orchestrator

def _load_all_logs():
    try:
        path = "logs/analytics.json"
        if not os.path.exists(path):
            return []
        with open(path, "r") as f:
            data = json.load(f)
        # Also include in-memory buffer
        data.extend(_orch().analytics_service.buffer)
        return data
    except Exception:
        return []

def render():
    st.markdown("### Runtime Intelligence Dashboard")
    st.markdown('<p style="color:#8b949e;margin-top:-.5rem;">CascadeFlow cost tracking, model routing decisions, and latency analytics</p>', unsafe_allow_html=True)
    st.markdown("---")

    logs = _load_all_logs()

    # ── Top-level metrics ────────────────────────────────────────
    is_open    = _orch().cascade_service.circuit_open
    lat_hist   = _orch().cascade_service.latency_history
    avg_lat    = sum(lat_hist[-10:]) / len(lat_hist[-10:]) if lat_hist else 0
    cache_hits = len(_orch().cascade_service.cache)
    sim_fail   = _orch().cascade_service.simulate_failure

    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        dot = "red" if is_open else "green"
        st.markdown(f'{status_dot(dot)} **Circuit Breaker**', unsafe_allow_html=True)
        st.markdown(f'<div style="color:{"#f85149" if is_open else "#3fb950"};font-size:1.3rem;font-weight:700;">{"OPEN" if is_open else "CLOSED"}</div>', unsafe_allow_html=True)
    with c2:
        st.metric("Avg Latency (live)", f"{avg_lat:.0f}ms")
    with c3:
        st.metric("Cache Entries", cache_hits)
    with c4:
        st.metric("Total Calls Logged", len(logs))
    with c5:
        dot2 = "red" if sim_fail else "green"
        st.markdown(f'{status_dot(dot2)} **Chaos Mode**', unsafe_allow_html=True)
        st.markdown(f'<div style="color:{"#f85149" if sim_fail else "#3fb950"};font-size:1.3rem;font-weight:700;">{"ON" if sim_fail else "OFF"}</div>', unsafe_allow_html=True)

    st.markdown("---")

    if not logs:
        st.markdown("""
<div style="background:#161b22;border:1px solid #21262d;border-radius:12px;padding:3rem;text-align:center;">
  <div style="color:#484f58;font-size:1.1rem;">No analytics data yet.</div>
  <div style="color:#484f58;font-size:.85rem;margin-top:.5rem;">Start an interview session on the Interview page to generate data.</div>
</div>""", unsafe_allow_html=True)
        return

    df = pd.DataFrame(logs)
    for col in ["cost", "latency_ms", "tokens", "savings", "confidence"]:
        if col not in df.columns:
            df[col] = 0.0
    if "model" not in df.columns:
        df["model"] = "unknown"
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"])

    total_cost     = df["cost"].sum()
    total_savings  = df["savings"].sum()
    baseline       = total_cost + total_savings
    savings_pct    = (total_savings / baseline * 100) if baseline > 0 else 0
    avg_confidence = df["confidence"].mean()
    avg_latency    = df["latency_ms"].mean()
    total_tokens   = int(df["tokens"].sum())

    # ── Summary metrics ──────────────────────────────────────────
    st.markdown("#### Cost & Performance Summary")
    m1, m2, m3, m4, m5, m6 = st.columns(6)
    with m1: st.metric("Total Cost", f"${total_cost:.4f}")
    with m2: st.metric("Total Savings", f"${total_savings:.4f}", delta=f"{savings_pct:.1f}% vs GPT-4o")
    with m3: st.metric("Avg Confidence", f"{avg_confidence:.2f}")
    with m4: st.metric("Avg Latency", f"{avg_latency:.0f}ms")
    with m5: st.metric("Total Tokens", f"{total_tokens:,}")
    with m6: st.metric("Sessions", df["session_id"].nunique() if "session_id" in df.columns else "—")

    st.markdown("---")

    # ── Charts row ───────────────────────────────────────────────
    chart_left, chart_right = st.columns(2)

    with chart_left:
        st.markdown("#### Baseline vs Optimized Cost")
        st.markdown('<p style="color:#8b949e;font-size:.8rem;margin-top:-.4rem;">GPT-4o baseline vs CascadeFlow adaptive routing</p>', unsafe_allow_html=True)
        cost_comp = pd.DataFrame({
            "Strategy": ["GPT-4o Baseline", "Adaptive Routing"],
            "Cost ($)": [baseline, total_cost]
        }).set_index("Strategy")
        st.bar_chart(cost_comp, color=["#f85149"])

    with chart_right:
        st.markdown("#### Model Distribution")
        st.markdown('<p style="color:#8b949e;font-size:.8rem;margin-top:-.4rem;">Percentage of calls routed to each tier</p>', unsafe_allow_html=True)
        model_dist = df["model"].value_counts()
        st.bar_chart(pd.DataFrame(model_dist).rename(columns={"model": "Calls"}))

    # ── Latency over time ────────────────────────────────────────
    if "timestamp" in df.columns and len(df) > 1:
        st.markdown("#### Latency Over Time")
        lat_df = df.set_index("timestamp")[["latency_ms"]].rename(columns={"latency_ms": "Latency (ms)"})
        st.line_chart(lat_df, height=200)

    st.markdown("---")

    # ── Routing policy breakdown ─────────────────────────────────
    if "rationale" in df.columns:
        pol_left, pol_right = st.columns(2)

        with pol_left:
            st.markdown("#### Routing Policy Breakdown")
            policy_counts = df["rationale"].apply(lambda x: (
                "Efficiency" if "Efficiency" in str(x) else
                "Performance" if "Performance" in str(x) else
                "Failover" if "FAILOVER" in str(x) else
                "Safe Mode" if "Safe" in str(x) else
                "Other"
            )).value_counts()
            st.bar_chart(policy_counts, height=200)

        with pol_right:
            st.markdown("#### Confidence Distribution")
            if len(df) > 0:
                conf_bins = pd.cut(df["confidence"], bins=[0, 0.4, 0.7, 0.9, 1.0],
                                   labels=["Low <0.4", "Med 0.4-0.7", "High 0.7-0.9", "Top >0.9"])
                st.bar_chart(conf_bins.value_counts(), height=200)

    st.markdown("---")

    # ── Full telemetry table ─────────────────────────────────────
    st.markdown("#### Full Telemetry Log")
    display_cols = [c for c in ["timestamp", "model", "latency_ms", "cost", "savings", "confidence", "tokens", "rationale"] if c in df.columns]
    show_df = df[display_cols].tail(50).copy()
    if "cost" in show_df.columns:
        show_df["cost"] = show_df["cost"].map("${:.5f}".format)
    if "savings" in show_df.columns:
        show_df["savings"] = show_df["savings"].map("${:.5f}".format)
    if "latency_ms" in show_df.columns:
        show_df["latency_ms"] = show_df["latency_ms"].map("{:.0f}ms".format)
    if "confidence" in show_df.columns:
        show_df["confidence"] = show_df["confidence"].map("{:.2f}".format)
    st.dataframe(show_df, use_container_width=True, hide_index=True)

    # ── Download ─────────────────────────────────────────────────
    csv = df.to_csv(index=False)
    st.download_button("Download Full Log (CSV)", data=csv, file_name="revela_analytics.csv", mime="text/csv")


render()
