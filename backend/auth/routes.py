from flask import Blueprint, request
from auth.service import AuthService
from utils.responses import error_response
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'USER')
        
        if not email or not password:
            return error_response("Email and password are required", 400)
        
        return AuthService.register(email, password, role)
        
    except Exception as e:
        logger.error(f"Register route error: {str(e)}")
        return error_response("Registration failed", 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return error_response("Email and password are required", 400)
        
        return AuthService.login(email, password)
        
    except Exception as e:
        logger.error(f"Login route error: {str(e)}")
        return error_response("Login failed", 500)

