import { useState } from "react";
import { Brain, Database, Users, Search, Plus } from "lucide-react";
import { Link } from "react-router-dom"; // <--- ADICIONE ESTA LINHA
import BenefitCard from "../components/BenefitCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFoods = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Usamos o IP 127.0.0.1 para evitar problemas de rede local
      const response = await fetch(`http://127.0.0.1:8000/foods/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) throw new Error("Erro no servidor");

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setFoods(data);
      } else {
        setFoods([]);
        alert("Nenhum produto encontrado ou o servidor da API está lento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("⚠️ Erro de conexão! Verifique se o terminal do Python está aberto.");
    } finally {
      setLoading(false);
    }
  };

  const getNutriColor = (score) => {
    const colors = { A: "#038141", B: "#85BB2F", C: "#FECB02", D: "#EE8100", E: "#E63E11" };
    return colors[score] || "#555";
  };

  return (
    <main style={{ 
      background: "linear-gradient(to bottom, #f0f9f4 0%, #ffffff 100%)", 
      minHeight: "100vh",
      width: "100%",
      margin: 0,
      padding: 0
    }}>
      
      {/* --- SEÇÃO HERO (TÍTULO E DESCRIÇÃO) --- */}
      <section style={{ textAlign: "center", padding: "100px 5% 40px" }}>
        <h1 style={{ 
          fontSize: "clamp(32px, 5vw, 64px)", 
          color: "#1a2a3a", 
          fontWeight: "800", 
          marginBottom: "24px",
          lineHeight: "1.1",
          letterSpacing: "-1px"
        }}>
          Descubra o que você <span style={{ color: "#2ecc71" }}>realmente</span> <br />
          <span style={{ color: "#3498db" }}>come</span>
        </h1>
        
        <p style={{ 
          maxWidth: "680px", 
          margin: "0 auto 48px", 
          color: "#7f8c8d", 
          fontSize: "20px", 
          lineHeight: "1.6",
          fontWeight: "400"
        }}>
          Análise nutricional inteligente com classificação Nutri-Score, detecção de alergênicos e explicações claras para decisões alimentares mais saudáveis.
        </p>

        {/* BARRA DE BUSCA ESTILO "PILL" */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          gap: "0", 
          maxWidth: "700px", 
          margin: "0 auto",
          backgroundColor: "white",
          padding: "8px",
          borderRadius: "100px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.06)",
          border: "1px solid #eef2f3"
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: "20px" }}>
            <Search size={20} style={{ color: "#95a5a6", marginRight: "12px" }} />
            <input
              type="text"
              placeholder="Experimente buscar por 'Coca-Cola', 'Danone' ou código de barras..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFoods()}
              style={{ 
                width: "100%", 
                border: "none", 
                outline: "none", 
                fontSize: "16px",
                color: "#2c3e50",
                background: "transparent"
              }}
            />
          </div>
          <button 
            onClick={searchFoods} 
            style={{ 
              backgroundColor: "#2ecc71", 
              color: "white", 
              border: "none", 
              padding: "14px 35px", 
              borderRadius: "100px", 
              fontWeight: "700", 
              cursor: "pointer", 
              fontSize: "16px",
              background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
              boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)",
              transition: "transform 0.2s"
            }}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* BOTÃO CADASTRAR ALIMENTO */}
        <button style={{ 
          marginTop: "32px", 
          background: "white", 
          border: "1px solid #e0e0e0", 
          color: "#27ae60", 
          padding: "12px 28px", 
          borderRadius: "12px", 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px", 
          fontWeight: "600", 
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
          transition: "0.2s"
        }}>
          <Plus size={18} /> Cadastrar Alimento
        </button>
      </section>

      {/* --- BENEFÍCIOS --- */}
      {foods.length === 0 && !loading && (
        <section style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap", padding: "40px 5% 100px" }}>
          <Link to="/sobre" style={{ textDecoration: 'none' }}>
            <BenefitCard icon={<Brain color="#2ecc71" size={28} />} title="IA Avançada" desc="Análise automatizada de ingredientes e classificação nutricional." />
          </Link>
          <Link to="/sobre" style={{ textDecoration: 'none' }}>
            <BenefitCard icon={<Database color="#3498db" size={28} />} title="+2M Produtos" desc="Base de dados global atualizada diariamente para você." />
          </Link>
          <Link to="/sobre" style={{ textDecoration: 'none' }}>
            <BenefitCard icon={<Users color="#e67e22" size={28} />} title="Para Todos" desc="Interface acessível e informações claras para toda a família." />
          </Link>
        </section>
      )}

      {/* --- GRID DE RESULTADOS --- */}
<section style={{ padding: "0 5% 100px", boxSizing: "border-box" }}>
  <div style={{ 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
    gap: "32px" 
  }}>
    {foods.map((f, i) => (
  <Link 
    to={`/produto/${encodeURIComponent(f.nome)}`} 
    key={i} 
    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
  >
    <div 
      style={{ 
        backgroundColor: "white", 
        padding: "32px", 
        borderRadius: "32px", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)", 
        textAlign: "center", 
        position: "relative",
        border: "1px solid #f0f2f5",
        transition: "all 0.3s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column"
      }}
      // Efeito de "levitar" o card do produto
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-10px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.04)";
      }}
    >
      {/* Badge Nutri-Score flutuante com sombra */}
      <div style={{ 
        position: "absolute", 
        top: 20, 
        right: 20, 
        backgroundColor: getNutriColor(f.nutriscore), 
        color: "white", 
        padding: "8px 16px", 
        borderRadius: "14px", 
        fontWeight: "800", 
        fontSize: "14px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        zIndex: 2
      }}>
        {f.nutriscore}
      </div>
      
      {/* Moldura da Imagem para destacar o produto */}
      <div style={{ 
        height: "200px", 
        backgroundColor: "#fbfcfd", 
        borderRadius: "20px",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        marginBottom: "24px",
        padding: "15px",
        overflow: "hidden"
      }}>
        <img 
          src={f.imagem || "https://via.placeholder.com/150?text=Sem+Foto"} 
          alt={f.nome} 
          style={{ 
            maxHeight: "100%", 
            maxWidth: "100%", 
            objectFit: "contain",
            filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.08))" 
          }} 
        />
      </div>

      {/* Informações do Texto */}
      <div style={{ flexGrow: 1 }}>
        <h3 style={{ 
          fontSize: "20px", 
          color: "#1a2a3a", 
          fontWeight: "700", 
          margin: "0 0 8px", 
          minHeight: "48px", 
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {f.nome}
        </h3>
        <p style={{ 
          color: "#95a5a6", 
          fontSize: "15px", 
          fontWeight: "500", 
          marginBottom: "24px" 
        }}>
          {f.marca}
        </p>
      </div>
      
      {/* Mudamos de <button> para <div> para o link funcionar corretamente */}
      <div 
        style={{ 
          width: "100%", 
          padding: "16px", 
          borderRadius: "18px", 
          border: "2px solid #2ecc71", 
          backgroundColor: "transparent", 
          color: "#2ecc71", 
          fontWeight: "700", 
          fontSize: "15px",
          textAlign: "center",
          transition: "all 0.2s ease" 
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#2ecc71";
          e.target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.color = "#2ecc71";
        }}
      >
        Visualizar Detalhes
      </div>
    </div>
  </Link>
))}
  </div>
</section>
    </main>
  );
}