from sqlalchemy import Column, Integer, String, Text, Float
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), index=True)
    marca = Column(String(255))
    ingredientes = Column(Text)
    imagem = Column(Text, nullable=True)
    
    # Valores para cálculo do Nutri-Score (por 100g ou 100ml)
    energia_kcal = Column(Float, default=0.0)
    acucares_g = Column(Float, default=0.0)
    gordura_sat_g = Column(Float, default=0.0)
    sodio_mg = Column(Float, default=0.0)
    proteinas_g = Column(Float, default=0.0)
    fibras_g = Column(Float, default=0.0)
    
    nutriscore = Column(String(10), default="N/A")
    
    # Colunas para IA
    alergicos_ia = Column(Text, nullable=True)
    aditivos_ia = Column(Text, nullable=True)
    veredito_ia = Column(Text, nullable=True)
    sugestao_ia = Column(Text, nullable=True)