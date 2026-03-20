import { useState } from "react";

function App() {
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fix");

  const handleExplain = async () => {
    if (!error.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error }),
      });
      const data = await res.json();
      setResult(data);
      setActiveTab("fix");
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoBadge}>WhyError AI</div>
          <h1 style={styles.title}>Debug with Intelligence.</h1>
          <p style={styles.tagline}>Understand the "Why" behind the "Error".</p>
        </header>

        <div style={styles.inputCard}>
          <textarea
            style={styles.textarea}
            placeholder="Paste your console error or stack trace here..."
            value={error}
            onChange={(e) => setError(e.target.value)}
          />
          <button style={styles.button} onClick={handleExplain} disabled={loading}>
            {loading ? "Analyzing Logic..." : "Explain Error"}
          </button>
        </div>

        {result && (
          <div style={styles.resultContainer}>
            <div style={styles.errorHeader}>
              <span style={styles.errorLabel}>Detected Issue</span>
              <h2 style={styles.errorTitle}>{result.error_name || "Code Execution Error"}</h2>
            </div>

            <div style={styles.tabs}>
              <button 
                onClick={() => setActiveTab("fix")}
                style={activeTab === "fix" ? styles.activeTab : styles.tab}
              >
                🛠 The Fix
              </button>
              <button 
                onClick={() => setActiveTab("learn")}
                style={activeTab === "learn" ? styles.activeTab : styles.tab}
              >
                🧠 Deep Learning
              </button>
            </div>

            <div style={styles.contentArea}>
              {activeTab === "fix" ? <FixView data={result} /> : <LearnView data={result} />}
            </div>

            {result.resources && (
              <div style={styles.resourceBar}>
                <a href={result.resources.youtube_link} target="_blank" rel="noreferrer" style={styles.ytButton}>
                  Watch Video Tutorial
                </a>
                <a href={result.resources.blog_link} target="_blank" rel="noreferrer" style={styles.blogButton}>
                  Read Technical Blog
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Views ---------------- */

const FixView = ({ data }) => {
  // CRITICAL FIX: Replace literal \n strings with real newlines
  const rawCode = (data.solution?.wrong_vs_correct || data.wrong_vs_correct || "").replaceAll("\\n", "\n");
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawCode);
    alert("Code copied to clipboard!");
  };

  return (
    <div style={styles.fadeAnim}>
      <Section title="Root Cause" icon="🔍">
        <p>{data.summary?.root_cause || data.root_cause}</p>
      </Section>
      
      <Section title="Code Comparison" icon="💻">
        <div style={{ position: 'relative' }}>
          <button onClick={copyToClipboard} style={styles.copyButton}>Copy Code</button>
          <pre style={styles.codeBlock}>
            <code>{rawCode}</code>
          </pre>
        </div>
      </Section>

      <Section title="Steps to Resolve" icon="✅">
        <ul style={styles.list}>
          {(data.solution?.step_by_step_fix || data.step_by_step_fix || []).map((step, i) => (
            <li key={i} style={styles.listItem}>{step}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
};

const LearnView = ({ data }) => (
  <div style={styles.fadeAnim}>
    <Section title="The Simple Logic" icon="💡">
      <p>{data.summary?.simple_explanation || data.simple_explanation}</p>
    </Section>

    <Section title="Concept Theory" icon="📚">
      <p>{data.learning?.concept_explanation || data.concept_explanation}</p>
    </Section>

    <Section title="Analogy" icon="🎭">
      <div style={styles.analogyBox}>
        {data.learning?.real_world_analogy || data.real_world_analogy}
      </div>
    </Section>

    <Section title="Common Pitfalls" icon="⚠️">
      <ul style={styles.list}>
        {(data.learning?.common_mistakes || data.common_mistakes || []).map((m, i) => (
          <li key={i} style={styles.listItem}>{m}</li>
        ))}
      </ul>
    </Section>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      <span>{icon}</span> {title}
    </h3>
    <div style={styles.sectionContent}>{children}</div>
  </div>
);

/* ---------------- Styles ---------------- */

const styles = {
  page: {
    background: "#020617",
    minHeight: "100vh",
    padding: "40px 20px",
    color: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  container: { maxWidth: "850px", margin: "auto" },
  header: { textAlign: "center", marginBottom: "40px" },
  logoBadge: {
    display: "inline-block",
    background: "rgba(59, 130, 246, 0.1)",
    color: "#60a5fa",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "12px",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  title: { fontSize: "38px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-1px" },
  tagline: { color: "#94a3b8", fontSize: "16px" },
  
  inputCard: {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #1e293b",
    marginBottom: "30px",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    fontFamily: "monospace",
    resize: "none",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "linear-gradient(45deg, #2563eb, #7c3aed)",
    color: "white",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    marginTop: "15px",
  },

  resultContainer: {
    background: "#0f172a",
    borderRadius: "18px",
    border: "1px solid #1e293b",
    overflow: "hidden",
  },
  errorHeader: {
    padding: "25px",
    background: "linear-gradient(to bottom, #1e1b4b, #0f172a)",
    borderBottom: "1px solid #1e293b",
  },
  errorLabel: { color: "#ef4444", fontSize: "11px", fontWeight: "900", textTransform: "uppercase" },
  errorTitle: { fontSize: "22px", marginTop: "5px", color: "#fff" },

  tabs: { display: "flex", background: "#1e293b", padding: "4px" },
  tab: { flex: 1, padding: "12px", background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", fontSize: "14px" },
  activeTab: { flex: 1, padding: "12px", background: "#0f172a", color: "#38bdf8", border: "none", fontWeight: "bold", borderRadius: "6px" },

  contentArea: { padding: "25px" },
  section: { marginBottom: "25px" },
  sectionTitle: { fontSize: "13px", color: "#60a5fa", textTransform: "uppercase", marginBottom: "10px", display: "flex", gap: "8px" },
  sectionContent: { color: "#cbd5e1", fontSize: "15px", lineHeight: "1.6" },
  
  codeBlock: { 
    background: "#020617", 
    padding: "20px", 
    borderRadius: "12px", 
    color: "#4ade80", 
    fontSize: "13px", 
    overflowX: "auto", 
    border: "1px solid #1e293b",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word"
  },
  copyButton: {
    position: 'absolute',
    right: '12px',
    top: '12px',
    background: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    zIndex: 5
  },
  list: { paddingLeft: "20px" },
  listItem: { marginBottom: "10px" },
  analogyBox: { padding: "18px", background: "rgba(250, 204, 21, 0.05)", borderLeft: "3px solid #facc15", color: "#e2e8f0", fontStyle: "italic" },

  resourceBar: {
    padding: "20px",
    background: "#020617",
    display: "flex",
    gap: "12px",
    borderTop: "1px solid #1e293b",
  },
  ytButton: { flex: 1, textAlign: "center", padding: "12px", background: "#991b1b", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" },
  blogButton: { flex: 1, textAlign: "center", padding: "12px", background: "#1e293b", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" },
  
  fadeAnim: { animation: "fadeIn 0.3s ease-in" }
};

export default App;