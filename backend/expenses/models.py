"""
Expense data models and validation.
"""
from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any

class ExpenseStatus:
    """Expense status constants."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ExpenseModel:
    """Expense model with validation."""
    
    @staticmethod
    def create_expense(
        user_id: str,
        image_path: str,
        extracted_data: Dict[str, Any],
        status: str = ExpenseStatus.PENDING
    ) -> Dict[str, Any]:
        """
        Create expense document structure.
        
        Args:
            user_id: User's MongoDB _id
            image_path: Path to uploaded image
            extracted_data: Extracted bill data from OpenAI
            status: Expense status
            
        Returns:
            Expense document dictionary
        """
        return {
            'user_id': ObjectId(user_id),
            'image_path': image_path,
            'extracted_data': extracted_data,
            'status': status,
            'hr_notes': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    
    @staticmethod
    def validate_extracted_data(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate extracted bill data structure.
        
        Returns:
            (is_valid, error_message)
        """
        # Check for Date field (required)
        if 'Date' not in data and 'date' not in data:
            return False, "Missing required field: Date"
        
        # Check for Bill Amount or total (required)
        has_amount = 'Bill Amount' in data or 'Bill Amount (INR)' in data or 'total' in data or 'Bill Amount' in data
        if not has_amount:
            return False, "Missing required field: Bill Amount"
        
        # Validate amount is extractable (can be string with currency symbol)
        amount_fields = ['Bill Amount', 'Bill Amount (INR)', 'total']
        amount_found = False
        for field in amount_fields:
            if field in data and data[field]:
                amount_str = str(data[field]).replace('₹', '').replace('$', '').replace('€', '').replace(',', '').strip()
                try:
                    float(amount_str)
                    amount_found = True
                    break
                except (ValueError, TypeError):
                    continue
        
        if not amount_found:
            return False, "Bill Amount must contain a valid number"
        
        # Bill Type is recommended but not required
        # Details can serve as vendor information
        
        return True, None
    
    @staticmethod
    def format_expense_response(expense: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format expense document for API response.
        
        Args:
            expense: MongoDB expense document
            
        Returns:
            Formatted expense dictionary
        """
        formatted = {
            'expense_id': str(expense['_id']),
            'user_id': str(expense['user_id']),
            'image_path': expense['image_path'],
            'extracted_data': expense['extracted_data'],
            'status': expense['status'],
            'hr_notes': expense.get('hr_notes'),
            'created_at': expense['created_at'].isoformat() if isinstance(expense['created_at'], datetime) else expense['created_at'],
            'updated_at': expense['updated_at'].isoformat() if isinstance(expense['updated_at'], datetime) else expense['updated_at']
        }
        
        if 'user_email' in expense:
            formatted['user_email'] = expense['user_email']
        
        return formatted

