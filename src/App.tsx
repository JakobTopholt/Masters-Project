import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TypingTest from "./pages/TypingTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/typing-test" element={<TypingTest />} />
      </Routes>
    </Router>
  );
}

export default App;
