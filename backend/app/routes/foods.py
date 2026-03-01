import httpx
from fastapi import APIRouter
import traceback

router = APIRouter(prefix="/foods", tags=["foods"])

@router.get("/search")
async def search_food(query: str):
    # Usamos o subdomínio do Brasil (br.) que costuma ser mais rápido para nós
    # E adicionamos filtros para a API não ter que processar tanta coisa
    url = f"https://br.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=12"
    
    # Configuramos um Timeout específico para cada etapa
    # connect=10 (tempo para ligar), read=30 (tempo para baixar os dados)
    timeout = httpx.Timeout(30.0, connect=10.0)
    
    async with httpx.AsyncClient(verify=False, timeout=timeout) as client:
        try:
            print(f"Buscando na API: {query}...")
            response = await client.get(url)
            
            if response.status_code != 200:
                print(f"API respondeu com erro: {response.status_code}")
                return []

            data = response.json()
            products = data.get("products", [])
            
            if not products:
                print("Nenhum produto encontrado na resposta.")
                return []

            results = []
            for item in products:
                results.append({
                    "nome": item.get("product_name_pt") or item.get("product_name") or "Sem nome",
                    "marca": item.get("brands", "Marca desconhecida"),
                    "imagem": item.get("image_front_url"),
                    "nutriscore": str(item.get("nutrition_grades", "n/a")).upper(),
                    "ingredientes": item.get("ingredients_text", "Não informados")
                })
            
            print(f"Sucesso! {len(results)} itens encontrados.")
            return results

        except httpx.ReadTimeout:
            print(f"⚠️ A API demorou mais de 30 segundos para responder a busca: {query}")
            return []
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")
            traceback.print_exc()
            return []