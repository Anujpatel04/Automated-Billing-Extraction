from extensions.mongodb import mongodb
from utils.password import hash_password, verify_password
from utils.responses import success_response, error_response
from bson import ObjectId
from datetime import datetime
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    def get_user_profile(user_id: str) -> tuple:
        try:
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            
            if not user:
                return error_response("User not found", 404)
            
            # Get user statistics
            expenses_collection = mongodb.get_collection('expenses')
            total_expenses = expenses_collection.count_documents({'user_id': ObjectId(user_id)})
            pending_expenses = expenses_collection.count_documents({'user_id': ObjectId(user_id), 'status': 'pending'})
            approved_expenses = expenses_collection.count_documents({'user_id': ObjectId(user_id), 'status': 'approved'})
            
            profile_data = {
                'user_id': str(user['_id']),
                'email': user.get('email', ''),
                'role': user.get('role', 'USER'),
                'created_at': user.get('created_at', '').isoformat() if user.get('created_at') else '',
                'statistics': {
                    'total_expenses': total_expenses,
                    'pending_expenses': pending_expenses,
                    'approved_expenses': approved_expenses
                }
            }
            
            return success_response("Profile retrieved successfully", profile_data)
            
        except Exception as e:
            logger.error(f"Error getting user profile: {str(e)}")
            return error_response("Failed to retrieve profile", 500)
    
    @staticmethod
    def update_profile(user_id: str, data: Dict) -> tuple:
        try:
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            
            if not user:
                return error_response("User not found", 404)
            
            update_data = {}
            if 'email' in data:
                # Check if email already exists
                existing = users_collection.find_one({'email': data['email'].lower(), '_id': {'$ne': ObjectId(user_id)}})
                if existing:
                    return error_response("Email already in use", 409)
                update_data['email'] = data['email'].lower()
            
            if update_data:
                users_collection.update_one(
                    {'_id': ObjectId(user_id)},
                    {'$set': update_data}
                )
                logger.info(f"Profile updated for user: {user_id}")
            
            updated_user = users_collection.find_one({'_id': ObjectId(user_id)})
            profile_data = {
                'user_id': str(updated_user['_id']),
                'email': updated_user.get('email', ''),
                'role': updated_user.get('role', 'USER'),
                'created_at': updated_user.get('created_at', '').isoformat() if updated_user.get('created_at') else '',
            }
            
            return success_response("Profile updated successfully", profile_data)
            
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return error_response("Failed to update profile", 500)
    
    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str) -> tuple:
        try:
            from auth.service import AuthService
            
            # Validate new password
            is_valid, error_msg = AuthService.validate_password(new_password)
            if not is_valid:
                return error_response(error_msg, 400)
            
            users_collection = mongodb.get_collection('users')
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            
            if not user:
                return error_response("User not found", 404)
            
            # Verify old password
            if not verify_password(old_password, user['password_hash']):
                return error_response("Current password is incorrect", 401)
            
            # Update password
            new_password_hash = hash_password(new_password)
            users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'password_hash': new_password_hash}}
            )
            
            logger.info(f"Password changed for user: {user_id}")
            return success_response("Password changed successfully")
            
        except Exception as e:
            logger.error(f"Error changing password: {str(e)}")
            return error_response("Failed to change password", 500)
    
    @staticmethod
    def get_all_users() -> tuple:
        try:
            users_collection = mongodb.get_collection('users')
            expenses_collection = mongodb.get_collection('expenses')
            
            users = list(users_collection.find({}, {'password_hash': 0}).sort('created_at', -1))
            
            users_data = []
            for user in users:
                user_id = user['_id']
                total_expenses = expenses_collection.count_documents({'user_id': user_id})
                pending_expenses = expenses_collection.count_documents({'user_id': user_id, 'status': 'pending'})
                approved_expenses = expenses_collection.count_documents({'user_id': user_id, 'status': 'approved'})
                
                # Calculate total approved amount
                approved = list(expenses_collection.find({'user_id': user_id, 'status': 'approved'}))
                total_amount = 0
                for exp in approved:
                    extracted = exp.get('extracted_data', {})
                    amount = extracted.get('Bill Amount (INR)') or extracted.get('Bill Amount') or '0'
                    try:
                        amount_clean = str(amount).replace('₹', '').replace(',', '').replace('$', '').replace('€', '').strip()
                        total_amount += float(amount_clean) if amount_clean else 0
                    except:
                        pass
                
                users_data.append({
                    'user_id': str(user_id),
                    'email': user.get('email', ''),
                    'role': user.get('role', 'USER'),
                    'created_at': user.get('created_at', '').isoformat() if user.get('created_at') else '',
                    'statistics': {
                        'total_expenses': total_expenses,
                        'pending_expenses': pending_expenses,
                        'approved_expenses': approved_expenses,
                        'total_amount': total_amount
                    }
                })
            
            return success_response("Users retrieved successfully", {'users': users_data, 'count': len(users_data)})
            
        except Exception as e:
            logger.error(f"Error getting all users: {str(e)}")
            return error_response("Failed to retrieve users", 500)

