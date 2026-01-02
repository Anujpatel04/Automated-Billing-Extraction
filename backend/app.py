import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_file, render_template, send_from_directory, request
from flask_cors import CORS
from config import Config
from extensions.mongodb import mongodb
from utils.logger import setup_logger
from utils.responses import error_response
from auth.routes import auth_bp
from expenses.routes import expenses_bp
from hr.routes import hr_bp
import os
import logging

logger = logging.getLogger(__name__)

def create_app():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    
    app = Flask(
        __name__,
        template_folder=os.path.join(project_root, 'templates'),
        static_folder=os.path.join(project_root, 'static')
    )
    
    app.config.from_object(Config)
    
    try:
        Config.validate()
    except ValueError as e:
        logger.error(str(e))
        raise
    
    CORS(app, 
         resources={r"/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    logger.info("CORS enabled for all origins")
    
    mongodb.init_app(app)
    logger.info("MongoDB initialized")
    
    setup_logger(app)
    
    app.register_blueprint(auth_bp)
    logger.info("Auth blueprint registered")
    
    app.register_blueprint(expenses_bp)
    logger.info("Expenses blueprint registered")
    
    app.register_blueprint(hr_bp)
    logger.info("HR blueprint registered")
    
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads/expenses')
    os.makedirs(upload_folder, exist_ok=True)
    logger.info(f"Upload folder: {upload_folder}")
    
    @app.before_request
    def log_request_info():
        logger.info(f">>> {request.method} {request.path} - IP: {request.remote_addr}")
        logger.debug(f"Headers: {dict(request.headers)}")
        if request.is_json:
            try:
                body = request.get_json()
                logger.debug(f"Request body: {body}")
            except:
                pass
    
    @app.after_request
    def log_response_info(response):
        logger.info(f"<<< {response.status_code} {request.method} {request.path}")
        return response
    
    @app.route('/', methods=['GET'])
    def index():
        return render_template('index.html')
    
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)
    
    @app.route('/health', methods=['GET'])
    def health_check():
        logger.info("Health check requested")
        return {
            'success': True,
            'message': 'Service is healthy',
            'status': 'ok'
        }, 200
    
    @app.route('/files/<path:file_path>', methods=['GET'])
    def serve_file(file_path):
        try:
            upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads/expenses')
            full_path = os.path.join(upload_folder, file_path)
            
            upload_folder_abs = os.path.abspath(upload_folder)
            full_path_abs = os.path.abspath(full_path)
            
            if not full_path_abs.startswith(upload_folder_abs):
                return error_response("Invalid file path", 403)
            
            if not os.path.exists(full_path_abs):
                return error_response("File not found", 404)
            
            return send_file(full_path_abs)
            
        except Exception as e:
            logger.error(f"Error serving file: {str(e)}")
            return error_response("Failed to serve file", 500)
    
    @app.errorhandler(404)
    def not_found(error):
        return error_response("Endpoint not found", 404)
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return error_response("Internal server error", 500)
    
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return error_response("File too large", 413)
    
    logger.info("Flask application initialized successfully")
    return app

app = create_app()

if __name__ == '__main__':
    port = Config.PORT
    host = Config.HOST
    
    logger.info(f"Starting server on {host}:{port}")
    logger.info(f"MongoDB URI: {Config.MONGO_URI[:50]}..." if len(Config.MONGO_URI) > 50 else f"MongoDB URI: {Config.MONGO_URI}")
    logger.info(f"OpenAI API Key configured: {'Yes' if Config.OPENAI_API_KEY else 'No'}")
    logger.info(f"JWT Secret configured: {'Yes' if Config.JWT_SECRET_KEY else 'No'}")
    
    app.run(host=host, port=port, debug=True)

