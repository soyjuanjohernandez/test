import { useState, useEffect } from 'react';
import './App.css';

import Questions from '../db.json';

function App() {
  // Estados generales
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Para preguntas de opción múltiple de selección única
  const [selectedOption, setSelectedOption] = useState(null);
  // Para preguntas de opción múltiple que permiten seleccionar varias respuestas
  const [selectedOptions, setSelectedOptions] = useState([]);
  // Para preguntas de texto
  const [textAnswer, setTextAnswer] = useState("");
  // Para preguntas de matching
  const [matchingAnswers, setMatchingAnswers] = useState({});

  // Estados para feedback y puntaje
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(null); // true/false
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Cargar preguntas desde json-server (db.json)
  useEffect(() => {
    // Simulación de carga de preguntas
    setQuestions(Questions.questions);

  }, []);

  // Mientras no se hayan cargado las preguntas
  if (questions.length === 0) {
    return (
      <div className="App">
        <h1>Cargando preguntas...</h1>
      </div>
    );
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOption(null);
    setSelectedOptions([]);
    setTextAnswer("");
    setMatchingAnswers({});
    setShowFeedback(false);
    setAnswerCorrect(null);
  };

  // Si el test ha finalizado, mostramos el resumen
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="App">
        <div className="test-result">
          <h1>Resultado del Test</h1>
          <h1>
            {score} de {questions.length}
          </h1>
          <hr />
          <h2>Puntuación</h2>
          <br />
          <br />
          <h1>
            {percentage}%
          </h1>
          <hr />
          <h2>Porcentaje</h2>
          <br />
          <button onClick={handleRestart} className="restart-button">Reiniciar Test</button>
        </div>
      </div>
    );
  }

  // Obtenemos la pregunta actual
  const currentQuestion = questions[currentQuestionIndex];

  // Determinar si es una pregunta de opción múltiple que permite selección múltiple
  const isMultiSelect = currentQuestion.type === "multiple-choice" && Array.isArray(currentQuestion.answer);

  // --- Manejadores para preguntas de opción múltiple ---

  // Para preguntas de selección única (cuando answer es string)
  const handleOptionClick = (option) => {
    if (showFeedback) return;
    const isCorrect = option === currentQuestion.answer;
    setAnswerCorrect(isCorrect);
    if (isCorrect) setScore(prev => prev + 1);
    setSelectedOption(option);
    setShowFeedback(true);
  };

  // Para preguntas de selección múltiple
  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleMultiSubmit = () => {
    if (showFeedback) return;
    const correctAnswers = currentQuestion.answer; // es un arreglo
    // La respuesta es correcta si se han seleccionado exactamente todas las respuestas correctas
    const isCorrect =
      selectedOptions.length === correctAnswers.length &&
      selectedOptions.every(opt => correctAnswers.includes(opt));
    setAnswerCorrect(isCorrect);
    if (isCorrect) setScore(prev => prev + 1);
    setShowFeedback(true);
  };

  // --- Manejador para preguntas de texto ---
  const handleTextSubmit = () => {
    if (showFeedback) return;
    const isCorrect = textAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    setAnswerCorrect(isCorrect);
    if (isCorrect) setScore(prev => prev + 1);
    setShowFeedback(true);
  };

  // --- Manejadores para preguntas de matching ---
  const handleMatchingChange = (index, value) => {
    setMatchingAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleMatchingSubmit = () => {
    if (showFeedback) return;
    let allCorrect = true;
    currentQuestion.pairs.forEach((pair, index) => {
      if (matchingAnswers[index] !== pair.folder) {
        allCorrect = false;
      }
    });
    setAnswerCorrect(allCorrect);
    if (allCorrect) setScore(prev => prev + 1);
    setShowFeedback(true);
  };

  // --- Manejadores para avanzar o reiniciar ---
  const handleNext = () => {
    setShowFeedback(false);
    setAnswerCorrect(null);
    setSelectedOption(null);
    setSelectedOptions([]);
    setTextAnswer("");
    setMatchingAnswers({});
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };



  // --- Renderizado del feedback ---
  const renderFeedback = () => {
    if (answerCorrect) {
      return <p className="correct-feedback">¡Respuesta correcta!</p>;
    } else {
      if (currentQuestion.type === "multiple-choice") {
        if (Array.isArray(currentQuestion.answer)) {
          return (
            <p className="incorrect-feedback">
              Respuesta incorrecta. Las respuestas correctas son: <strong>{currentQuestion.answer.join(", ")}</strong>
            </p>
          );
        } else {
          return (
            <p className="incorrect-feedback">
              Respuesta incorrecta. La respuesta correcta es: <strong>{currentQuestion.answer}</strong>
            </p>
          );
        }
      } else if (currentQuestion.type === "text") {
        return (
          <p className="incorrect-feedback">
            Respuesta incorrecta. La respuesta correcta es: <strong>{currentQuestion.answer}</strong>
          </p>
        );
      } else if (currentQuestion.type === "matching") {
        return (
          <div className="incorrect-feedback">
            <p>Respuesta incorrecta. Las respuestas correctas son:</p>
            <ul>
              {currentQuestion.pairs.map((pair, index) => (
                <li key={index}>
                  {pair.description}: <strong>{pair.folder}</strong>
                </li>
              ))}
            </ul>
          </div>
        );
      }
    }
  };

  // --- Renderizado de la pregunta según su tipo ---
  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        if (isMultiSelect) {
          // Render para preguntas que permiten seleccionar varias opciones
          return (
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedOptions.includes(option)}
                    onChange={() => toggleOption(option)}
                    disabled={showFeedback}
                  />
                  {option}
                </label>
              ))}
              {!showFeedback && (
                <button onClick={handleMultiSubmit} className="submit-button">Enviar Respuesta</button>
              )}
            </div>
          );
        } else {
          // Render para preguntas de selección única
          return (
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className={`option-button 
                    ${showFeedback && option === currentQuestion.answer ? 'correct' : ''} 
                    ${showFeedback && selectedOption === option && option !== currentQuestion.answer ? 'incorrect' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          );
        }
      case "text":
        return (
          <div className="text-question">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Escribe tu respuesta..."
              disabled={showFeedback}
            />
            {!showFeedback && (
              <button onClick={handleTextSubmit} className="submit-button">Enviar Respuesta</button>
            )}
          </div>
        );
      case "matching":
        {
          // Para preguntas de matching, se utiliza el arreglo de pares
          const folderOptions = currentQuestion.pairs.map(pair => pair.folder);
          return (
            <div className="matching-question">
              {currentQuestion.pairs.map((pair, index) => (
                <div key={index} className="matching-item">
                  <span className="description">{pair.description}</span>
                  <select
                    value={matchingAnswers[index] || ""}
                    onChange={(e) => handleMatchingChange(index, e.target.value)}
                  >
                    <option value="" disabled>Selecciona una opción</option>
                    {folderOptions.map((folder, i) => (
                      <option key={i} value={folder}>{folder}</option>
                    ))}
                  </select>
                </div>
              ))}

              {!showFeedback && (
                <button onClick={handleMatchingSubmit} className="submit-button">Enviar Respuestas</button>
              )}
            </div>
          );
        }
      default:
        return <p>Tipo de pregunta no soportado.</p>;
    }
  };

  return (
    <div className="App">
      <h1>Test {Questions.title}</h1>
      <div className="question-container">
        <h3>{currentQuestion.question}</h3>
        {renderQuestionContent()}
        {showFeedback && (
          <>
            <div className="feedback">
              {renderFeedback()}
            </div>
            <button onClick={handleNext} className="next-button">Siguiente Pregunta</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
