from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_admin,
    hash_password,
    verify_password,
)
from app.models.database_models import AdminUser
from app.models.schemas import (
    AdminLoginRequest,
    AdminRegisterRequest,
    AdminUserResponse,
    AuthResponse,
)

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register_admin(payload: AdminRegisterRequest, db: Session = Depends(get_db)):
    """Register an admin user (requires shared 6-digit registration code)."""
    if not settings.admin_registration_code:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_REGISTRATION_CODE is not configured"
        )

    if payload.registration_code != settings.admin_registration_code:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid registration code")

    existing = db.query(AdminUser).filter(AdminUser.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = AdminUser(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, email=user.email)
    return AuthResponse(
        access_token=token,
        user=AdminUserResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login_admin(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    """Login admin user with email/password."""
    user = db.query(AdminUser).filter(AdminUser.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account is inactive")

    token = create_access_token(subject=user.id, email=user.email)
    return AuthResponse(
        access_token=token,
        user=AdminUserResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=AdminUserResponse)
async def get_me(current_admin: AdminUser = Depends(get_current_admin)):
    """Get current authenticated admin user."""
    return AdminUserResponse(
        id=current_admin.id,
        email=current_admin.email,
        is_active=current_admin.is_active,
        created_at=current_admin.created_at,
    )
