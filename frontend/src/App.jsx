import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import "./App.css";
export default function App() {
  const [result, setResult] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/analyze" element={<AnalyzePage onResult={setResult} />} />
      <Route path="/results" element={<ResultsPage result={result} />} />
    </Routes>
  );
}