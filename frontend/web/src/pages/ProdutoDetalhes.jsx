import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Brain, List, Shield, Info } from "lucide-react";

export default function ProdutoDetalhes() {
  const { nome } = useParams(); // Pega o nome da URL
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca os dados do produto específico ao carregar a página
  useEffect(() => {
    const buscarDadosProduto = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/foods/search?query=${encodeURIComponent(nome)}`);
        const data = await response.json();
        
        // Como o backend retorna uma lista, pegamos o primeiro item (o mais provável)
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
  }, [nome]);

  const getNutriColor = (score) => {
    const colors = { A: "#038141", B: "#85BB2F", C: "#FECB02", D: "#EE8100", E: "#E63E11" };
    return colors[score] || "#555";
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Carregando detalhes do produto...</div>;
  if (!produto) return <div style={{ padding: "100px", textAlign: "center" }}>Produto não encontrado.</div>;

  return (
    <main style={{ background: "#fdfdfd", minHeight: "100vh", padding: "40px 5%", fontFamily: "sans-serif" }}>
      
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#27ae60", fontWeight: "bold", marginBottom: "40px" }}>
        <ArrowLeft size={20} /> Voltar para a busca
      </Link>

      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "60px", flexWrap: "wrap" }}>
          
          {/* COLUNA DA ESQUERDA: IMAGEM E NOME */}
          <div style={{ flex: 1, minWidth: "300px", textAlign: "center" }}>
            <div style={{ 
              backgroundColor: "white", padding: "40px", borderRadius: "40px", 
              boxShadow: "0 20px 50px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" 
            }}>
              <img 
                src={produto.imagem || "https://via.placeholder.com/300"} 
                style={{ maxHeight: "350px", maxWidth: "100%", objectFit: "contain" }} 
                alt={produto.nome} 
              />
            </div>
            <h1 style={{ color: "#1a2a3a", fontSize: "32px", marginTop: "30px", marginBottom: "5px" }}>{produto.nome}</h1>
            <p style={{ color: "#95a5a6", fontSize: "18px" }}>{produto.marca}</p>
            
            {/* Badge Nutri-Score Gigante */}
            <div style={{ 
              display: "inline-block", marginTop: "20px", padding: "12px 25px", 
              backgroundColor: getNutriColor(produto.nutriscore), color: "white", 
              borderRadius: "15px", fontWeight: "bold", fontSize: "20px" 
            }}>
              Nutri-Score: {produto.nutriscore}
            </div>
          </div>

          {/* COLUNA DA DIREITA: INFORMAÇÕES E IA */}
          <div style={{ flex: 1.5, minWidth: "350px" }}>
            
            {/* Box da IA (Preparado para o próximo passo) */}
            <div style={{ 
              backgroundColor: "white", padding: "35px", borderRadius: "35px", 
              boxShadow: "0 20px 50px rgba(0,0,0,0.05)", marginBottom: "30px",
              border: "2px solid #f0f9f4"
            }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#2c3e50", marginBottom: "15px" }}>
                <Brain color="#2ecc71" size={28} /> Análise Inteligente Alimentare
              </h3>
              <p style={{ color: "#7f8c8d", lineHeight: "1.7", fontSize: "16px" }}>
                Nossa Inteligência Artificial está pronta para analisar os componentes químicos deste produto.
              </p>
              <button style={{ 
                backgroundColor: "#2ecc71", color: "white", border: "none", padding: "15px 30px", 
                borderRadius: "15px", fontWeight: "bold", marginTop: "15px", cursor: "pointer", fontSize: "16px" 
              }}>
                Gerar Relatório de Saúde
              </button>
            </div>

            {/* Box de Ingredientes */}
            <div style={{ backgroundColor: "#f8f9fa", padding: "35px", borderRadius: "35px" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#2c3e50", marginBottom: "15px" }}>
                <List color="#3498db" size={28} /> Composição Completa
              </h3>
              <p style={{ color: "#576574", lineHeight: "1.8", fontSize: "15px", fontStyle: "italic" }}>
                {produto.ingredientes}
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}