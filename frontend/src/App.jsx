import { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFoods = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/foods/search?query=${query}`);
      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para definir a cor do Nutri-Score
  const getNutriColor = (score) => {
    const colors = { 
      A: "#038141", // Verde escuro
      B: "#85BB2F", // Verde claro
      C: "#FECB02", // Amarelo
      D: "#EE8100", // Laranja
      E: "#E63E11"  // Vermelho
    };
    return colors[score] || "#555"; // Cinza se não tiver nota
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", backgroundColor: "#1a1a1a", color: "white", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Busca de Alimentos 🍎</h1>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <input
          type="text"
          placeholder="Ex: chocolate, iogurte..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ 
            padding: 12, width: 300, borderRadius: "25px 0 0 25px", border: "1px solid #444", 
            backgroundColor: "#333", color: "white", outline: "none" 
          }}
        />
        <button 
          onClick={searchFoods} 
          style={{ 
            padding: 12, borderRadius: "0 25px 25px 0", border: "none", 
            backgroundColor: "#27ae60", color: "white", fontWeight: "bold", cursor: "pointer" 
          }}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
        {foods.map((food, index) => (
          <div key={index} style={{ 
            backgroundColor: "#2c2c2c", padding: 20, borderRadius: 15, 
            textAlign: "center", position: "relative", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" 
          }}>
            
            {/* Selo Nutri-Score */}
            <div style={{ 
              position: "absolute", top: 15, right: 15, 
              backgroundColor: getNutriColor(food.nutriscore), 
              color: "white", padding: "5px 12px", borderRadius: "8px", 
              fontWeight: "bold", fontSize: "14px"
            }}>
              Nota: {food.nutriscore}
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "10px", padding: 10, marginBottom: 15 }}>
              <img 
                src={food.imagem || "https://via.placeholder.com/150"} 
                alt={food.nome} 
                style={{ width: "100%", height: "150px", objectFit: "contain" }} 
              />
            </div>

            <h3 style={{ fontSize: "18px", margin: "10px 0", minHeight: "45px" }}>{food.nome}</h3>
            <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "15px" }}>{food.marca}</p>
            
            <div style={{ textAlign: "left", fontSize: "12px", color: "#888", marginBottom: "15px", height: "40px", overflow: "hidden" }}>
               <strong>Ingredientes:</strong> {food.ingredientes.substring(0, 80)}...
            </div>

            <button style={{ 
              padding: "10px", width: "100%", borderRadius: "8px", 
              border: "1px solid #27ae60", backgroundColor: "transparent", 
              color: "#27ae60", fontWeight: "bold", cursor: "pointer" 
            }}>
              Analisar com IA 🤖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;