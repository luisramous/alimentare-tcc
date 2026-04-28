from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base           # 1. Importa a conexão
from app.models.product import Product          # 2. Importa o desenho da tabela
from app.routes import predict
from app.routes import foods

# --- 3. ESSA LINHA CRIA AS TABELAS NO MYSQL ASSIM QUE O SERVIDOR LIGA ---
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- Configuração de CORS para liberar o acesso do React ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(foods.router)

@app.get("/")
def read_root():
    return {"mensagem": "API Alimentare com Banco de Dados ativa! 🚀"}