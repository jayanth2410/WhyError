import { useState } from "react";




function App() {
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleExplain = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  console.log("Result:", result); // Debugging line to check the response from the backend
  return (
    <div style={styles.container}>

      
      <h1 style={styles.title}>WhyError</h1>
      <p style={styles.tagline}>Don’t just fix errors. Understand them.</p>

      <textarea
        style={styles.textarea}
        rows="6"
        placeholder="Paste your error message or stack trace here..."
        value={error}
        onChange={(e) => setError(e.target.value)}
      />

      <button style={{...styles.button , cursor: loading ? "not-allowed" : "pointer"}} onClick={handleExplain} disabled={loading}>
        {loading ? "Explaining..." : "Explain My Error"}
      </button>

      {result && (
        <div style={styles.card}>
          <Section title="🧠 Simple Explanation">
            {result.explanation}

          </Section>

          <Section title="⚠️ Why This Happens">
            {result.cause}
          </Section>

          <Section title="🛠️ How to Fix">
            {result.fix}
          </Section>

          <Section title="💻 Example Fix">
            <code>{result.example}</code>
          </Section>

          <Section title="📚 Concept to Learn">
            {result.concept}
          </Section>
 
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ marginBottom: "5px" }}>{title}</h3>
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "5px",
    width: "100%",
    
  },
  tagline: {
    textAlign: "center",
    color: "#555",
    marginBottom: "30px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  card: {
    marginTop: "25px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    width: "100%",
  },
};

export default App;
