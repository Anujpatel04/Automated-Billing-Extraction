import os
import sys
from dotenv import load_dotenv

root_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(root_env_path)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from extensions.mongodb import mongodb
from config import Config
from flask import Flask

def test_auth_flow():
    print("Testing Authentication Flow...")
    print()
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    try:
        mongodb.init_app(app)
        print("✓ MongoDB initialized")
    except Exception as e:
        print(f"✗ MongoDB initialization failed: {str(e)}")
        return False
    
    with app.app_context():
        try:
            users_collection = mongodb.get_collection('users')
            print("✓ Users collection accessible")
            
            user_count = users_collection.count_documents({})
            print(f"✓ Total users in database: {user_count}")
            
            if user_count == 0:
                print("\n⚠ No users found. You need to register first.")
                print("   Use POST /auth/register to create a user")
            else:
                print("\nSample users:")
                for user in users_collection.find().limit(3):
                    print(f"  - {user.get('email')} ({user.get('role')})")
            
            return True
            
        except Exception as e:
            print(f"✗ Error accessing users collection: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = test_auth_flow()
    sys.exit(0 if success else 1)

