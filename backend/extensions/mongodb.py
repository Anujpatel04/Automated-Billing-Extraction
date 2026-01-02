from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    def __init__(self, app=None):
        self.app = app
        self.client = None
        self.db = None
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        try:
            mongo_uri = app.config.get('MONGO_URI')
            db_name = app.config.get('MONGO_DB_NAME', 'expense_management')
            
            self.client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000
            )
            
            self.client.admin.command('ping')
            self.db = self.client[db_name]
            
            logger.info(f"Successfully connected to MongoDB: {db_name}")
            self._create_indexes()
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def _create_indexes(self):
        try:
            users_collection = self.db.users
            users_collection.create_index("email", unique=True)
            users_collection.create_index("role")
            
            expenses_collection = self.db.expenses
            expenses_collection.create_index("user_id")
            expenses_collection.create_index("status")
            expenses_collection.create_index("created_at")
            expenses_collection.create_index([("user_id", 1), ("status", 1)])
            expenses_collection.create_index([("user_id", 1), ("created_at", -1)])
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.warning(f"Error creating indexes: {str(e)}")
    
    def get_db(self):
        if self.db is None:
            raise RuntimeError("Database not initialized. Call init_app first.")
        return self.db
    
    def get_collection(self, collection_name):
        return self.get_db()[collection_name]

mongodb = MongoDB()

