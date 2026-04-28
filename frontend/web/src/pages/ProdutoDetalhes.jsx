import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, List, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

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

  // FUNÇÃO PARA SOLICITAR ANÁLISE AO BACKEND (GEMINI)
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
          marca: produto.marca, // ENVIANDO A MARCA
          imagem: produto.imagem // ENVIANDO A IMAGEM PARA SALVAR NO CACHE
        })
      });
      const data = await response.json();
      setAnaliseIA(data);
    } catch (e) {
      console.error("Erro na análise:", e);
      alert("Erro ao conectar com a Inteligência Artificial.");
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
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none",
          color: "#27ae60", fontWeight: "bold", marginBottom: "40px", cursor: "pointer", fontSize: "16px" 
        }}
      >
        <ArrowLeft size={20} /> Voltar para os resultados
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

                  {/* Seção Veredito */}
                  <div style={{ backgroundColor: "#f0fdf4", padding: "15px", borderRadius: "15px", border: "1px solid #dcfce7" }}>
                    <h4 style={{ color: "#166534", margin: "0 0 5px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <CheckCircle size={18}/> Veredito
                    </h4>
                    <p style={{ fontSize: "14px", color: "#166534", fontWeight: "600", margin: 0 }}>{analiseIA.veredito}</p>
                    <p style={{ fontSize: "12px", color: "#166534", marginTop: "8px", fontStyle: "italic" }}>
                      <strong>Sugestão:</strong> {analiseIA.sugestao}
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* BOX DE INGREDIENTES ORIGINAIS */}
            <div style={{ backgroundColor: "#f8f9fa", padding: "35px", borderRadius: "35px" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#2c3e50", marginBottom: "15px" }}>
                <List color="#3498db" size={28} /> Ingredientes no Rótulo
              </h3>
              <p style={{ color: "#576574", lineHeight: "1.8", fontStyle: "italic", fontSize: "14px" }}>
                {produto.ingredientes}
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}