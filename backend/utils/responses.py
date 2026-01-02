from flask import jsonify
from typing import Any, Optional

def success_response(message: str = "Success", data: Optional[Any] = None, status_code: int = 200):
    response = {
        'success': True,
        'message': message
    }
    
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code

def error_response(message: str = "Error", status_code: int = 400, errors: Optional[dict] = None):
    response = {
        'success': False,
        'message': message
    }
    
    if errors:
        response['errors'] = errors
    
    return jsonify(response), status_code

