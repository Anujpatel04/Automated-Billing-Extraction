import logging
import sys
from logging.handlers import RotatingFileHandler
import os

def setup_logger(app):
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        handlers=[
            RotatingFileHandler(
                'logs/app.log',
                maxBytes=10485760,
                backupCount=10
            ),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('pymongo').setLevel(logging.WARNING)
    
    app.logger.info("Logging configured successfully")

