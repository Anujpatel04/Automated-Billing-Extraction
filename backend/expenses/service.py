from extensions.mongodb import mongodb
from expenses.models import ExpenseModel, ExpenseStatus
from ai.bill_extractor import BillExtractor
from storage.file_manager import FileManager
from utils.responses import success_response, error_response
from bson import ObjectId
from datetime import datetime
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ExpenseService:
    @staticmethod
    def create_expense(user_id: str, file) -> tuple:
        try:
            is_valid, error_msg = FileManager.validate_file(file)
            if not is_valid:
                return error_response(error_msg, 400)
            
            image_path = FileManager.save_file(file, user_id)
            if not image_path:
                return error_response("Failed to save file", 500)
            
            try:
                extracted_data = BillExtractor.extract_bill_data(image_path)
            except Exception as e:
                logger.error(f"Bill extraction error: {str(e)}", exc_info=True)
                FileManager.delete_file(image_path)
                return error_response(
                    f"Failed to extract bill data: {str(e)}. Please ensure the image is clear and contains a valid bill.",
                    400
                )
            
            if not extracted_data:
                FileManager.delete_file(image_path)
                logger.warning(f"Extraction returned empty data for {image_path}")
                return error_response(
                    "Failed to extract bill data from image. Please ensure the image is clear and contains readable text.",
                    400
                )
            
            is_valid, error_msg = ExpenseModel.validate_extracted_data(extracted_data)
            if not is_valid:
                FileManager.delete_file(image_path)
                logger.warning(f"Validation failed for {image_path}: {error_msg}")
                return error_response(
                    f"Invalid extracted data: {error_msg}. Please ensure the bill image is clear and contains visible date and amount information.",
                    400
                )
            
            expense_doc = ExpenseModel.create_expense(
                user_id=user_id,
                image_path=image_path,
                extracted_data=extracted_data,
                status=ExpenseStatus.PENDING
            )
            
            expenses_collection = mongodb.get_collection('expenses')
            result = expenses_collection.insert_one(expense_doc)
            expense_id = str(result.inserted_id)
            
            expense = expenses_collection.find_one({'_id': result.inserted_id})
            
            logger.info(f"Expense created: {expense_id} for user: {user_id}")
            
            return success_response(
                "Expense uploaded successfully",
                ExpenseModel.format_expense_response(expense),
                201
            )
            
        except Exception as e:
            logger.error(f"Error creating expense: {str(e)}")
            return error_response("Failed to create expense", 500)
    
    @staticmethod
    def get_user_expenses(user_id: str, status: Optional[str] = None) -> tuple:
        try:
            expenses_collection = mongodb.get_collection('expenses')
            
            query = {'user_id': ObjectId(user_id)}
            if status:
                query['status'] = status
            
            expenses = list(expenses_collection.find(query).sort('created_at', -1))
            
            formatted_expenses = [
                ExpenseModel.format_expense_response(exp) for exp in expenses
            ]
            
            return success_response(
                "Expenses retrieved successfully",
                {'expenses': formatted_expenses, 'count': len(formatted_expenses)}
            )
            
        except Exception as e:
            logger.error(f"Error getting user expenses: {str(e)}")
            return error_response("Failed to retrieve expenses", 500)
    
    @staticmethod
    def get_all_expenses(
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> tuple:
        try:
            expenses_collection = mongodb.get_collection('expenses')
            
            query = {}
            
            if user_id:
                query['user_id'] = ObjectId(user_id)
            
            if status:
                query['status'] = status
            
            if date_from or date_to:
                query['created_at'] = {}
                if date_from:
                    query['created_at']['$gte'] = date_from
                if date_to:
                    query['created_at']['$lte'] = date_to
            
            expenses = list(expenses_collection.find(query).sort('created_at', -1))
            
            users_collection = mongodb.get_collection('users')
            for expense in expenses:
                user = users_collection.find_one({'_id': expense['user_id']})
                expense['user_email'] = user['email'] if user else 'Unknown'
            
            formatted_expenses = [
                ExpenseModel.format_expense_response(exp) for exp in expenses
            ]
            
            return success_response(
                "Expenses retrieved successfully",
                {'expenses': formatted_expenses, 'count': len(formatted_expenses)}
            )
            
        except Exception as e:
            logger.error(f"Error getting all expenses: {str(e)}")
            return error_response("Failed to retrieve expenses", 500)
    
    @staticmethod
    def update_expense_status(expense_id: str, status: str, notes: Optional[str] = None) -> tuple:
        try:
            if status not in [ExpenseStatus.APPROVED, ExpenseStatus.REJECTED]:
                return error_response("Invalid status. Must be 'approved' or 'rejected'", 400)
            
            expenses_collection = mongodb.get_collection('expenses')
            
            update_data = {
                'status': status,
                'updated_at': datetime.utcnow()
            }
            
            if notes is not None:
                update_data['hr_notes'] = notes.strip() if notes else None
            
            result = expenses_collection.update_one(
                {'_id': ObjectId(expense_id)},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return error_response("Expense not found", 404)
            
            expense = expenses_collection.find_one({'_id': ObjectId(expense_id)})
            
            logger.info(f"Expense status updated: {expense_id} to {status} with notes: {bool(notes)}")
            
            return success_response(
                f"Expense {status} successfully",
                ExpenseModel.format_expense_response(expense)
            )
            
        except Exception as e:
            logger.error(f"Error updating expense status: {str(e)}")
            return error_response("Failed to update expense status", 500)

