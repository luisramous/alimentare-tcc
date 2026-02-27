import httpx
from fastapi import APIRouter
import traceback # Importado para ver o erro real

router = APIRouter(prefix="/foods", tags=["foods"])

@router.get("/search")
async def search_food(query: str):
    campos = "product_name,brands,image_front_url,nutrition_grades,ingredients_text"
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=12&fields={campos}"
    
    # Adicionamos o 'verify=False' para testar se é erro de Certificado SSL (comum no Linux)
    async with httpx.AsyncClient(verify=False) as client:
        try:
            print(f"Tentando acessar: {url}")
            response = await client.get(url, timeout=15.0)
            
            # Verifica se a API retornou erro de servidor (ex: 404 ou 500)
            if response.status_code != 200:
                print(f"Erro na API externa: Status {response.status_code}")
                return []

            data = response.json()
            products = data.get("products", [])
            
            results = []
            for item in products:
                results.append({
                    "nome": item.get("product_name", "Sem nome"),
                    "marca": item.get("brands", "Marca desconhecida"),
                    "imagem": item.get("image_front_url"),
                    "nutriscore": str(item.get("nutrition_grades", "n/a")).upper(),
                    "ingredientes": item.get("ingredients_text", "Não informados")
                })
            
            print(f"Busca concluída! Itens encontrados: {len(results)}")
            return results

        except Exception as e:
            # Isso vai imprimir o erro DETALHADO no terminal do VS Code
            print("--- ERRO DETALHADO NO BACKEND ---")
            traceback.print_exc() 
            return []