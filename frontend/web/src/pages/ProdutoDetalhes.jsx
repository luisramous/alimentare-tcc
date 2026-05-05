import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, List, AlertTriangle, CheckCircle, Sparkles, Info } from "lucide-react";

export default function ProdutoDetalhes() {
  const { nome } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Tenta pegar o produto que veio da Home. Se não existir, começa como null.
  const [produto, setProduto] = useState(location.state?.food || null);
  const [loading, setLoading] = useState(!location.state?.food);

  // Estados para a Análise da IA
  const [analiseIA, setAnaliseIA] = useState(null);
  const [loadingIA, setLoadingIA] = useState(false);

  useEffect(() => {
    // Busca os dados apenas se não vieram da Home (ex: F5 na página)
    if (!produto) {
      const buscarDadosProduto = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://127.0.0.1:8000/foods/search?query=${encodeURIComponent(nome)}`);
          const data = await response.json();
          if (data && data.length > 0) {
            setProduto(data[0]);
          }
        } catch (error) {
          console.error("Erro ao carregar detalhes:", error);
        } finally {
          setLoading(false);
        }
      };
      buscarDadosProduto();
    }
  }, [nome, produto]);

 const realizarAnaliseIA = async () => {
    if (!produto?.ingredientes) return;
    setLoadingIA(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/foods/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nome: produto.nome, 
          ingredientes: produto.ingredientes,
          marca: produto.marca,
          imagem: produto.imagem,
          tabela: produto.tabela,           // 👈 AGORA ENVIA A TABELA
          nutriscore_atual: produto.nutriscore // 👈 AGORA ENVIA A NOTA ATUAL
        })
      });
      const data = await response.json();
      setAnaliseIA(data);
    } catch (e) {
      console.error("Erro na análise:", e);
      // Se for erro de cota, a mensagem no seu backend já vai retornar um JSON amigável, 
      // mas este alert ajuda caso o servidor nem responda.
      alert("🤖 A Inteligência Artificial está muito ocupada agora. Por favor, aguarde cerca de 30 a 60 segundos e tente novamente.");
    } finally {
      setLoadingIA(false);
    }
  };

  const getNutriColor = (score) => {
    const colors = { A: "#038141", B: "#85BB2F", C: "#FECB02", D: "#EE8100", E: "#E63E11" };
    return colors[score] || "#555";
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center", color: "#666" }}>Carregando detalhes do produto...</div>;
  if (!produto) return <div style={{ padding: "100px", textAlign: "center", color: "#666" }}>Produto não encontrado.</div>;

  return (
    <main style={{ background: "#fdfdfd", minHeight: "100vh", padding: "40px 5%", fontFamily: "sans-serif" }}>
      
      {/* BOTÃO VOLTAR */}
      {/* --- BOTÃO VOLTAR PREMIUM --- */}
<button 
  onClick={() => navigate(-1)} 
  style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    background: "white", 
    border: "1px solid #e2e8f0",
    color: "#475569", // Um cinza azulado elegante
    padding: "10px 20px",
    borderRadius: "15px",
    fontWeight: "700", 
    marginBottom: "40px", 
    cursor: "pointer", 
    fontSize: "14px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none"
  }}
  // Efeito de movimento para a esquerda ao passar o mouse
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = "#f8fafc";
    e.currentTarget.style.transform = "translateX(-5px)";
    e.currentTarget.style.color = "#27ae60"; // Muda para verde no hover
    e.currentTarget.style.borderColor = "#27ae60";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.transform = "translateX(0)";
    e.currentTarget.style.color = "#475569";
    e.currentTarget.style.borderColor = "#e2e8f0";
  }}
>
  <ArrowLeft size={18} strokeWidth={2.5} /> 
  <span>Voltar para os resultados</span>
</button>

      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "60px", flexWrap: "wrap" }}>
          
          {/* COLUNA ESQUERDA: IMAGEM E INFO BÁSICA */}
          <div style={{ flex: 1, minWidth: "300px", textAlign: "center" }}>
            <div style={{ 
              backgroundColor: "white", padding: "40px", borderRadius: "40px", 
              boxShadow: "0 20px 50px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0",
              display: "flex", alignItems: "center", justifyContent: "center", height: "350px"
            }}>
              <img 
                src={produto.imagem || "https://via.placeholder.com/300?text=Sem+Foto"} 
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} 
                alt={produto.nome} 
              />
            </div>
            <h1 style={{ color: "#1a2a3a", fontSize: "32px", marginTop: "30px", marginBottom: "5px" }}>{produto.nome}</h1>
            <p style={{ color: "#95a5a6", fontSize: "18px", marginBottom: "20px" }}>{produto.marca}</p>
            
            <div style={{ 
              display: "inline-block", padding: "12px 25px", 
              backgroundColor: getNutriColor(produto.nutriscore), color: "white", 
              borderRadius: "15px", fontWeight: "bold", fontSize: "18px" 
            }}>
              Nutri-Score Oficial: {produto.nutriscore}
            </div>
          </div>

          {/* COLUNA DIREITA: IA E INGREDIENTES */}
          <div style={{ flex: 1.5, minWidth: "350px" }}>
            
            {/* BOX DA INTELIGÊNCIA ARTIFICIAL */}
            <div style={{ 
              backgroundColor: "white", padding: "35px", borderRadius: "35px", 
              boxShadow: "0 20px 50px rgba(0,0,0,0.05)", marginBottom: "30px", 
              border: "2px solid #f0f9f4", position: "relative", overflow: "hidden"
            }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#2c3e50", marginBottom: "20px" }}>
                <Brain color="#2ecc71" size={28} /> Análise Inteligente IA
              </h3>

              {!analiseIA ? (
                <div style={{ textAlign: "center", padding: "10px" }}>
                  <p style={{ color: "#7f8c8d", lineHeight: "1.7", marginBottom: "20px" }}>
                    Clique no botão abaixo para que nossa IA identifique alergênicos e explique os aditivos químicos presentes.
                  </p>
                  <button 
                    onClick={realizarAnaliseIA}
                    disabled={loadingIA}
                    style={{ 
                      backgroundColor: "#2ecc71", color: "white", border: "none", padding: "15px 30px", 
                      borderRadius: "15px", fontWeight: "bold", cursor: "pointer", fontSize: "16px",
                      display: "flex", alignItems: "center", gap: "10px", margin: "0 auto",
                      opacity: loadingIA ? 0.7 : 1
                    }}
                  >
                    {loadingIA ? "Analisando..." : <><Sparkles size={18}/> Gerar Relatório IA</>}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "left", animation: "fadeIn 0.5s ease-in" }}>
                  
                  {/* Seção Alergênicos */}
                  <div style={{ backgroundColor: "#fff5f5", padding: "15px", borderRadius: "15px", marginBottom: "15px", border: "1px solid #fed7d7" }}>
                    <h4 style={{ color: "#c53030", margin: "0 0 5px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <AlertTriangle size={18}/> Alergênicos
                    </h4>
                    <p style={{ fontSize: "14px", color: "#742a2a", margin: 0 }}>{analiseIA.alergicos}</p>
                  </div>

                  {/* Seção Aditivos */}
                  <div style={{ marginBottom: "15px" }}>
                    <strong style={{ fontSize: "15px", color: "#2c3e50" }}>🧪 Aditivos e Química:</strong>
                    <p style={{ fontSize: "14px", color: "#4a5568", marginTop: "5px", lineHeight: "1.5" }}>{analiseIA.aditivos}</p>
                  </div>

                  {/* Adicione isso dentro do bloco {analiseIA && (...)} */}
{analiseIA.nutriscore_ia && (produto.nutriscore === "N/A" || produto.nutriscore === "n/a") && (
  <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "10px", border: "1px solid #c8e6c9" }}>
    <strong style={{ color: "#2e7d32" }}>📊 Nota estimada pela IA: {analiseIA.nutriscore_ia}</strong>
  </div>
)}

                  {/* --- SEÇÃO DE VEREDITO PREMIUM --- */}
<div style={{ 
  // O fundo muda para um tom avermelhado se a IA detectar que é ultraprocessado
  backgroundColor: analiseIA.veredito.toLowerCase().includes('ultra') ? "#fef2f2" : "#f0fdf4", 
  padding: "25px", 
  borderRadius: "25px", 
  // Barra lateral grossa que dá o tom de "Relatório Técnico"
  borderLeft: `6px solid ${analiseIA.veredito.toLowerCase().includes('ultra') ? '#ef4444' : '#2ecc71'}`,
  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
  transition: "all 0.3s ease"
}}>
  <h4 style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    color: "#0f172a", 
    margin: "0 0 12px 0", 
    fontSize: "17px",
    fontWeight: "800"
  }}>
    <CheckCircle size={20} color={analiseIA.veredito.toLowerCase().includes('ultra') ? '#ef4444' : '#2ecc71'} /> 
    Veredito Final
  </h4>
  
  <p style={{ 
    fontSize: "15px", 
    color: "#334155", 
    margin: 0, 
    fontWeight: "500", 
    lineHeight: "1.6" 
  }}>
    {analiseIA.veredito}
  </p>

  {/* Divisor discreto para a sugestão */}
  <div style={{ 
    marginTop: "15px", 
    paddingTop: "15px", 
    borderTop: "1px dashed rgba(0,0,0,0.1)" 
  }}>
    <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
      <strong style={{ color: "#0f172a" }}>💡 Dica do Alimentare:</strong> {analiseIA.sugestao}
    </p>
  </div>
</div>

                </div>
              )}
            </div>

            {/* --- BOX DE INGREDIENTES ORIGINAIS PREMIUM --- */}
<div style={{ 
  backgroundColor: "#ffffff", 
  padding: "35px", 
  borderRadius: "35px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
  marginTop: "20px"
}}>
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    marginBottom: "20px" 
  }}>
    <div style={{ 
      backgroundColor: "#eff6ff", // Azul clarinho para dados factuais
      padding: "10px", 
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#3b82f6"
    }}>
      <List size={22} strokeWidth={3} />
    </div>
    <h3 style={{ 
      color: "#0f172a", 
      fontSize: "18px", 
      fontWeight: "800",
      margin: 0,
      letterSpacing: "-0.5px"
    }}>
      Ingredientes no Rótulo
    </h3>
  </div>

  <div style={{ 
    backgroundColor: "#f8fafc", 
    padding: "25px", 
    borderRadius: "20px",
    border: "1px solid #f1f5f9"
  }}>
    <p style={{ 
      color: "#475569", 
      lineHeight: "1.8", 
      fontSize: "14px", 
      margin: 0,
      fontFamily: "'Inter', sans-serif",
      textAlign: "justify",
      hyphens: "auto"
    }}>
      {produto.ingredientes}
    </p>
  </div>
  
  <div style={{ 
    marginTop: "15px", 
    display: "flex", 
    alignItems: "center", 
    gap: "6px",
    color: "#94a3b8",
    fontSize: "12px" 
  }}>
    <Info size={14} />
    <span>Informações extraídas da base de dados global</span>
  </div>
</div>
            {/* --- INÍCIO DA TABELA NUTRICIONAL --- */}
{/* --- TABELA NUTRICIONAL PREMIUM --- */}
<div style={{ 
  backgroundColor: "white", 
  padding: "35px", 
  borderRadius: "35px", 
  boxShadow: "0 15px 40px rgba(0,0,0,0.04)",
  marginTop: "30px",
  border: "1px solid #f1f5f9",
  position: "relative"
}}>
  {/* Cabeçalho da Tabela */}
  <div style={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "25px" 
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ 
        backgroundColor: "#f0f9ff", 
        padding: "8px", 
        borderRadius: "10px",
        display: "flex",
        alignItems: "center"
      }}>
        <Info color="#0ea5e9" size={20} />
      </div>
      <h3 style={{ color: "#0f172a", fontSize: "18px", fontWeight: "800", margin: 0 }}>
        Tabela Nutricional
      </h3>
    </div>
    
    {/* Badge de referência */}
    <span style={{ 
      fontSize: "11px", 
      backgroundColor: "#f1f5f9", 
      color: "#64748b", 
      padding: "5px 12px", 
      borderRadius: "20px", 
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    }}>
      Por 100g / ml
    </span>
  </div>

  {/* Grid de Informações */}
  <div style={{ 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
    gap: "12px" 
  }}>
    <NutriRow label="Energia" value={`${produto.tabela?.energia || 0} kcal`} />
    <NutriRow label="Açúcares" value={`${produto.tabela?.acucares || 0} g`} />
    <NutriRow label="Gord. Saturada" value={`${produto.tabela?.gordura_sat || 0} g`} />
    <NutriRow label="Sódio" value={`${Math.round(produto.tabela?.sodio || 0)} mg`} />
    <NutriRow label="Proteínas" value={`${produto.tabela?.proteinas || 0} g`} />
    <NutriRow label="Fibras" value={`${produto.tabela?.fibras || 0} g`} />
  </div>
</div>
{/* --- FIM DA TABELA NUTRICIONAL --- */}
          </div>
        </div>
      </section>
    </main>
  );
}
function NutriRow({ label, value }) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "14px 18px", 
      backgroundColor: "#f8fafc", // Fundo neutro ultra leve
      borderRadius: "16px",
      border: "1px solid #f1f5f9",
      transition: "transform 0.2s ease"
    }}>
      <span style={{ 
        color: "#64748b", 
        fontSize: "13px", 
        fontWeight: "600" 
      }}>
        {label}
      </span>
      <span style={{ 
        color: "#0f172a", 
        fontSize: "15px", 
        fontWeight: "800" 
      }}>
        {value}
      </span>
    </div>
  );
}