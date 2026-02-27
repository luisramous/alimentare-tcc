import { Link } from "react-router-dom";
import { Leaf, LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 5%", backgroundColor: "white", borderBottom: "1px solid #eee" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div style={{ backgroundColor: "#27ae60", padding: "8px", borderRadius: "10px" }}><Leaf color="white" size={24} /></div>
        <div>
          <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}>Alimentare</h2>
          <span style={{ fontSize: "11px", color: "#7f8c8d" }}>Alimentação Inteligente</span>
        </div>
      </Link>
      
      <div style={{ display: "flex", gap: "30px" }}>
        <Link to="/sobre" style={{ color: "#2c3e50", textDecoration: "none", fontWeight: "500" }}>Como Funciona</Link>
        <Link to="#" style={{ color: "#2c3e50", textDecoration: "none", fontWeight: "500" }}>Contato</Link>
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <button style={{ background: "none", border: "none", color: "#2c3e50", cursor: "pointer", fontWeight: "600" }}>Entrar</button>
        <button style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>Cadastrar</button>
      </div>
    </nav>
  );
}