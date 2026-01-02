import jwt
from datetime import datetime, timedelta
from flask import current_app
from functools import wraps
from flask import request, jsonify
import logging

logger = logging.getLogger(__name__)

def generate_token(user_id: str, email: str, role: str) -> str:
    try:
        payload = {
            'user_id': str(user_id),
            'email': email,
            'role': role,
            'exp': datetime.utcnow() + current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', timedelta(hours=24)),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm=current_app.config.get('JWT_ALGORITHM', 'HS256')
        )
        
        return token
        
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        raise

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=[current_app.config.get('JWT_ALGORITHM', 'HS256')]
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise

def get_token_from_request() -> str:
    auth_header = request.headers.get('Authorization')
    if auth_header:
        try:
            token = auth_header.split(' ')[1]
            return token
        except IndexError:
            return None
    return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Authentication required'
            }), 401
        
        try:
            payload = decode_token(token)
            request.current_user = payload
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token expired'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token'
            }), 401
        except Exception as e:
            logger.error(f"Auth error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Authentication failed'
            }), 401
    
    return decorated

def require_role(*allowed_roles):
    def decorator(f):
        @wraps(f)
        @require_auth
        def decorated(*args, **kwargs):
            user_role = request.current_user.get('role')
            
            if user_role not in allowed_roles:
                return jsonify({
                    'success': False,
                    'message': 'Insufficient permissions'
                }), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

