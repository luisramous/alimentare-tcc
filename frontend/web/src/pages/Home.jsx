import { useState } from "react";
import { Brain, Database, Users, Search, Plus } from "lucide-react";
import BenefitCard from "../components/BenefitCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFoods = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/foods/search?query=${query}`);
      const data = await response.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro:", error);
      setFoods([]);
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
            {loading ? "Buscando" : "Buscar"}
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

      {/* --- BENEFÍCIOS (Somente se não houver busca) --- */}
      {foods.length === 0 && !loading && (
        <section style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: "32px", 
          flexWrap: "wrap", 
          padding: "40px 5% 100px" 
        }}>
          <BenefitCard 
            icon={<Brain color="#2ecc71" size={28} />} 
            title="IA Avançada" 
            desc="Análise automatizada de ingredientes e classificação nutricional." 
          />
          <BenefitCard 
            icon={<Database color="#3498db" size={28} />} 
            title="+2M Produtos" 
            desc="Base de dados global atualizada diariamente para você." 
          />
          <BenefitCard 
            icon={<Users color="#e67e22" size={28} />} 
            title="Para Todos" 
            desc="Interface acessível e informações claras para toda a família." 
          />
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
            <div key={i} style={{ 
              backgroundColor: "white", 
              padding: "24px", 
              borderRadius: "28px", 
              boxShadow: "0 20px 40px rgba(0,0,0,0.04)", 
              textAlign: "center", 
              position: "relative",
              border: "1px solid #f8f9fa"
            }}>
              <div style={{ 
                position: "absolute", top: 20, right: 20, 
                backgroundColor: getNutriColor(f.nutriscore), 
                color: "white", padding: "6px 14px", borderRadius: "10px", 
                fontWeight: "800", fontSize: "15px" 
              }}>
                {f.nutriscore}
              </div>
              
              <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <img 
                  src={f.imagem || "https://via.placeholder.com/150"} 
                  alt={f.nome} 
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} 
                />
              </div>

              <h3 style={{ fontSize: "19px", color: "#1a2a3a", fontWeight: "700", margin: "0 0 6px", minHeight: "46px", overflow: "hidden" }}>
                {f.nome}
              </h3>
              <p style={{ color: "#95a5a6", fontSize: "14px", fontWeight: "500", marginBottom: "24px" }}>
                {f.marca}
              </p>
              
              <button style={{ 
                width: "100%", 
                padding: "14px", 
                borderRadius: "16px", 
                border: "2px solid #2ecc71", 
                backgroundColor: "transparent", 
                color: "#2ecc71", 
                fontWeight: "700", 
                cursor: "pointer",
                transition: "0.2s" 
              }}>
                Visualizar Detalhes
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}