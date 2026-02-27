export default function BenefitCard({ icon, title, desc }) {
  return (
    <div style={{ backgroundColor: "white", padding: "30px 20px", borderRadius: "20px", width: "260px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
      <div style={{ backgroundColor: "#f8f9fa", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        {icon}
      </div>
      <h3 style={{ color: "#2c3e50", fontSize: "18px", marginBottom: "10px" }}>{title}</h3>
      <p style={{ color: "#7f8c8d", fontSize: "14px", lineHeight: "1.5" }}>{desc}</p>
    </div>
  );
}