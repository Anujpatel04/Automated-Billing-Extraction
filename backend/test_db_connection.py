import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

root_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(root_env_path)

def test_mongodb_connection():
    mongo_uri = os.getenv('MONGO_URI')
    db_name = os.getenv('MONGO_DB_NAME', 'expense_management')
    
    print("Testing MongoDB Connection...")
    print(f"MONGO_URI: {mongo_uri[:50]}..." if mongo_uri and len(mongo_uri) > 50 else f"MONGO_URI: {mongo_uri}")
    print(f"DB_NAME: {db_name}")
    print()
    
    if not mongo_uri:
        print("ERROR: MONGO_URI not set in .env file")
        return False
    
    try:
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
        
        print("Attempting to connect...")
        client.admin.command('ping')
        print("✓ MongoDB connection successful!")
        
        db = client[db_name]
        users_collection = db.users
        
        print(f"\nChecking 'users' collection...")
        user_count = users_collection.count_documents({})
        print(f"✓ Found {user_count} users in database")
        
        if user_count > 0:
            sample_user = users_collection.find_one()
            print(f"\nSample user:")
            print(f"  Email: {sample_user.get('email', 'N/A')}")
            print(f"  Role: {sample_user.get('role', 'N/A')}")
            print(f"  Has password_hash: {'password_hash' in sample_user}")
        
        client.close()
        return True
        
    except ConnectionFailure as e:
        print(f"✗ Connection failed: {str(e)}")
        print("\nPossible issues:")
        print("  - MongoDB server not running (if local)")
        print("  - Incorrect MONGO_URI")
        print("  - Network/firewall blocking connection (if Atlas)")
        return False
        
    except ServerSelectionTimeoutError as e:
        print(f"✗ Server selection timeout: {str(e)}")
        print("\nPossible issues:")
        print("  - MongoDB server not accessible")
        print("  - IP not whitelisted in MongoDB Atlas")
        print("  - Incorrect connection string")
        return False
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_mongodb_connection()
    sys.exit(0 if success else 1)

