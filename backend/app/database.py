from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Mude 'sua_senha' para a senha que você escolheu no passo 2
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://alimentare_user:sua_senha@localhost/alimentare_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Função para pegar uma conexão com o banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()