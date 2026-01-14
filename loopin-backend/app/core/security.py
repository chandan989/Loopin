from jose import jwt, JWTError
from app.core.config import settings

def verify_token(token: str) -> dict:
    """
    Verifies a Supabase JWT token.
    Uses the SUPABASE_JWT_SECRET to decode and verify the signature.
    """
    if not settings.SUPABASE_JWT_SECRET:
        raise ValueError("SUPABASE_JWT_SECRET is not set")
    
    try:
        # Supabase uses HS256 by default
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256"],
            options={"verify_aud": False} # Audience verification might need adjustment based on specific Supabase setup
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {str(e)}")
