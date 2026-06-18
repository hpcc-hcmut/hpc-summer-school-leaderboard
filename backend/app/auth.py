from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()


def hash_token(token: str) -> str:
    return pwd_context.hash(token)


def verify_token(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def verify_admin_password(password: str) -> bool:
    return password == settings.admin_password


def create_admin_jwt() -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.admin_jwt_expire_minutes)
    payload = {"sub": "admin", "exp": expire}
    return jwt.encode(payload, settings.admin_jwt_secret, algorithm="HS256")


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired admin token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.admin_jwt_secret, algorithms=["HS256"])
        sub: Optional[str] = payload.get("sub")
        if sub != "admin":
            raise credentials_exception
        return sub
    except JWTError:
        raise credentials_exception
