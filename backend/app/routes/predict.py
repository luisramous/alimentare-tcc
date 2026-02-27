from fastapi import APIRouter

router = APIRouter()

@router.get("/predict")
def predict():
    return {"resultado": "endpoint de previsão funcionando 🚀"}