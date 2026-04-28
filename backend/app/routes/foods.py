import httpx
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Depends # Adicionado Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session # Adicionado para o Banco
import traceback
import json

# Imports do seu sistema de banco de dados
from app.database import get_db
from app.models.product import Product

router = APIRouter(prefix="/foods", tags=["foods"])

# --- CONFIGURAÇÃO DA IA (GEMINI) ---
genai.configure(api_key="AIzaSyBnfglEbKUb_XUf6GnKspq03SKzoTMsAmw")
model = genai.GenerativeModel('models/gemini-flash-latest')

class AnalysisRequest(BaseModel):
    nome: str
    ingredientes: str
    marca: str = "Marca desconhecida" # Adicionado
    imagem: str = ""                # Adicionado
    energia_kcal: float = 0.0
    acucares_g: float = 0.0
    gordura_sat_g: float = 0.0
    sodio_mg: float = 0.0
    proteinas_g: float = 0.0
    fibras_g: float = 0.0

@router.get("/search")
async def search_food(query: str, db: Session = Depends(get_db)):
    results = []
    nomes_locais = set()

    # --- 1. BUSCA NO BANCO DE DADOS LOCAL (MySQL) ---
    try:
        print(f"🔎 Consultando MySQL: {query}")
        # Busca produtos no seu banco que contenham a palavra
        local_products = db.query(Product).filter(Product.nome.contains(query)).all()
        
        for p in local_products:
            results.append({
                "nome": p.nome,
                "marca": p.marca or "Cadastro Local",
                "imagem": p.imagem or "https://via.placeholder.com/150?text=Sem+Foto",
                "nutriscore": (p.nutriscore or "N/A").upper(),
                "ingredientes": p.ingredientes or "Ingredientes não informados",
                "origem": "local"
            })
            nomes_locais.add(p.nome.lower().strip())
    except Exception as e:
        print(f"⚠️ Erro MySQL: {e}")

    # --- 2. BUSCA NA API DO OPEN FOOD FACTS (COM IDENTIFICAÇÃO) ---
    # É OBRIGATÓRIO dizer para a API quem você é (User-Agent)
    headers = {
        "User-Agent": "AlimentareTCC - Android/iOS - Version 1.0 - https://github.com/luisramous/alimentare-tcc"
    }
    
    url = f"https://br.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=20"
    
    # Usamos o AsyncClient com limites de tempo bem definidos
    async with httpx.AsyncClient(verify=False) as client:
        try:
            print(f"🌐 Consultando API externa: {query}...")
            response = await client.get(url, headers=headers, timeout=15.0)
          
            if response.status_code == 200:
                data = response.json()
                api_products = data.get("products", [])
                
                for item in api_products:
                    nome_api = item.get("product_name_pt") or item.get("product_name") or "Sem nome"
                    nome_limpo = nome_api.lower().strip()
                    
                    # Se o produto já está no banco, não adicionamos de novo para não duplicar na tela
                    if nome_limpo not in nomes_locais:
                        results.append({
                            "nome": nome_api,
                            "marca": item.get("brands", "Marca desconhecida"),
                            "imagem": item.get("image_front_url"),
                            "nutriscore": str(item.get("nutrition_grades", "n/a")).upper(),
                            "ingredientes": item.get("ingredients_text", "Não informados"),
                            "origem": "api"
                        })
                print(f"✅ Resultados integrados: {len(results)} no total.")

        except Exception as e:
            print(f"❌ API externa falhou ou demorou. Retornando apenas locais. Erro: {e}")

    return results

@router.post("/analyze")
async def analyze_food(req: AnalysisRequest, db: Session = Depends(get_db)):
    print(f"🤖 Iniciando processo para: {req.nome}")

    db_product = db.query(Product).filter(Product.nome == req.nome).first()

    # Se já tem análise completa no banco, retorna (Cache Hit)
    if db_product and db_product.veredito_ia:
        return {
            "alergicos": db_product.alergicos_ia,
            "aditivos": db_product.aditivos_ia,
            "veredito": db_product.veredito_ia,
            "sugestao": db_product.sugestao_ia
        }

    prompt = f"Analise os ingredientes do produto {req.nome}: {req.ingredientes}. Retorne um JSON com: 'alergicos', 'aditivos', 'veredito', 'sugestao'. Responda em português brasileiro."

    try:
        response = model.generate_content(prompt)
        res_text = response.text.strip()
        if "{" in res_text:
            res_text = res_text[res_text.find("{"):res_text.rfind("}")+1]
        
        analise = json.loads(res_text)

        # SALVAMENTO NO BANCO (Garantindo Imagem e Marca)
        if db_product:
            db_product.alergicos_ia = str(analise['alergicos'])
            db_product.aditivos_ia = str(analise['aditivos'])
            db_product.veredito_ia = str(analise['veredito'])
            db_product.sugestao_ia = str(analise['sugestao'])
            # Atualiza a imagem e marca caso não existissem no banco
            if not db_product.imagem: db_product.imagem = req.imagem
            if not db_product.marca: db_product.marca = req.marca
        else:
            novo_cache = Product(
                nome=req.nome,
                marca=req.marca,
                ingredientes=req.ingredientes,
                nutriscore="N/A",
                imagem=req.imagem, # SALVA O LINK DA IMAGEM DA API
                alergicos_ia=str(analise['alergicos']),
                aditivos_ia=str(analise['aditivos']),
                veredito_ia=str(analise['veredito']),
                sugestao_ia=str(analise['sugestao'])
            )
            db.add(novo_cache)
        
        db.commit()
        return analise
    except Exception as e:
        print(f"Erro IA: {e}")
        return {"veredito": "Erro ao processar análise."}

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
        nota_calculada = calcular_nutriscore_manual(
            req.energia_kcal, req.acucares_g, req.gordura_sat_g, 
            req.sodio_mg, req.fibras_g, req.proteinas_g
        )

        novo_produto = Product(
            nome=req.nome,
            marca="Cadastro Manual",
            ingredientes=req.ingredientes,
            energia_kcal=req.energia_kcal,
            acucares_g=req.acucares_g,
            gordura_sat_g=req.gordura_sat_g,
            sodio_mg=req.sodio_mg,
            proteinas_g=req.proteinas_g,
            fibras_g=req.fibras_g,
            nutriscore=nota_calculada,
            imagem=req.imagem # SALVANDO A IMAGEM
        )
        
        db.add(novo_produto)
        db.commit()
        db.refresh(novo_produto)
        
        # Retornamos o objeto completo para o React abrir a página de detalhes na hora
        return {
            "mensagem": "Sucesso", 
            "produto_completo": {
                "nome": novo_produto.nome,
                "marca": novo_produto.marca,
                "ingredientes": novo_produto.ingredientes,
                "nutriscore": novo_produto.nutriscore,
                "imagem": novo_produto.imagem
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))