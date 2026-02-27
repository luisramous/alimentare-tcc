export default function ComoFunciona() {
  return (
    <div style={{ padding: "80px 5%", maxWidth: "800px", margin: "0 auto", lineHeight: "1.7" }}>
      <h1 style={{ color: "#27ae60" }}>Como Funciona o Alimentare 🍎</h1>
      <p>O Alimentare é um sistema inteligente que utiliza a base de dados do <strong>Open Food Facts</strong> e algoritmos de <strong>IA</strong> para traduzir rótulos complexos.</p>
      <div style={{ background: "white", padding: "25px", borderRadius: "15px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)", marginTop: "20px" }}>
        <h3>Metodologia Nutri-Score</h3>
        <p>Classificamos os produtos de A a E. A nota considera pontos positivos (fibras, proteínas) e negativos (sódio, açúcar, gordura saturada).</p>
      </div>
    </div>
  );
}