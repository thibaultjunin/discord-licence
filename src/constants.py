from dotenv import load_dotenv
import os


load_dotenv()


BOT = os.getenv("BOT")

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_TABLE = os.getenv("DB_TABLE")
DB_PORT = int(os.getenv("DB_PORT"))
