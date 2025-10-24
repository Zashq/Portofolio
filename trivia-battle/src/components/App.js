import React, { useEffect, useState } from "react";
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerDuration, setTimerDuration] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categoryInfo, setCategoryInfo] = useState(null);

  const fetchQuestions = (diff = null, catId = null) => {
    // build API url with optional difficulty
    let url = "https://opentdb.com/api.php?amount=5&type=multiple";
    if (diff) url += `&difficulty=${diff}`;
    if (catId) url += `&category=${catId}`;
    fetch(url)
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
        setSelectedAnswer(null);
        setShowFeedback(false);
        // set timer initial value based on difficulty
        let dur = 10;
        if (diff === "easy") dur = 15;
        else if (diff === "medium") dur = 10;
        else if (diff === "hard") dur = 7;
        setTimerDuration(dur);
        setTimeLeft(dur);
      })
      .catch((err) => {
        console.error("Failed to fetch questions:", err);
      });
  };

  useEffect(() => {
    // load leaderboard from localStorage (no auto-fetch of questions)
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
    // fetch available categories from OpenTDB
    fetch("https://opentdb.com/api_category.php")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.trivia_categories)) {
          setCategories(data.trivia_categories);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const fetchCategoryInfo = (catId) => {
    if (!catId) return;
    fetch(`https://opentdb.com/api_count.php?category=${catId}`)
      .then((res) => res.json())
      .then((data) => {
        // store the raw response for display; the structure contains counts by difficulty
        setCategoryInfo(data);
      })
      .catch((err) => console.error("Failed to load category info:", err));
  };

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  const handleAnswer = (answer) => {
    if (showFeedback) return; // ignore repeated clicks
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === questions[current].correct) {
      setScore((prev) => prev + 1);
    }
    // pause briefly to show feedback then move on
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      const next = current + 1;
      if (next < questions.length) {
        setCurrent(next);
        setTimeLeft(timerDuration);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  const handleTimeUp = () => {
    if (showFeedback) return;
    // show feedback (no selected answer)
    setShowFeedback(true);
    setSelectedAnswer(null);
    // move on after short pause
    setTimeout(() => {
      setShowFeedback(false);
      const next = current + 1;
      if (next < questions.length) {
        setCurrent(next);
        setTimeLeft(timerDuration);
      } else {
        setFinished(true);
      }
    }, 1200);
  };


  const resetGame = () => {
    // restart from difficulty choice
    setGameStarted(false);
    setDifficulty(null);
    setQuestions([]);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setSaved(false);
    setPlayerName("");
    setSelectedCategoryId(null);
    setSelectedCategoryName("");
    setCategoryInfo(null);
  };

  const saveScore = () => {
    const entry = {
      name: playerName && playerName.trim() !== "" ? playerName.trim() : "Név nélkül",
      score,
      total: questions.length,
      difficulty: difficulty || "-",
      category: selectedCategoryName || "-",
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

  const saveAndNewGame = () => {
    // Save then start a new game. Use a short delay to allow state updates.
    saveScore();
    setTimeout(() => {
      // keep leaderboard visible, but reset game selection so user can pick new settings
      resetGame();
    }, 200);
  };

  // timer effect: countdown per question
  useEffect(() => {
    if (!gameStarted || finished) return;
    // reset timeLeft when current changes
    setTimeLeft(timerDuration);
    let mounted = true;
    const tick = () => {
      setTimeLeft((prev) => {
        if (!mounted) return prev;
        if (prev <= 1) {
          // time up
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    };
    const iv = setInterval(tick, 1000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, gameStarted, timerDuration, finished]);

  // If the game hasn't started yet, show difficulty selector
  if (!gameStarted)
    return (
      <div style={styles.container}>
        <h2>Trivia játék</h2>
        <p>Válassz kategóriát és nehézségi szintet:</p>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="category">Kategória:</label>
          <br />
          <select
            id="category"
            value={selectedCategoryId || ""}
            onChange={(e) => {
              const id = e.target.value || null;
              setSelectedCategoryId(id);
              const cat = categories.find((c) => String(c.id) === String(id));
              setSelectedCategoryName(cat ? cat.name : "");
              setCategoryInfo(null);
              if (id) fetchCategoryInfo(id);
            }}
            style={{ padding: 8, minWidth: 240 }}
          >
            <option value="">-- Válassz kategóriát --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {categoryInfo && categoryInfo.category_question_count && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <div>Összes kérdés: {categoryInfo.category_question_count.total_question_count}</div>
              <div>Könnyű: {categoryInfo.category_question_count.total_easy_question_count} — Közepes: {categoryInfo.category_question_count.total_medium_question_count} — Nehéz: {categoryInfo.category_question_count.total_hard_question_count}</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => { setDifficulty("easy"); setGameStarted(true); fetchQuestions("easy", selectedCategoryId); }} style={styles.btn}>Könnyű</button>
          <button onClick={() => { setDifficulty("medium"); setGameStarted(true); fetchQuestions("medium", selectedCategoryId); }} style={styles.btn}>Közepes</button>
          <button onClick={() => { setDifficulty("hard"); setGameStarted(true); fetchQuestions("hard", selectedCategoryId); }} style={styles.btn}>Nehéz</button>
        </div>

        <hr style={{ width: "80%", margin: "20px auto" }} />
        <h3>Top 5 eredmény</h3>
        {leaderboard.length === 0 ? (
          <p>Nincs mentett eredmény.</p>
        ) : (
          <ol style={{ textAlign: "left", maxWidth: 400 }}>
            {leaderboard.map((r, idx) => (
              <li key={idx}>
                {r.name} — {r.score}/{r.total} ({r.difficulty || "-"}) — {r.category || "-"}
              </li>
            ))}
          </ol>
        )}
      </div>
    );

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
            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={saveScore}>Mentés</button>
              <button onClick={saveAndNewGame}>Mentés és új játék</button>
            </div>
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
                {r.name} — {r.score}/{r.total} ({r.difficulty || "-"})
              </li>
            ))}
          </ol>
        )}
      </div>
    );

  const q = questions[current];

  return (
    <div className="app-container">
      <div className="quiz-card">
        <div className="progress" style={{ marginBottom: 12 }}>
          <div className="bar" style={{ width: `${(timeLeft / timerDuration) * 100}%` }} />
        </div>
        <h2 dangerouslySetInnerHTML={{ __html: q.question }} />
        <div style={{ marginTop: 12 }}>
          {q.answers.map((ans, i) => {
            const isCorrect = ans === q.correct;
            const isSelected = ans === selectedAnswer;
            let className = "answer";
            if (showFeedback) {
              if (isCorrect) className += " correct";
              else if (isSelected && !isCorrect) className += " wrong";
            }
            return (
              <button
                key={i}
                className={className}
                onClick={() => handleAnswer(ans)}
                disabled={showFeedback}
                dangerouslySetInnerHTML={{ __html: ans }}
                style={{ ...styles.btn, width: "100%", maxWidth: 600 }}
              />
            );
          })}
        </div>
        <p style={{ marginTop: 12 }}>Kérdés {current + 1} / {questions.length} — {timeLeft}s</p>
      </div>
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
