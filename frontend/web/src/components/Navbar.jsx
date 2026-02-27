import { Link } from "react-router-dom";
import { Leaf, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "15px 5%", 
      backgroundColor: "rgba(255, 255, 255, 0.95)", // Leve transparência
      backdropFilter: "blur(10px)", // Efeito de vidro fosco
      borderBottom: "1px solid #f0f0f0",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)" // Sombra bem sutil
    }}>
      
      {/* --- LOGO --- */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        <div style={{ 
          backgroundColor: "#27ae60", 
          padding: "10px", 
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(39, 174, 96, 0.2)"
        }}>
          <Leaf color="white" size={26} />
        </div>
        <div>
          <h2 style={{ 
            margin: 0, 
            color: "#1a2a3a", 
            fontSize: "22px", 
            fontWeight: "800",
            letterSpacing: "-0.5px"
          }}>
            Alimentare
          </h2>
          <span style={{ 
            fontSize: "12px", 
            color: "#7f8c8d", 
            fontWeight: "500",
            display: "block",
            marginTop: "-2px"
          }}>
            Alimentação Inteligente
          </span>
        </div>
      </Link>
      
      {/* --- LINKS CENTRAIS --- */}
      <div style={{ display: "flex", gap: "35px" }}>
        <NavLink to="/sobre">Como Funciona</NavLink>
        <NavLink to="#">Planos</NavLink>
        <NavLink to="#">Contato</NavLink>
      </div>

      {/* --- BOTÕES DE AÇÃO --- */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <button style={{ 
          background: "none", 
          border: "none", 
          color: "#2c3e50", 
          cursor: "pointer", 
          fontWeight: "600",
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "0.2s"
        }}>
          <LogIn size={18} /> Entrar
        </button>

        <button style={{ 
          backgroundColor: "#2ecc71", 
          color: "white", 
          border: "none", 
          padding: "12px 24px", 
          borderRadius: "14px", 
          fontWeight: "700", 
          fontSize: "15px",
          cursor: "pointer", 
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 6px 15px rgba(46, 204, 113, 0.2)",
          transition: "transform 0.2s, background-color 0.2s"
        }}>
          Cadastrar
        </button>
      </div>
    </nav>
  );
}

// Componente auxiliar para os links com estilo padrão
function NavLink({ to, children }) {
  return (
    <Link to={to} style={{ 
      color: "#4b5563", 
      textDecoration: "none", 
      fontWeight: "600",
      fontSize: "15px",
      transition: "0.2s"
    }}>
      {children}
    </Link>
  );
}