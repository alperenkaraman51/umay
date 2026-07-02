from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Geliştirme aşaması için PostgreSQL yerine kurulum gerektirmeyen yerel SQLite kullanıyoruz.
# Gerçek ortamda bu adres: postgresql://kullanici:sifre@localhost/umaydb şeklinde olacak.
SQLALCHEMY_DATABASE_URL = "sqlite:///./umay_test.db"

# SQLite kullanırken aynı bağlantıyı birden fazla yerden (thread) kullanabilmek için
# check_same_thread ayarını False yapıyoruz.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Veritabanı tablolarımızı oluştururken miras alacağımız ana sınıf
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
