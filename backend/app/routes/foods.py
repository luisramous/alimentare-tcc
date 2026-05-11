import httpx
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Depends # Adicionado Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session # Adicionado para o Banco
import traceback
import json
import os # Novo import
from dotenv import load_dotenv # Novo import
from app.database import get_db
from app.models.product import Product

# Tenta carregar o arquivo .env
load_dotenv()
CHAVE_API = os.getenv("GEMINI_API_KEY")

# --- TESTE DE SEGURANÇA ---
if not CHAVE_API:
    print("⚠️ ERRO CRÍTICO: Chave API não encontrada no arquivo .env!")
else:
    print("✅ Chave API carregada com sucesso!")

router = APIRouter(prefix="/foods", tags=["foods"])

# --- CONFIGURAÇÃO DA IA ---
genai.configure(api_key=CHAVE_API)
model = genai.GenerativeModel('models/gemini-flash-latest')

class AnalysisRequest(BaseModel):
    nome: str
    ingredientes: str
    marca: str = "Marca desconhecida"
    imagem: str = ""
    tabela: dict = None 
    nutriscore_atual: str = "N/A"
    # Campos numéricos obrigatórios para o cadastro manual:
    energia_kcal: float = 0.0
    acucares_g: float = 0.0
    gordura_sat_g: float = 0.0
    sodio_mg: float = 0.0
    proteinas_g: float = 0.0
    fibras_g: float = 0.0


@router.get("/search")
async def search_food(query: str, db: Session = Depends(get_db)):
    results = []
    
    # 1. BUSCA LOCAL (MySQL)
    try:
        local_products = db.query(Product).filter(Product.nome.contains(query)).all()
        for p in local_products:
            results.append({
                "nome": p.nome,
                "marca": p.marca or "Cadastro Local",
                "imagem": p.imagem or "https://via.placeholder.com/150?text=Sem+Foto",
                "nutriscore": (p.nutriscore or "N/A").upper(),
                "ingredientes": p.ingredientes or "Ingredientes não informados",
                "tabela": {
                    "energia": p.energia_kcal,
                    "acucares": p.acucares_g,
                    "gordura_sat": p.gordura_sat_g,
                    "sodio": p.sodio_mg,
                    "proteinas": p.proteinas_g,
                    "fibras": p.fibras_g
                },
                "origem": "local"
            })
    except Exception as e:
        print(f"Erro MySQL: {e}")

    # 2. BUSCA NA API (Sempre traz tudo, sem esconder nada)
    headers = {"User-Agent": "AlimentareTCC/1.0"}
    url = f"https://br.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=15"
    
    async with httpx.AsyncClient(verify=False, timeout=15.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                for item in data.get("products", []):
                    nutris = item.get("nutriments", {})
                    results.append({
                        "nome": item.get("product_name_pt") or item.get("product_name") or "Sem nome",
                        "marca": item.get("brands", "Marca desconhecida"),
                        "imagem": item.get("image_front_url"),
                        "nutriscore": str(item.get("nutrition_grades", "n/a")).upper(),
                        "ingredientes": item.get("ingredients_text", "Não informados"),
                        "tabela": {
                            "energia": nutris.get("energy-kcal_100g") or 0,
                            "acucares": nutris.get("sugars_100g") or 0,
                            "gordura_sat": nutris.get("saturated-fat_100g") or 0,
                            "sodio": (nutris.get("sodium_100g") or 0) * 1000,
                            "proteinas": nutris.get("proteins_100g") or 0,
                            "fibras": nutris.get("fiber_100g") or 0
                        },
                        "origem": "api"
                    })
        except: pass
    return results

# 2. Rota de Análise PROFUNDA Ajustada (Veredito Direto com Nota)
@router.post("/analyze")
async def analyze_food(req: AnalysisRequest, db: Session = Depends(get_db)):
    print(f"🤖 Analisando via IA: {req.nome} (Nota atual: {req.nutriscore_atual})")

    nutri_info = f"Energia: {req.energia_kcal}kcal, Açúcar: {req.acucares_g}g, Gord.Sat: {req.gordura_sat_g}g, Sódio: {req.sodio_mg}mg, Proteína: {req.proteinas_g}g, Fibra: {req.fibras_g}g"

    prompt = f"""
    Analise o produto "{req.nome}" da marca "{req.marca}".
    A nota Nutri-Score atual deste produto é: {req.nutriscore_atual}.
    Ingredientes: {req.ingredientes}.
    Dados Nutricionais (por 100g): {nutri_info}.

    SUA MISSÃO:
    1. Identifique Alergênicos.
    2. Identifique Aditivos (Traduza o INS).
    3. VEREDITO TÉCNICO: Você DEVE começar o texto confirmando a nota atual (ex: "O produto recebe Nutri-Score {req.nutriscore_atual}..."). 
       Sua função é explicar tecnicamente por que o produto recebeu essa nota, focando nos ingredientes críticos (como maltodextrina, excesso de sal ou gordura) e na Regra dos 11 do Nutri-Score 2024.
    
    ⚠️ IMPORTANTE: 
       - O "nutriscore_ia" deve ser IGUAL ao "{req.nutriscore_atual}", a menos que a nota atual seja "N/A", caso em que você deve calcular a correta.
       - NÃO mencione "NOVA".
       - NÃO mostre cálculos matemáticos.

    Retorne APENAS um JSON puro: 
    {{"alergicos": "", "aditivos": "", "veredito": "", "sugestao": "", "nutriscore_ia": ""}}
    """

    try:
        response = model.generate_content(prompt)
        res_text = response.text.strip()
        if "{" in res_text:
            res_text = res_text[res_text.find("{"):res_text.rfind("}")+1]
        analise = json.loads(res_text)
        return analise
    except Exception as e:
        return {"veredito": "Erro ao processar análise.", "nutriscore_ia": req.nutriscore_atual}


@router.post("/manual")
async def save_manual_food(req: AnalysisRequest, db: Session = Depends(get_db)):
    try:
        # Pergunta a nota para a IA para salvar no banco
        res_ia = model.generate_content(f"Dados: {req.energia_kcal}kcal, {req.acucares_g}g açúcar, {req.sodio_mg}mg sódio. Ingredientes: {req.ingredientes}. Qual a letra do Nutri-Score 2024? Responda apenas a letra (A, B, C, D ou E).")
        nota_ia = res_ia.text.strip().upper()[0]

        novo_produto = Product(
            nome=req.nome,
            marca=req.marca or "Manual",
            ingredientes=req.ingredientes,
            imagem=req.imagem,
            energia_kcal=req.energia_kcal,
            acucares_g=req.acucares_g,
            gordura_sat_g=req.gordura_sat_g,
            sodio_mg=req.sodio_mg,
            proteinas_g=req.proteinas_g,
            fibras_g=req.fibras_g,
            nutriscore=nota_ia
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        return {
            "mensagem": "Sucesso", 
            "produto_completo": {
                "nome": novo_produto.nome,
                "nutriscore": novo_produto.nutriscore,
                "tabela": {
                    "energia": novo_produto.energia_kcal,
                    "acucares": novo_produto.acucares_g,
                    "gordura_sat": novo_produto.gordura_sat_g,
                    "sodio": novo_produto.sodio_mg,
                    "proteinas": novo_produto.proteinas_g,
                    "fibras": novo_produto.fibras_g
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao salvar dados.")