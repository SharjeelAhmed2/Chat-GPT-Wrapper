from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat_routes

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# import psycopg2

# try:
#     conn = psycopg2.connect(
#         dbname="pink_empire",
#         user="postgres",
#         password="sAnsys@123",
#         host="localhost",
#         port="5432"
#     )
#     print("Connected successfully!")
# except Exception as e:
#     print("Error:", e)
app.include_router(chat_routes.router)
