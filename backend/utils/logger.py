import logging
import sys
from logging.handlers import RotatingFileHandler
import os

def setup_logger(app):
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(
        logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    )
    
    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=10485760,
        backupCount=10
    )
    file_handler.setLevel(getattr(logging, log_level))
    file_handler.setFormatter(
        logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    )
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.handlers = []
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.INFO)
    werkzeug_logger.addHandler(console_handler)
    
    pymongo_logger = logging.getLogger('pymongo')
    pymongo_logger.setLevel(logging.INFO)
    pymongo_logger.addHandler(console_handler)
    
    auth_logger = logging.getLogger('auth')
    auth_logger.setLevel(logging.DEBUG)
    
    expenses_logger = logging.getLogger('expenses')
    expenses_logger.setLevel(logging.DEBUG)
    
    app.logger.info("Logging configured successfully")

