import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class FileManager:
    @staticmethod
    def allowed_file(filename: str) -> bool:
        if '.' not in filename:
            return False
        ext = filename.rsplit('.', 1)[1].lower()
        allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'pdf'})
        return ext in allowed
    
    @staticmethod
    def validate_file(file) -> Tuple[bool, Optional[str]]:
        if not file or not file.filename:
            return False, "No file provided"
        
        if not FileManager.allowed_file(file.filename):
            return False, "File type not allowed. Allowed types: PNG, JPG, JPEG, PDF"
        
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        max_size = current_app.config.get('MAX_FILE_SIZE', 10 * 1024 * 1024)
        if file_size > max_size:
            return False, f"File size exceeds maximum allowed size ({max_size / 1024 / 1024}MB)"
        
        return True, None
    
    @staticmethod
    def save_file(file, user_id: str) -> Optional[str]:
        try:
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads/expenses')
            user_folder = os.path.join(upload_folder, str(user_id))
            os.makedirs(user_folder, exist_ok=True)
            
            original_filename = secure_filename(file.filename)
            file_ext = original_filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
            
            file_path = os.path.join(user_folder, unique_filename)
            file.save(file_path)
            
            logger.info(f"File saved: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            return None
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"File deleted: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
    
    @staticmethod
    def get_file_path(file_path: str) -> Optional[str]:
        if os.path.exists(file_path):
            return file_path
        return None

