import { Database, Activity, Brain, ShieldCheck } from "lucide-react";

export default function ComoFunciona() {
  return (
    <main style={{ 
      background: "linear-gradient(to bottom, #f0f9f4 0%, #ffffff 100%)", 
      minHeight: "100vh",
      padding: "60px 5%",
      fontFamily: "sans-serif"
    }}>
      {/* --- CABEÇALHO DA PÁGINA --- */}
      <section style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1 style={{ fontSize: "42px", color: "#1a2a3a", fontWeight: "800", marginBottom: "20px" }}>
          Como o <span style={{ color: "#2ecc71" }}>Alimentare</span> Funciona? 🍎
        </h1>
        <p style={{ maxWidth: "750px", margin: "0 auto", color: "#7f8c8d", fontSize: "19px", lineHeight: "1.6" }}>
          Nosso sistema combina grandes bases de dados mundiais com Inteligência Artificial 
          para transformar rótulos confusos em informações que qualquer pessoa consegue entender.
        </p>
      </section>

      {/* --- OS TRÊS PILARES --- */}
      <section style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto 80px"
      }}>
        
        {/* Pilar 1: Dados */}
        <div style={cardStyle}>
          <div style={iconWrapperStyle("#3498db")}>
            <Database color="white" size={30} />
          </div>
          <h3 style={cardTitleStyle}>Base de Dados Global</h3>
          <p style={cardTextStyle}>
            Conectamos em tempo real com o <strong>Open Food Facts</strong>, um projeto colaborativo mundial 
            com mais de 2 milhões de produtos catalogados.
          </p>
        </div>

        {/* Pilar 2: Nutri-Score */}
        <div style={cardStyle}>
          <div style={iconWrapperStyle("#2ecc71")}>
            <Activity color="white" size={30} />
          </div>
          <h3 style={cardTitleStyle}>Cálculo Nutri-Score</h3>
          <p style={cardTextStyle}>
            Utilizamos o algoritmo de classificação europeu que pontua o alimento de <strong>A a E</strong>, 
            baseado no equilíbrio entre nutrientes benéficos e críticos.
          </p>
        </div>

        {/* Pilar 3: Inteligência Artificial */}
        <div style={cardStyle}>
          <div style={iconWrapperStyle("#9b59b6")}>
            <Brain color="white" size={30} />
          </div>
          <h3 style={cardTitleStyle}>Análise por IA</h3>
          <p style={cardTextStyle}>
            Nossa IA analisa a lista de ingredientes para identificar termos técnicos, 
            detectar <strong>alergênicos</strong> e alertar sobre aditivos prejudiciais.
          </p>
        </div>
      </section>

      {/* --- DETALHAMENTO DO NUTRI-SCORE --- */}
      <section style={{ 
        maxWidth: "900px", 
        margin: "0 auto", 
        backgroundColor: "white", 
        padding: "40px", 
        borderRadius: "30px", 
        boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
        border: "1px solid #f0f0f0"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
          <ShieldCheck size={32} color="#27ae60" />
          <h2 style={{ color: "#2c3e50", margin: 0 }}>O que a nota avalia?</h2>
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h4 style={{ color: "#27ae60", marginBottom: "10px" }}>🟢 Pontos Positivos</h4>
            <ul style={listStyle}>
              <li>Teor de Frutas e Vegetais</li>
              <li>Quantidade de Fibras</li>
              <li>Proteínas</li>
              <li>Presença de Oleaginosas (Nozes, etc)</li>
            </ul>
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <h4 style={{ color: "#e74c3c", marginBottom: "10px" }}>🔴 Pontos de Atenção</h4>
            <ul style={listStyle}>
              <li>Valor Energético (Calorias)</li>
              <li>Açúcares Simples</li>
              <li>Gorduras Saturadas</li>
              <li>Sódio (Sal)</li>
            </ul>
          </div>
        </div>
      </section>

      <footer style={{ textAlign: "center", marginTop: "60px", color: "#bdc3c7", fontSize: "14px" }}>
        Trabalho de Conclusão de Curso — IF Baiano Campus Guanambi — 2025
      </footer>
    </main>
  );
}

// --- ESTILOS AUXILIARES ---
const cardStyle = {
  backgroundColor: "white",
  padding: "40px 30px",
  borderRadius: "25px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
  textAlign: "center",
  border: "1px solid #f9f9f9"
};

const iconWrapperStyle = (bgColor) => ({
  backgroundColor: bgColor,
  width: "70px",
  height: "70px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 25px",
  boxShadow: `0 10px 20px ${bgColor}44`
});

const cardTitleStyle = {
  color: "#2c3e50",
  fontSize: "22px",
  marginBottom: "15px",
  fontWeight: "700"
};

const cardTextStyle = {
  color: "#7f8c8d",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: 0
};

const listStyle = {
  paddingLeft: "20px",
  color: "#576574",
  lineHeight: "2",
  fontSize: "15px"
};