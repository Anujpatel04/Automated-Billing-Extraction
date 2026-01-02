import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_file, render_template, send_from_directory
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
    
    CORS(app, resources={r"/*": {"origins": "*"}})
    mongodb.init_app(app)
    setup_logger(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(hr_bp)
    
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads/expenses')
    os.makedirs(upload_folder, exist_ok=True)
    
    @app.route('/', methods=['GET'])
    def index():
        return render_template('index.html')
    
    @app.route('/static/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)
    
    @app.route('/health', methods=['GET'])
    def health_check():
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
    app.run(host=host, port=port, debug=False)

