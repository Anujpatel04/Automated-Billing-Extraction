import bcrypt
import logging

logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    try:
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Error hashing password: {str(e)}")
        raise

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Error verifying password: {str(e)}")
        return False

