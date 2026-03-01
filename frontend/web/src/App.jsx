import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ComoFunciona from "./pages/ComoFunciona";
import ProdutoDetalhes from "./pages/ProdutoDetalhes"; // 1. Adicionamos esta linha

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
          {/* 2. Adicionamos a rota dinâmica para os produtos abaixo */}
          <Route path="/produto/:nome" element={<ProdutoDetalhes />} />
        </Routes>
      </div>
    </Router>
  );
}