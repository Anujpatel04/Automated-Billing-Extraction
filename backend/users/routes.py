from flask import Blueprint, request
from users.service import UserService
from utils.jwt import require_role, require_auth
from utils.responses import error_response
import logging

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__, url_prefix='/users')

@users_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    try:
        user_id = request.current_user['user_id']
        result = UserService.get_user_profile(user_id)
        return result
    except Exception as e:
        logger.error(f"Get profile route error: {str(e)}", exc_info=True)
        return error_response("Failed to retrieve profile", 500)

@users_bp.route('/profile', methods=['PATCH'])
@require_auth
def update_profile():
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()
        result = UserService.update_profile(user_id, data)
        return result
    except Exception as e:
        logger.error(f"Update profile route error: {str(e)}", exc_info=True)
        return error_response("Failed to update profile", 500)

@users_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    try:
        user_id = request.current_user['user_id']
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not old_password or not new_password:
            return error_response("Old password and new password are required", 400)
        
        result = UserService.change_password(user_id, old_password, new_password)
        return result
    except Exception as e:
        logger.error(f"Change password route error: {str(e)}", exc_info=True)
        return error_response("Failed to change password", 500)

@users_bp.route('/all', methods=['GET'])
@require_role('HR')
def get_all_users():
    try:
        result = UserService.get_all_users()
        return result
    except Exception as e:
        logger.error(f"Get all users route error: {str(e)}", exc_info=True)
        return error_response("Failed to retrieve users", 500)

