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
      const response = await fetch(`http://127.0.0.1:8000/foods/search?query=${query}`);
      const data = await response.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
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
    <main style={{ background: "linear-gradient(to bottom, #f0f9f4, #ffffff)", minHeight: "100vh" }}>
      <section style={{ textAlign: "center", padding: "80px 5%" }}>
        <h1 style={{ fontSize: "50px", color: "#1a2a3a", fontWeight: "800" }}>Descubra o que você <span style={{color:"#2ecc71"}}>realmente</span> <span style={{color:"#3498db"}}>come</span></h1>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", maxWidth: "600px", margin: "30px auto" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={20} style={{ position: "absolute", left: "15px", top: "15px", color: "#999" }} />
            <input type="text" placeholder="Busque um alimento..." value={query} onChange={(e)=>setQuery(e.target.value)} style={{ width: "100%", padding: "15px 15px 15px 45px", borderRadius: "50px", border: "1px solid #ddd", fontSize: "16px", outline: "none" }} />
          </div>
          <button onClick={searchFoods} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "0 30px", borderRadius: "50px", fontWeight: "bold", cursor: "pointer" }}>{loading ? "..." : "Analisar"}</button>
        </div>

        <button style={{ background: "white", border: "1px solid #2ecc71", color: "#2ecc71", padding: "10px 20px", borderRadius: "50px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Plus size={18} /> Cadastrar Alimento
        </button>
      </section>

      {foods.length === 0 && !loading && (
        <section style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", padding: "0 5% 50px" }}>
          <BenefitCard icon={<Brain color="#2ecc71"/>} title="IA Avançada" desc="Análise automatizada de ingredientes." />
          <BenefitCard icon={<Database color="#3498db"/>} title="+2M Produtos" desc="Base global atualizada diariamente." />
          <BenefitCard icon={<Users color="#e67e22"/>} title="Para Todos" desc="Informações claras para sua família." />
        </section>
      )}

      <section style={{ padding: "0 5% 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "25px" }}>
          {foods.map((f, i) => (
            <div key={i} style={{ backgroundColor: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 15, right: 15, backgroundColor: getNutriColor(f.nutriscore), color: "white", padding: "5px 10px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px" }}>{f.nutriscore}</div>
              <img src={f.imagem || "https://via.placeholder.com/150"} style={{ width: "100%", height: "140px", objectFit: "contain", marginBottom: "15px" }} />
              <h4 style={{ margin: "0 0 5px" }}>{f.nome}</h4>
              <p style={{ fontSize: "13px", color: "#999" }}>{f.marca}</p>
              <button style={{ width: "100%", marginTop: "15px", padding: "10px", borderRadius: "10px", border: "1.5px solid #2ecc71", color: "#2ecc71", background: "none", fontWeight: "bold", cursor: "pointer" }}>Detalhes</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}