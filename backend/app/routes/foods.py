import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/foods", tags=["foods"])

@router.get("/search")
async def search_food(query: str):
    # Pedimos apenas o que vamos usar para ganhar velocidade
    campos = "product_name,brands,image_front_url,nutrition_grades,ingredients_text"
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=12&fields={campos}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
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
            return results
        except Exception as e:
            print(f"Erro na API: {e}")
            return []