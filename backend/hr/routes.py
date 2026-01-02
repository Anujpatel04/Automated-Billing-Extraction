from flask import Blueprint, request
from expenses.service import ExpenseService
from utils.jwt import require_role
from utils.responses import error_response
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

hr_bp = Blueprint('hr', __name__, url_prefix='/hr')

@hr_bp.route('/expenses', methods=['GET'])
@require_role('HR')
def get_all_expenses():
    try:
        user_id = request.args.get('user_id')
        status = request.args.get('status')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        parsed_date_from = None
        parsed_date_to = None
        
        if date_from:
            try:
                parsed_date_from = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            except ValueError:
                return error_response("Invalid date_from format. Use ISO format (YYYY-MM-DDTHH:MM:SS)", 400)
        
        if date_to:
            try:
                parsed_date_to = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            except ValueError:
                return error_response("Invalid date_to format. Use ISO format (YYYY-MM-DDTHH:MM:SS)", 400)
        
        return ExpenseService.get_all_expenses(
            user_id=user_id,
            status=status,
            date_from=parsed_date_from,
            date_to=parsed_date_to
        )
        
    except Exception as e:
        logger.error(f"Get all expenses route error: {str(e)}")
        return error_response("Failed to retrieve expenses", 500)

@hr_bp.route('/expenses/<expense_id>/status', methods=['PATCH'])
@require_role('HR')
def update_expense_status(expense_id):
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        status = data.get('status')
        notes = data.get('notes')
        
        if not status:
            return error_response("Status is required", 400)
        
        return ExpenseService.update_expense_status(expense_id, status, notes)
        
    except Exception as e:
        logger.error(f"Update expense status route error: {str(e)}")
        return error_response("Failed to update expense status", 500)

