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
        logger.info("Register request received")
        
        if not data:
            logger.warning("Register attempt with no request body")
            return error_response("Request body is required", 400)
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'USER')
        
        logger.info(f"Registering user: {email}, role: {role}")
        
        if not email or not password:
            logger.warning("Register attempt with missing email or password")
            return error_response("Email and password are required", 400)
        
        result = AuthService.register(email, password, role)
        logger.info(f"Register completed for: {email}")
        return result
        
    except Exception as e:
        logger.error(f"Register route error: {str(e)}", exc_info=True)
        return error_response("Registration failed", 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            logger.warning("Login attempt with no request body")
            return error_response("Request body is required", 400)
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            logger.warning("Login attempt with missing email or password")
            return error_response("Email and password are required", 400)
        
        logger.info(f"Login request received for: {email}")
        result = AuthService.login(email, password)
        return result
        
    except Exception as e:
        logger.error(f"Login route error: {str(e)}", exc_info=True)
        return error_response(f"Login failed: {str(e)}", 500)

