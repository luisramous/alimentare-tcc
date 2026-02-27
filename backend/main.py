from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Importação necessária
from app.routes import predict
from app.routes import foods

app = FastAPI()

# --- Configuração de CORS para liberar o acesso do React ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite que o frontend (Vite/React) acesse a API
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

app.include_router(predict.router)
app.include_router(foods.router)

@app.get("/")
def read_root():
    return {"mensagem": "API do TCC funcionando 🚀"}