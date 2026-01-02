from flask import Blueprint, request
from expenses.service import ExpenseService
from utils.jwt import require_auth
from utils.responses import error_response
import logging

logger = logging.getLogger(__name__)

expenses_bp = Blueprint('expenses', __name__, url_prefix='/expenses')

@expenses_bp.route('/upload', methods=['POST'])
@require_auth
def upload_expense():
    try:
        if 'file' not in request.files:
            return error_response("No file provided", 400)
        
        file = request.files['file']
        user_id = request.current_user['user_id']
        
        return ExpenseService.create_expense(user_id, file)
        
    except Exception as e:
        logger.error(f"Upload expense route error: {str(e)}")
        return error_response("Failed to upload expense", 500)

@expenses_bp.route('/my', methods=['GET'])
@require_auth
def get_my_expenses():
    try:
        user_id = request.current_user['user_id']
        status = request.args.get('status')
        
        return ExpenseService.get_user_expenses(user_id, status)
        
    except Exception as e:
        logger.error(f"Get my expenses route error: {str(e)}")
        return error_response("Failed to retrieve expenses", 500)

