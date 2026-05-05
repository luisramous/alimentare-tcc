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

# 2. Rota de Análise ajustada para ser PROFUNDA
@router.post("/analyze")
async def analyze_food(req: AnalysisRequest, db: Session = Depends(get_db)):
    print(f"🤖 Iniciando análise profunda para: {req.nome}")

    # Tenta formatar a tabela para a IA ler
    nutri_info = "Não fornecida"
    if req.tabela:
        nutri_info = ", ".join([f"{k}: {v}" for k, v in req.tabela.items() if v is not None])

    prompt = f"""
    Analise o produto "{req.nome}" da marca "{req.marca}".
    Ingredientes: {req.ingredientes}.
    Dados Nutricionais (por 100g): {nutri_info}.
    Nota Nutri-Score Atual: {req.nutriscore_atual}.

    Sua missão:
    1. Identifique Alergênicos (glúten, lactose, soja, etc).
    2. Identifique Aditivos (traduza códigos INS e explique riscos).
    3. Se a nota atual for "N/A", use os dados nutricionais para calcular a nota correta (A, B, C, D ou E).
    4. Dê um veredito técnico e uma sugestão saudável.

    Retorne APENAS um JSON puro com as chaves: 
    "alergicos", "aditivos", "veredito", "sugestao", "nutriscore_ia"
    """

    try:
        # Tenta a primeira vez com o modelo principal (Flash)
        response = model.generate_content(prompt)
        res_text = response.text.strip()
    except Exception as e:
        # Se o erro for cota (429), tentamos um modelo alternativo (Pro)
        if "429" in str(e):
            print("⚠️ Cota do Flash atingida, tentando modelo Pro...")
            try:
                model_alt = genai.GenerativeModel('models/gemini-1.5-pro')
                response = model_alt.generate_content(prompt)
                res_text = response.text.strip()
            except Exception as e2:
                print(f"❌ Ambos os modelos sem cota: {e2}")
                return {
                    "veredito": "O Google Gemini está temporariamente sobrecarregado.",
                    "alergicos": "Aguarde 60 segundos.",
                    "aditivos": "Aguarde 60 segundos.",
                    "sugestao": "Tente novamente em instantes.",
                    "nutriscore_ia": req.nutriscore_atual
                }
        else:
            print(f"❌ Erro na IA: {e}")
            return {"veredito": "Erro ao processar análise."}

    # Bloco de tratamento do JSON que você já tem...
    try:
        if "{" in res_text:
            res_text = res_text[res_text.find("{"):res_text.rfind("}")+1]
        analise = json.loads(res_text)
        for k in analise: analise[k] = str(analise[k])
        return analise
    except:
        return {"veredito": "Erro no formato da resposta da IA."}
def calcular_nutriscore_manual(energia, acucar, gord_sat, sodio, fibra, proteina):
    pontos_negativos = 0
    # Energia
    if energia > 800: pontos_negativos += 10
    elif energia > 160: pontos_negativos += 2
    # Açúcar
    if acucar > 45: pontos_negativos += 10
    elif acucar > 4.5: pontos_negativos += 1
    # Gordura Sat.
    if gord_sat > 10: pontos_negativos += 10
    elif gord_sat > 1: pontos_negativos += 1
    # Sódio
    if sodio > 900: pontos_negativos += 10
    elif sodio > 90: pontos_negativos += 1
    
    pontos_positivos = 0
    if fibra > 4.7: pontos_positivos += 5
    if proteina > 8: pontos_positivos += 5
    
    res = pontos_negativos - pontos_positivos
    if res <= -1: return "A"
    elif res <= 2: return "B"
    elif res <= 10: return "C"
    elif res <= 18: return "D"
    else: return "E"

@router.post("/manual")
async def save_manual_food(req: AnalysisRequest, db: Session = Depends(get_db)):
    try:
        # 1. Calcula a nota Nutri-Score com base nos valores recebidos
        nota_calculada = calcular_nutriscore_manual(
            req.energia_kcal, req.acucares_g, req.gordura_sat_g, 
            req.sodio_mg, req.fibras_g, req.proteinas_g
        )

        # 2. Cria o novo objeto do banco mapeando todos os campos
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
            nutriscore=nota_calculada
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        # 3. Retorna o objeto completo para o React abrir a página de detalhes na hora
        return {
            "mensagem": "Sucesso", 
            "produto_completo": {
                "nome": novo_produto.nome,
                "marca": novo_produto.marca,
                "ingredientes": novo_produto.ingredientes,
                "nutriscore": novo_produto.nutriscore,
                "imagem": novo_produto.imagem,
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
        print(f"❌ Erro detectado no salvamento: {e}")
        raise HTTPException(status_code=500, detail="Erro ao salvar dados no banco de dados.")