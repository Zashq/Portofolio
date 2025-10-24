import React, { useEffect, useState } from "react";

function App() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchQuestions = () => {
    fetch("https://opentdb.com/api.php?amount=5&category=18&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => ({
          question: q.question,
          correct: q.correct_answer,
          answers: shuffle([...q.incorrect_answers, q.correct_answer]),
        }));
        setQuestions(formatted);
        // reset state when new questions arrive
        setCurrent(0);
        setScore(0);
        setFinished(false);
        setSaved(false);
        setPlayerName("");
      })
      .catch((err) => {
        console.error("Failed to fetch questions:", err);
      });
  };

  useEffect(() => {
    fetchQuestions();
    // load leaderboard from localStorage
    const stored = localStorage.getItem("trivia_scores");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // keep only top 5 in state for display
        setLeaderboard(parsed.slice(0, 5));
      } catch (e) {
        console.error("Failed to parse leaderboard:", e);
      }
    }
  }, []);

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const handleAnswer = (answer) => {
    if (answer === questions[current].correct) {
      setScore((prev) => prev + 1);
    }
    const next = current + 1;
    if (next < questions.length) setCurrent(next);
    else setFinished(true);
  };


  const resetGame = () => {
    // re-fetch fresh questions and reset all UI state without reloading the page
    fetchQuestions();
  };

  const saveScore = () => {
    const entry = {
      name: playerName && playerName.trim() !== "" ? playerName.trim() : "Név nélkül",
      score,
      total: questions.length,
      date: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("trivia_scores") || "[]");
    existing.push(entry);
    // sort descending by score, then by most recent
    existing.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.date) - new Date(a.date);
    });
    localStorage.setItem("trivia_scores", JSON.stringify(existing));
    setLeaderboard(existing.slice(0, 5));
    setSaved(true);
  };

  if (questions.length === 0) return <p>Betöltés...</p>;

  if (finished)
    return (
      <div style={styles.container}>
        <h2>Eredmény: {score}/{questions.length} helyes válasz</h2>

        {!saved ? (
          <div style={{ margin: "16px 0" }}>
            <label htmlFor="name">Neved:</label>
            <br />
            <input
              id="name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Add meg a neved"
              style={{ padding: "8px", marginTop: "8px", borderRadius: 4 }}
            />
            <br />
            <button onClick={saveScore} style={{ marginTop: 10 }}>Mentés</button>
          </div>
        ) : (
          <div style={{ margin: "16px 0" }}>
            <p>A pontszám elmentve.</p>
          </div>
        )}

        <button onClick={resetGame}>Új játék</button>

        <hr style={{ margin: "20px 0", width: "100%" }} />

        <h3>Top 5 eredmény</h3>
        {leaderboard.length === 0 ? (
          <p>Nincs mentett eredmény.</p>
        ) : (
          <ol style={{ textAlign: "left", maxWidth: 400 }}>
            {leaderboard.map((r, idx) => (
              <li key={idx}>
                {r.name} — {r.score}/{r.total}
              </li>
            ))}
          </ol>
        )}
      </div>
    );

  const q = questions[current];

  return (
    <div style={styles.container}>
      <h2 dangerouslySetInnerHTML={{ __html: q.question }} />
      {q.answers.map((ans, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(ans)}
          dangerouslySetInnerHTML={{ __html: ans }}
          style={styles.btn}
        />
      ))}
      <p>Kérdés {current + 1} / {questions.length}</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
  btn: {
    display: "block",
    margin: "10px auto",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1a73e8",
    color: "white",
    cursor: "pointer",
  },
};

export default App;
