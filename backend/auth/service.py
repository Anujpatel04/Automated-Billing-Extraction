from extensions.mongodb import mongodb
from utils.password import hash_password, verify_password
from utils.jwt import generate_token
from utils.responses import success_response, error_response
from bson import ObjectId
from datetime import datetime
import re
import logging

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def validate_email(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r'\d', password):
            return False, "Password must contain at least one digit"
        return True, ""
    
    @staticmethod
    def register(email: str, password: str, role: str = "USER"):
        try:
            if not AuthService.validate_email(email):
                return error_response("Invalid email format", 400)
            
            is_valid, error_msg = AuthService.validate_password(password)
            if not is_valid:
                return error_response(error_msg, 400)
            
            if role not in ["USER", "HR"]:
                return error_response("Invalid role. Must be USER or HR", 400)
            
            users_collection = mongodb.get_collection('users')
            
            existing_user = users_collection.find_one({'email': email.lower()})
            if existing_user:
                return error_response("Email already registered", 409)
            
            user_data = {
                'email': email.lower(),
                'password_hash': hash_password(password),
                'role': role,
                'created_at': datetime.utcnow()
            }
            
            result = users_collection.insert_one(user_data)
            user_id = str(result.inserted_id)
            
            logger.info(f"User registered: {email} (role: {role})")
            
            return success_response(
                "User registered successfully",
                {
                    'user_id': user_id,
                    'email': email.lower(),
                    'role': role
                },
                201
            )
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return error_response("Registration failed", 500)
    
    @staticmethod
    def login(email: str, password: str):
        try:
            users_collection = mongodb.get_collection('users')
            
            user = users_collection.find_one({'email': email.lower()})
            if not user:
                return error_response("Invalid email or password", 401)
            
            if not verify_password(password, user['password_hash']):
                return error_response("Invalid email or password", 401)
            
            token = generate_token(
                str(user['_id']),
                user['email'],
                user['role']
            )
            
            logger.info(f"User logged in: {email}")
            
            return success_response(
                "Login successful",
                {
                    'token': token,
                    'user': {
                        'user_id': str(user['_id']),
                        'email': user['email'],
                        'role': user['role']
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return error_response("Login failed", 500)

