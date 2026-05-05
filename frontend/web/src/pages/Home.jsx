import { useState, useEffect } from "react"; // Adicionado useEffect
import { Brain, Database, Users, Search, Plus } from "lucide-react";
import BenefitCard from "../components/BenefitCard";
import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  // Inicia tentando recuperar o que estava salvo na memória do navegador
  const [query, setQuery] = useState(sessionStorage.getItem("ultimaBusca") || "");
  const [foods, setFoods] = useState(JSON.parse(sessionStorage.getItem("ultimosResultados")) || []);
  const [loading, setLoading] = useState(false);
  const [showFormManual, setShowFormManual] = useState(false); 
  const [nomeManual, setNomeManual] = useState("");
  const [ingredientesManual, setIngredientesManual] = useState("");
  const [energiaManual, setEnergiaManual] = useState("");
  const [acucarManual, setAcucarManual] = useState("");
  const [gorduraManual, setGorduraManual] = useState("");
  const [sodioManual, setSodioManual] = useState("");
  const [proteinaManual, setProteinaManual] = useState("");
  const [fibraManual, setFibraManual] = useState("");
  const navigate = useNavigate(); // Para poder mudar de página
  const [imagemManual, setImagemManual] = useState(""); // Novo estado para foto

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
        // --- ADICIONADO PARA PERSISTÊNCIA ---
        sessionStorage.setItem("ultimaBusca", query);
        sessionStorage.setItem("ultimosResultados", JSON.stringify(data));
        // ------------------------------------
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

const cadastrarProdutoManual = async () => {
    if (!nomeManual || !ingredientesManual) {
      alert("Preencha ao menos o nome e os ingredientes!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/foods/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeManual,
          ingredientes: ingredientesManual,
          marca: "Manual",
          imagem: imagemManual || "",
          energia_kcal: parseFloat(energiaManual) || 0,
          acucares_g: parseFloat(acucarManual) || 0,
          gordura_sat_g: parseFloat(gorduraManual) || 0,
          sodio_mg: parseFloat(sodioManual) || 0,
          proteinas_g: parseFloat(proteinaManual) || 0,
          fibras_g: parseFloat(fibraManual) || 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert("✅ Produto cadastrado com sucesso!");
        
        // Redireciona para os detalhes do produto que você acabou de criar
        navigate(`/produto/${encodeURIComponent(nomeManual)}`, { 
          state: { food: data.produto_completo } 
        });
      } else {
        alert("Erro no servidor ao salvar.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão.");
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", boxSizing: "border-box"
  };

  const labelNutriStyle = {
    display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "600", color: "#64748b"
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
        <button 
          onClick={() => setShowFormManual(!showFormManual)} 
          style={{ 
            marginTop: "32px", 
            background: showFormManual ? "#f8f9fa" : "white", 
            border: "1px solid #e0e0e0", 
            color: showFormManual ? "#e74c3c" : "#27ae60", 
            padding: "12px 28px", 
            borderRadius: "12px", 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            fontWeight: "600", 
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
            transition: "0.2s"
          }}
        >
          <Plus size={18} style={{ transform: showFormManual ? 'rotate(45deg)' : 'none', transition: '0.3s' }} /> 
          {showFormManual ? "Cancelar Cadastro" : "Cadastrar Alimento"}
        </button>

        {/* --- FORMULÁRIO DE CADASTRO MANUAL (Com Tabela Nutricional para o TCC) --- */}
        {showFormManual && (
          <div style={{ 
            marginTop: "30px", 
            maxWidth: "700px", 
            margin: "30px auto", 
            padding: "40px", 
            backgroundColor: "white", 
            borderRadius: "32px", 
            boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
            textAlign: "left",
            border: "1px solid #f1f3f5"
          }}>
            <h3 style={{ color: "#1a2a3a", fontSize: "22px", marginBottom: "8px" }}>Novo Produto Manual</h3>
            <p style={{ color: "#95a5a6", fontSize: "14px", marginBottom: "25px" }}>
              Preencha os dados abaixo para que o sistema calcule o Nutri-Score e realize a análise por IA.
            </p>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#4b5563" }}>Nome do Alimento</label>
              <input type="text" placeholder="Ex: Pão de Queijo da Casa" value={nomeManual} onChange={(e) => setNomeManual(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#4b5563" }}>Lista de Ingredientes</label>
              <textarea placeholder="Ex: Polvilho doce, queijo minas, ovos..." value={ingredientesManual} onChange={(e) => setIngredientesManual(e.target.value)} style={{ ...inputStyle, height: "100px", resize: "none" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#4b5563" }}>Link da Imagem (URL)</label>
              <input type="text" placeholder="Cole o link de uma foto do Google..." value={imagemManual} onChange={(e) => setImagemManual(e.target.value)} style={inputStyle} />
            </div>
            
            {/* --- GRID DA TABELA NUTRICIONAL (Por 100g) --- */}
            <label style={{ display: "block", marginBottom: "15px", fontWeight: "700", color: "#1a2a3a", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Tabela Nutricional (por 100g/ml)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <div>
                <label style={labelNutriStyle}>Energia (kcal)</label>
                <input type="number" placeholder="0" value={energiaManual} onChange={(e)=>setEnergiaManual(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelNutriStyle}>Açúcares (g)</label>
                <input type="number" placeholder="0" value={acucarManual} onChange={(e)=>setAcucarManual(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelNutriStyle}>Gordura Saturada (g)</label>
                <input type="number" placeholder="0" value={gorduraManual} onChange={(e)=>setGorduraManual(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelNutriStyle}>Sódio (mg)</label>
                <input type="number" placeholder="0" value={sodioManual} onChange={(e)=>setSodioManual(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelNutriStyle}>Proteínas (g)</label>
                <input type="number" placeholder="0" value={proteinaManual} onChange={(e)=>setProteinaManual(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelNutriStyle}>Fibras (g)</label>
                <input type="number" placeholder="0" value={fibraManual} onChange={(e)=>setFibraManual(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <button 
              onClick={cadastrarProdutoManual}
              style={{ width: "100%", backgroundColor: "#2ecc71", color: "white", border: "none", padding: "16px", borderRadius: "16px", fontWeight: "700", cursor: "pointer", fontSize: "16px" }}
            >
              Salvar Alimento e Calcular Score
            </button>
          </div>
        )}

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
    gap: "40px" 
  }}>
    {foods.map((f, i) => (
      <Link 
        to={`/produto/${encodeURIComponent(f.nome)}`} 
        state={{ food: f }} 
        key={i} 
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div 
          style={{ 
            backgroundColor: "white", 
            borderRadius: "32px", 
            boxShadow: "0 10px 40px rgba(0,0,0,0.03)", 
            textAlign: "center", // Centraliza todo o texto do card
            position: "relative",
            border: "1px solid #f1f5f9",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(39, 174, 96, 0.1)";
            e.currentTarget.style.borderColor = "#2ecc71";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.03)";
            e.currentTarget.style.borderColor = "#f1f5f9";
          }}
        >
          {/* Badge de Origem */}
          <div style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            backgroundColor: f.origem === "local" ? "#e0f2fe" : "#f1f5f9",
            color: f.origem === "local" ? "#0369a1" : "#64748b",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "10px",
            fontWeight: "700",
            textTransform: "uppercase",
            zIndex: 2
          }}>
            {f.origem === "local" ? "✓ Seu Banco" : "API Global"}
          </div>

          {/* Badge Nutri-Score */}
          <div style={{ 
            position: "absolute", 
            top: "16px", 
            right: "16px", 
            backgroundColor: getNutriColor(f.nutriscore), 
            color: "white", 
            padding: "10px 18px", 
            borderRadius: "18px", 
            fontWeight: "900", 
            fontSize: "16px",
            boxShadow: `0 8px 20px ${getNutriColor(f.nutriscore)}44`,
            zIndex: 2,
            border: "3px solid white"
          }}>
            {f.nutriscore}
          </div>
          
          {/* Área da Imagem */}
          <div style={{ 
            height: "240px", 
            background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "30px",
            position: "relative"
          }}>
            <img 
              src={f.imagem || "https://via.placeholder.com/200x200?text=Sem+Foto"} 
              alt={f.nome} 
              style={{ 
                maxHeight: "100%", 
                maxWidth: "100%", 
                objectFit: "contain",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.08))"
              }} 
            />
          </div>

          {/* Informações de Texto */}
          <div style={{ padding: "0 28px 28px 28px", flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ 
              color: "#10b981", 
              fontSize: "12px", 
              fontWeight: "700", 
              textTransform: "uppercase", 
              marginBottom: "8px",
              letterSpacing: "1px"
            }}>
              {f.marca || "Marca Própria"}
            </p>
            
            <h3 style={{ 
              fontSize: "18px", 
              color: "#1a2a3a", // Mudado de azul para um cinza bem escuro neutro
              fontWeight: "700", 
              margin: "0 0 12px", 
              lineHeight: "1.4",
              minHeight: "50px", 
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textAlign: "center"
            }}>
              {f.nome}
            </h3>

            {/* Tags de destaque */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
               <span style={{ fontSize: "11px", backgroundColor: "#f8fafc", padding: "4px 10px", borderRadius: "8px", color: "#64748b", border: "1px solid #e2e8f0" }}>
                 {f.tabela?.energia ? `${f.tabela.energia} kcal` : "Info IA"}
               </span>
               <span style={{ fontSize: "11px", backgroundColor: "#f8fafc", padding: "4px 10px", borderRadius: "8px", color: "#64748b", border: "1px solid #e2e8f0" }}>
                 {f.ingredientes?.length > 50 ? "Rótulo Complexo" : "Rótulo Simples"}
               </span>
            </div>
            
            {/* Botão Analisar - AGORA VERDE E CENTRALIZADO */}
            <div 
              style={{ 
                marginTop: "auto",
                width: "100%", 
                padding: "16px", 
                borderRadius: "16px", 
                backgroundColor: "#2ecc71", // Mudado de azul para verde
                color: "white", 
                fontWeight: "700", 
                fontSize: "14px",
                textAlign: "center",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(46, 204, 113, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#27ae60";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2ecc71";
              }}
            >
              Analisar Produto
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>
    </main>
  );
}