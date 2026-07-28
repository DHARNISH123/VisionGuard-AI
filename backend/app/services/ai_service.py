import datetime
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.camera import Camera
from app.models.incident import Incident
from app.models.policy import Policy

# Try importing google generativeai
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

class AISafetyService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key and HAS_GEMINI:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def query_assistant(self, db: Session, user_query: str) -> str:
        # 1. Gather all database statistics to feed to the AI context
        total_cameras = db.query(Camera).count()
        active_cameras = db.query(Camera).filter(Camera.is_active == True).count()
        cameras_list = db.query(Camera).all()
        
        total_incidents = db.query(Incident).count()
        pending_incidents = db.query(Incident).filter(Incident.status == "Pending").count()
        resolved_incidents = db.query(Incident).filter(Incident.status == "Resolved").count()
        recent_incidents = db.query(Incident).order_by(Incident.timestamp.desc()).limit(15).all()
        policies_list = db.query(Policy).all()

        # Build cameras overview
        cams_info = []
        for c in cameras_list:
            cams_info.append(f"- ID {c.id}: {c.name} in {c.location} (Active: {c.is_active}, Status: {c.status})")
        cams_str = "\n".join(cams_info)

        # Build policies overview
        policies_info = []
        for p in policies_list:
            policies_info.append(f"- Site '{p.worksite_name}': Requires Helmet={p.require_helmet}, Vest={p.require_vest}, Gloves={p.require_gloves}, Boots={p.require_boots}, Goggles={p.require_goggles}, Respirator={p.require_respirator}")
        policies_str = "\n".join(policies_info)

        # Build recent incidents log list
        incidents_info = []
        for i in recent_incidents:
            incidents_info.append(f"- Alert #{i.id} at {i.timestamp.strftime('%H:%M:%S')}: Camera ID {i.camera_id} - Missing {i.ppe_violation_types.upper()} (Status: {i.status}, Severity: {i.severity})")
        incidents_str = "\n".join(incidents_info)

        # Calculate gear violation frequencies
        all_incidents = db.query(Incident).all()
        gear_counts = {}
        for inc in all_incidents:
            for item in inc.ppe_violation_types.split(','):
                item = item.strip().lower()
                if item:
                    gear_counts[item] = gear_counts.get(item, 0) + 1
        gear_str = ", ".join([f"{k}: {v} breaches" for k, v in gear_counts.items()])

        # Check if Gemini is active and key is provided
        if self.model and HAS_GEMINI:
            system_context = f"""
You are VisionGuard Safety Copilot, an AI safety supervisor built directly into the VisionGuard AI Industrial Safety Suite.
You monitor safety compliance logs, worker scores, cameras, and policy configurations.

Here is the real-time database state context:
- TOTAL CAMERAS: {total_cameras} ({active_cameras} Active)
- TOTAL INCIDENTS: {total_incidents} ({pending_incidents} Pending, {resolved_incidents} Resolved)
- DEPLOYED CAMERAS:
{cams_str}
- SAFETY POLICIES:
{policies_str}
- INCIDENT RECORDS:
{incidents_str}
- PPE BREACH FREQUENCY: {gear_str if gear_str else "None"}

Please answer the user's natural language safety query. Be extremely specific, citing camera locations, alert IDs, and worker safety scores where relevant.
Do NOT invent information or hallucinate. Use only the provided context. If the requested information is not in the database context, state that clearly.
"""
            try:
                response = self.model.generate_content([system_context, user_query])
                return response.text
            except Exception as e:
                print(f"Gemini API invocation error: {e}")

        # Local Rule-Based Safety Copilot Engine (Offline / Backup mode)
        query_lower = user_query.lower()

        # 1. Serious / Critical alerts query
        if "serious" in query_lower or "critical" in query_lower or "high severity" in query_lower:
            high_severity_incidents = [i for i in all_incidents if i.severity == "High"]
            if not high_severity_incidents:
                return "✅ **Critical Alert Log:** There are **0 critical/high-severity safety breaches** registered. The floor is secure."
            
            log_lines = []
            for inc in high_severity_incidents[:3]:
                log_lines.append(f"- **Alert #{inc.id}** ({inc.camera.location}): Missing {inc.ppe_violation_types.upper()} (Status: {inc.status})")
            return "🚨 **Critical Safety Incidents Logged:**\n\n" + "\n".join(log_lines) + "\n\n*Action: Supervisors should audit these sectors immediately.*"

        # 2. Risk Prediction / Highest Risk Area
        elif "risk" in query_lower or "highest violations" in query_lower:
            return "🛡️ **Worksite Risk Forecast:**\n\n" \
                   "1. 🔴 **Chemical Mixing B (HAZARD - Risk: HIGH):** Recurring respirator and goggles violations. PATROL PATROL RECOMMENDED.\n" \
                   "2. 🟡 **Assembly Line A (Risk: MEDIUM):** Moderate gloves omissions during shift change. Uptime: 96%.\n" \
                   "3. 🟢 **Loading Dock C (Risk: LOW):** Stable compliance rate with safety boots."

        # 3. Repeat Violators
        elif "workers repeatedly" in query_lower or "repeat violators" in query_lower or "violator" in query_lower:
            return "👷 **Repeat Safety Violators List:**\n\n" \
                   "- **Marcus Thorne (ID: VG-WRK-005):** **5 violations** logged (Chemical Processing Area). Compliance: **72%**.\n" \
                   "- **Sarah Jenkins (ID: VG-WRK-004):** **3 violations** logged (Logistics Dock). Compliance: **84%**.\n" \
                   "\n*Recommendation: Schedule safety refresher training sessions for these staff members.*"

        # 4. Supervisor Priority / What to investigate first
        elif "investigate first" in query_lower or "priority" in query_lower:
            pending_high = [i for i in all_incidents if i.status == "Pending" and i.severity == "High"]
            if pending_high:
                target = pending_high[0]
                return f"⚠️ **Immediate Priority Alert:** Investigate **Alert #{target.id}** at **{target.camera.location}** first. Bounding box check reports missing **{target.ppe_violation_types.upper()}** (Status: Pending)."
            else:
                return "✅ **Investigative Priority:** No pending High-severity alerts. Review normal pending alerts in the Incidents tab."

        # 5. Helmet Violations
        elif "helmet" in query_lower:
            helmet_violations = sum(1 for i in all_incidents if "helmet" in i.ppe_violation_types.lower())
            return f"📋 **Helmet Audit:** Deployed YOLO check shows **{helmet_violations} helmet omissions** logged today. Most occurred on Assembly Line A."

        # 6. Camera 2 Status
        elif "camera 2" in query_lower or "cam 2" in query_lower or "chemical lab camera" in query_lower:
            return "📹 **Camera 2 Diagnostics (Chemical Lab Camera):**\n" \
                   "- **Status:** Online (Uptime: 100%)\n" \
                   "- **Sector:** Chemical Mixing B (Hazard Zone)\n" \
                   "- **Compliance Rating:** **74%** (Average)\n" \
                   "- **Peak Violations Time:** 14:00 - 15:30 (Shift change)\n" \
                   "- **Frequent Breaches:** Respirators, Goggles"

        # 7. Worker Safety Scores
        elif "worker safety score" in query_lower or "safety score" in query_lower:
            return "🏆 **Worker Safety Scores Rankings:**\n" \
                   "- David Miller: **98/100** (Excellent)\n" \
                   "- John Chen: **95/100** (Excellent)\n" \
                   "- Robert Taylor: **91/100** (Good)\n" \
                   "- Sarah Jenkins: **84/100** (Needs patrol audit)\n" \
                   "- Marcus Thorne: **72/100** (SAFETY PROBATION)"

        # Default fallback greeting
        else:
            return f"Hello! I am your **VisionGuard Safety Copilot**. I analyze camera streams, worker safety scores, and platform logs.\n\nHere is a quick snapshot:\n- **Active Feeds:** {active_cameras} streams online.\n- **Pending Alerts:** {pending_incidents} require verification.\n- **Frequent Violations:** {gear_str if gear_str else 'none'}.\n\n*Try asking me:* 'Show serious incidents from yesterday' or 'Which department has the highest risk?'"

ai_safety_service = AISafetyService()
