import sys
import os

# Add project root to sys.path
sys.path.append(os.getcwd())

from jose import jwt
from app.core.config import settings
from app.core.security import verify_token

def test_auth():
    print("Testing Auth Logic...")
    
    # Ensure secret is loaded
    if not settings.SUPABASE_JWT_SECRET:
        print("ERROR: SUPABASE_JWT_SECRET not set in settings")
        sys.exit(1)
        
    secret = settings.SUPABASE_JWT_SECRET
    print(f"Using Secret: {secret}")

    # Generate a test token
    payload = {"sub": "test-user-id", "role": "authenticated", "aud": "authenticated"}
    token = jwt.encode(payload, secret, algorithm="HS256")
    print(f"Generated Token: {token}")

    # Verify token
    try:
        decoded = verify_token(token)
        print("Token Verified Successfully!")
        print(f"Decoded Payload: {decoded}")
        if decoded["sub"] == "test-user-id":
             print("SUCCESS: Subject matches")
        else:
             print("FAILURE: Subject mismatch")
             sys.exit(1)
    except Exception as e:
        print(f"FAILURE: Verification failed - {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_auth()
