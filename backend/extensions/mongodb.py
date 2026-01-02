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
            
            if not mongo_uri:
                logger.error("MONGO_URI not found in configuration")
                raise ValueError("MONGO_URI is required but not set")
            
            logger.info(f"Connecting to MongoDB: {db_name}")
            logger.debug(f"MongoDB URI: {mongo_uri[:50]}..." if len(mongo_uri) > 50 else f"MongoDB URI: {mongo_uri}")
            
            self.client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000
            )
            
            self.client.admin.command('ping')
            self.db = self.client[db_name]
            
            logger.info(f"Successfully connected to MongoDB: {db_name}")
            self._create_indexes()
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            logger.error("Please check:")
            logger.error("  1. MongoDB server is running (if local)")
            logger.error("  2. MONGO_URI is correct in .env file")
            logger.error("  3. IP is whitelisted in MongoDB Atlas (if using Atlas)")
            logger.error("  4. Network connection is available")
            raise
        except Exception as e:
            logger.error(f"MongoDB initialization error: {str(e)}", exc_info=True)
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

