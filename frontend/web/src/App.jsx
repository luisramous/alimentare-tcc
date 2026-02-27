import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ComoFunciona from "./pages/ComoFunciona";

export default function App() {
  return (
    <Router>
      <style>{`
        body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; display: block; overflow-x: hidden; }
      `}</style>
      
      <div style={{ fontFamily: "sans-serif", width: "100%", minHeight: "100vh" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<ComoFunciona />} />
        </Routes>
      </div>
    </Router>
  );
}