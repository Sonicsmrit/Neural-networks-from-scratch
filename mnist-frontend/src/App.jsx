import { useRef, useEffect, useState } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probs, setProbs] = useState([]);

  useEffect(()=>{
    const canvas = canvasRef.current;
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.width = '500px';
    canvas.style.height = '500px';
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    contextRef.current = ctx;
  }, [])

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = async() => {
    contextRef.current.closePath();
    setIsDrawing(false);
    const imageData = canvasRef.current.toDataURL('image/png')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    })
    const result = await response.json();
    setPrediction(result.prediction);
    setProbs(result.probabilities);
  };

  const clear = ()=>{
    const canvas = canvasRef.current;
    contextRef.current.fillStyle = '#ffffff';
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
    setProbs([]);
  }

  const sorted = [...probs]
    .map((prob, i) => ({ digit: i, prob }))
    .sort((a, b) => b.prob - a.prob);

  return (
    <div className="container">

      {/* LEFT */}
      <div className="left">
        <h2>DRAW A DIGIT BETWEEN 0-9</h2>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <button className="clear-btn" onClick={clear}>🗑️ CLEAR</button>
      </div>

      {/* RIGHT */}
      <div className="right">

        <div className="prediction-box">
          <p className="label">PREDICTION</p>
          <p className="number">{prediction !== null ? prediction : '?'}</p>
          {sorted.length > 0 && (
            <p className="confidence">{(sorted[0].prob * 100).toFixed(1)}% confidence</p>
          )}
        </div>

        <div className="rankings-box">
          <p className="label">RANKINGS</p>
          {sorted.map((item, rank) => (
            <div className="rank-row" key={item.digit}>
              <span className="rank-num">#{rank + 1}</span>
              <span className="rank-digit">{item.digit}</span>
              <div className="bar-bg">
                <div
                  className={`bar-fill ${rank === 0 ? 'top' : 'rest'}`}
                  style={{ width: `${(item.prob * 100).toFixed(1)}%` }}
                />
              </div>
              <span className="rank-prob">{(item.prob * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App