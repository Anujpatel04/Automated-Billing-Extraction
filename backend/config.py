import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('JWT_SECRET', os.getenv('SECRET_KEY', 'change-me-in-production'))
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024
    
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/expense_management')
    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'expense_management')
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_ALGORITHM = 'HS256'
    
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o')
    
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads/expenses')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', '60'))
    
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    PORT = int(os.getenv('PORT', 8000))
    HOST = os.getenv('HOST', '0.0.0.0')
    
    @staticmethod
    def validate():
        required_vars = ['OPENAI_API_KEY', 'JWT_SECRET', 'MONGO_URI']
        missing = [var for var in required_vars if not os.getenv(var)]
        
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}. "
                "Please set them in your environment or .env file."
            )
        
        return True

