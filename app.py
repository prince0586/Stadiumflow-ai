import os
import random
import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime
import plotly.express as px
from logic import StadiumAgents

# --- Page Configuration ---
st.set_page_config(
    page_title="StadiumFlow | AI Command Center",
    page_icon="🏟️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Session State Initialization ---
if "messages" not in st.session_state:
    st.session_state.messages = []
if "telemetry" not in st.session_state:
    st.session_state.telemetry = {
        "Gate A": 45,
        "Gate B": 82,
        "Food Court": 60,
        "VIP Lounge": 30,
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }

def update_telemetry():
    """Simulates real-time sensor updates."""
    st.session_state.telemetry = {
        "Gate A": random.randint(10, 95),
        "Gate B": random.randint(10, 95),
        "Food Court": random.randint(10, 95),
        "VIP Lounge": random.randint(10, 95),
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }

# --- Sidebar ---
with st.sidebar:
    st.title("StadiumFlow")
    st.markdown("---")
    role = st.radio(
        "Select Operations Context:",
        ["Fan Concierge", "Staff Command Center"],
        help="Switch between attendee assistance and venue management dashboards."
    )
    st.button("🔄 Refresh Telemetry", on_click=update_telemetry)
    st.info("Environment: Production Edge Node")

# --- Dashboards ---

if role == "Fan Concierge":
    st.header("🏟️ Fan Interaction Hub")
    st.caption("AI-Powered assistance for navigation, parking, and stadium logistics.")
    
    # Chat Interface
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("How can I help you today?", key="fan_input"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            agents = StadiumAgents(os.getenv("GEMINI_API_KEY"))
            response = agents.get_fan_advice(prompt, st.session_state.telemetry)
            st.markdown(response)
            st.session_state.messages.append({"role": "assistant", "content": response})

elif role == "Staff Command Center":
    st.header("🛡️ Staff Command Center")
    st.caption("Real-time telemetry, crowd movement analysis, and coordination alerts.")
    
    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Gate A Density", f"{st.session_state.telemetry['Gate A']}%", "4%", help="Occupancy levels at South Perimeter")
    with col2:
        st.metric("Gate B Density", f"{st.session_state.telemetry['Gate B']}%", "-2%", delta_color="inverse", help="Occupancy levels at North Perimeter")
    with col3:
        st.metric("Food Court", f"{st.session_state.telemetry['Food Court']}%", "12%", delta_color="off", help="Wait times are approaching peak")
    with col4:
        st.metric("Staff Active", "142", "5", help="Verified personnel on-site")

    st.markdown("---")
    
    # Visualization
    t_col1, t_col2 = st.columns([2, 1])
    with t_col1:
        st.subheader("Crowd Flow Trends")
        chart_data = pd.DataFrame(
            np.random.randn(20, 3),
            columns=['Gate A', 'Gate B', 'Main Concourse']
        )
        st.line_chart(chart_data, help="Historical trends of attendee movement per zone")
        
    with t_col2:
        st.subheader("Coordination Alerts")
        agents = StadiumAgents(os.getenv("GEMINI_API_KEY"))
        summary = agents.get_staff_summary(st.session_state.telemetry)
        st.warning(f"AI ASSESSMENT: {summary}")
        
    # Incident Table
    st.subheader("Active Incidents")
    incidents = pd.DataFrame({
        "ID": ["INC-901", "INC-902", "INC-903"],
        "Zone": ["Gate B", "Parking C", "Concourse L1"],
        "Priority": ["High", "Medium", "Low"],
        "Status": ["Dispatched", "Pending", "Resolved"]
    })
    st.table(incidents)
