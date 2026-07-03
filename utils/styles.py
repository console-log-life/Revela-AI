GLOBAL_CSS = """
<style>
/* ─── Base ─────────────────────────────────────────── */
[data-testid="stAppViewContainer"] { background: radial-gradient(circle at top center, #111113, #000000) !important; }
[data-testid="stSidebar"] { background: rgba(10, 10, 12, 0.7) !important; backdrop-filter: blur(20px); border-right: 1px solid rgba(255, 255, 255, 0.08); }
[data-testid="stSidebarContent"] { padding-top: 1rem; }

/* ─── Hide default Streamlit chrome ─────────────────── */
#MainMenu, footer { visibility: hidden; }
header { background: transparent !important; }
.stDeployButton { display: none; }
[data-testid="stDecoration"] { display: none; }

/* ─── Typography ────────────────────────────────────── */
html, body, [class*="css"] { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
h1, h2, h3 { color: #ffffff !important; font-weight: 600; letter-spacing: -0.02em; }
p, label, span { color: #a1a1aa; }

/* ─── Metric cards ──────────────────────────────────── */
[data-testid="stMetric"] {
    background: rgba(20, 20, 22, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    transition: all .3s ease;
}
[data-testid="stMetric"]:hover { 
    border-color: rgba(255, 255, 255, 0.2); 
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05);
}
[data-testid="stMetricValue"] { color: #ffffff !important; font-size: 1.8rem !important; font-weight: 600 !important; letter-spacing: -0.02em; }
[data-testid="stMetricLabel"] { color: #71717a !important; font-size: .75rem !important; text-transform: uppercase; letter-spacing: .1em; font-weight: 500; }
[data-testid="stMetricDelta"] { font-size: .85rem !important; }

/* ─── Buttons ───────────────────────────────────────── */
.stButton > button {
    background: linear-gradient(180deg, #27272a, #18181b);
    color: #e4e4e7;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-weight: 500;
    font-size: .9rem;
    padding: .6rem 1.5rem;
    transition: all .2s ease;
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
.stButton > button:hover { background: linear-gradient(180deg, #3f3f46, #27272a); border-color: rgba(255, 255, 255, 0.2); color: #ffffff; transform: translateY(-1px); }
.stButton > button:disabled { background: rgba(24, 24, 27, 0.5); color: #52525b; border-color: transparent; box-shadow: none; }

/* ─── Danger button ─────────────────────────────────── */
.danger-btn button { background: linear-gradient(180deg, #7f1d1d, #450a0a) !important; border-color: rgba(239, 68, 68, 0.3) !important; color: #fca5a5 !important; }
.danger-btn button:hover { background: linear-gradient(180deg, #991b1b, #7f1d1d) !important; border-color: rgba(239, 68, 68, 0.5) !important; color: #ffffff !important; }

/* ─── Chat ──────────────────────────────────────────── */
[data-testid="stChatMessage"] {
    background: rgba(24, 24, 27, 0.5) !important;
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 12px !important;
    margin-bottom: 1rem !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
}

/* ─── Code / YAML ───────────────────────────────────── */
[data-testid="stCode"], pre {
    background: rgba(9, 9, 11, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 8px !important;
    font-size: .8rem !important;
}

/* ─── Inputs ────────────────────────────────────────── */
[data-testid="stTextInput"] input, [data-testid="stSelectbox"] select {
    background: rgba(9, 9, 11, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    color: #ffffff !important;
    transition: border-color .2s;
}
[data-testid="stTextInput"] input:focus, [data-testid="stSelectbox"] select:focus {
    border-color: rgba(255, 255, 255, 0.3) !important;
    box-shadow: none !important;
}
[data-testid="stChatInput"] textarea {
    background: rgba(24, 24, 27, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    color: #ffffff !important;
}

/* ─── Divider ───────────────────────────────────────── */
hr { border-color: rgba(255, 255, 255, 0.05) !important; }

/* ─── DataFrames ────────────────────────────────────── */
[data-testid="stDataFrame"] { border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; }
[data-testid="stDataFrame"] th { background: rgba(24, 24, 27, 0.8) !important; color: #a1a1aa !important; font-size: .75rem; text-transform: uppercase; font-weight: 500; }

/* ─── Tabs ──────────────────────────────────────────── */
[data-testid="stTabs"] [data-baseweb="tab-list"] { background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.08); gap: 1rem; }
[data-testid="stTabs"] [data-baseweb="tab"] { background: transparent; color: #71717a; border-radius: 0; padding: .6rem .2rem; font-size: .85rem; font-weight: 500; }
[data-testid="stTabs"] [aria-selected="true"] { background: transparent !important; color: #ffffff !important; border-bottom: 2px solid #ffffff; }

/* ─── Trace feed ────────────────────────────────────── */
.trace-feed {
    background: rgba(9, 9, 11, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 14px 18px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: .75rem;
    color: #a1a1aa;
    max-height: 250px;
    overflow-y: auto;
    line-height: 1.8;
}

/* ─── Status badges ─────────────────────────────────── */
.badge {
    display: inline-block;
    padding: .25rem .6rem;
    border-radius: 4px;
    font-size: .7rem;
    font-weight: 600;
    letter-spacing: .05em;
    text-transform: uppercase;
    border: 1px solid transparent;
}
.badge-green { background: rgba(22, 101, 52, 0.2); color: #4ade80; border-color: rgba(74, 222, 128, 0.2); }
.badge-red { background: rgba(153, 27, 27, 0.2); color: #f87171; border-color: rgba(248, 113, 113, 0.2); }
.badge-yellow { background: rgba(146, 64, 14, 0.2); color: #fbbf24; border-color: rgba(251, 191, 36, 0.2); }
.badge-blue { background: rgba(30, 64, 175, 0.2); color: #60a5fa; border-color: rgba(96, 165, 250, 0.2); }

/* ─── Cards ─────────────────────────────────────────── */
.card {
    background: rgba(20, 20, 22, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.25rem;
    transition: all .3s ease;
}
.card:hover { 
    border-color: rgba(255, 255, 255, 0.2); 
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05);
}
.card-title { font-size: .75rem; font-weight: 500; text-transform: uppercase; letter-spacing: .1em; color: #71717a; margin-bottom: .6rem; }
.card-value { font-size: 1.8rem; font-weight: 600; color: #ffffff; letter-spacing: -0.02em; }
.card-sub { font-size: .85rem; color: #a1a1aa; margin-top: .4rem; }

/* ─── Section headings ──────────────────────────────── */
.section-heading {
    font-size: .8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: #e4e4e7;
    margin: 1.5rem 0 .75rem 0;
    display: flex;
    align-items: center;
    gap: .5rem;
}

/* ─── Alert banners ─────────────────────────────────── */
.alert-red {
    background: rgba(69, 10, 10, 0.5);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 16px 20px;
    animation: pulse-danger 2s infinite;
}
.alert-red h4 { color: #fca5a5 !important; margin: 0; font-size: 1rem; font-weight: 600; }
.alert-red p { color: #fecaca; margin: 6px 0 0; font-size: .85rem; }

@keyframes pulse-danger { 0%,100% { opacity:1; } 50% { opacity:.7; } }

/* ─── Progress bar ──────────────────────────────────── */
.stProgress > div > div { background: #ffffff; border-radius: 2px; }
</style>
"""

def status_dot(color: str) -> str:
    colors = {"green": "#3fb950", "red": "#f85149", "yellow": "#d29922", "blue": "#58a6ff"}
    c = colors.get(color, color)
    anim = "animation: pulse 1.5s infinite;" if color == "red" else ""
    return f'<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:{c};box-shadow:0 0 6px {c};margin-right:6px;{anim}"></span>'

def badge(text: str, color: str = "blue") -> str:
    return f'<span class="badge badge-{color}">{text}</span>'

def card(title: str, value: str, sub: str = "") -> str:
    return f"""
<div class="card">
  <div class="card-title">{title}</div>
  <div class="card-value">{value}</div>
  {"<div class='card-sub'>" + sub + "</div>" if sub else ""}
</div>"""

def section_heading(text: str, icon: str = "") -> str:
    return f'<div class="section-heading">{icon} {text}</div>'
