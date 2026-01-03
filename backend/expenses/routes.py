from flask import Blueprint, request, send_file
from expenses.service import ExpenseService
from utils.jwt import require_auth
from utils.responses import error_response
import logging
import io

logger = logging.getLogger(__name__)

expenses_bp = Blueprint('expenses', __name__, url_prefix='/expenses')

@expenses_bp.route('/upload', methods=['POST'])
@require_auth
def upload_expense():
    try:
        logger.info(f"Upload expense request from user: {request.current_user.get('user_id')}")
        
        if 'file' not in request.files:
            logger.warning("Upload request with no file")
            return error_response("No file provided", 400)
        
        file = request.files['file']
        user_id = request.current_user['user_id']
        
        logger.info(f"Processing file: {file.filename} for user: {user_id}")
        result = ExpenseService.create_expense(user_id, file)
        logger.info(f"Upload result: {'success' if result[1] == 201 else 'failed'}")
        return result
        
    except Exception as e:
        logger.error(f"Upload expense route error: {str(e)}", exc_info=True)
        return error_response("Failed to upload expense", 500)

@expenses_bp.route('/my', methods=['GET'])
@require_auth
def get_my_expenses():
    try:
        user_id = request.current_user['user_id']
        status = request.args.get('status')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        logger.info(f"Get expenses request from user: {user_id}, status filter: {status or 'all'}")
        result = ExpenseService.get_user_expenses(user_id, status, date_from, date_to)
        logger.debug(f"Found {result[0].get_json().get('data', {}).get('count', 0)} expenses")
        return result
        
    except Exception as e:
        logger.error(f"Get my expenses route error: {str(e)}", exc_info=True)
        return error_response("Failed to retrieve expenses", 500)

@expenses_bp.route('/export', methods=['GET'])
@require_auth
def export_expenses():
    try:
        user_id = request.current_user['user_id']
        format_type = request.args.get('format', 'excel')  # excel or csv
        status = request.args.get('status')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        logger.info(f"Export expenses request from user: {user_id}, format: {format_type}")
        result = ExpenseService.export_expenses(user_id, format_type, status, date_from, date_to)
        return result
        
    except Exception as e:
        logger.error(f"Export expenses route error: {str(e)}", exc_info=True)
        return error_response("Failed to export expenses", 500)

@expenses_bp.route('/<expense_id>/download', methods=['GET'])
@require_auth
def download_expense_file(expense_id):
    try:
        user_id = request.current_user['user_id']
        logger.info(f"Download file request for expense: {expense_id} from user: {user_id}")
        result = ExpenseService.download_expense_file(expense_id, user_id)
        return result
        
    except Exception as e:
        logger.error(f"Download file route error: {str(e)}", exc_info=True)
        return error_response("Failed to download file", 500)

