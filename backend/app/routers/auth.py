from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Union
from .. import models, schemas, security
from ..database import get_db
from ..deps import get_current_user
from ..validators import validate_password, validate_email

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")  # Prevent account creation abuse
def register(
    request: Request,
    body: Union[schemas.RegisterRetailIn, schemas.RegisterEnterpriseIn, schemas.RegisterIn],
    db: Session = Depends(get_db)
):
    """
    Register a new user account (retail or enterprise).

    - **Retail**: Individual user registration with personal details
    - **Enterprise**: Organization registration with admin user
    """
    try:
        # Determine registration type and extract common fields
        if isinstance(body, schemas.RegisterRetailIn):
            email = body.email
            password = body.password
            name = body.name
            org_name = f"{name}'s Organization"  # Auto-generated org name for retail
            role = "admin"
            plan = "free"
        elif isinstance(body, schemas.RegisterEnterpriseIn):
            email = body.admin_email
            password = body.password
            name = body.admin_name
            org_name = body.organization_name
            role = "admin"
            plan = "free"  # Start with free plan, can be upgraded
        else:
            # Legacy RegisterIn format
            email = body.email
            password = body.password
            name = None
            org_name = body.org_name
            role = "admin"
            plan = "free"

        # Validate email format
        email_valid, email_error = validate_email(email)
        if not email_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": email_error, "field": "email"}
            )

        # Validate password complexity
        password_valid, password_error = validate_password(password)
        if not password_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": password_error, "field": "password"}
            )

        # Check if email already exists
        existing_user = db.query(models.User).filter(models.User.email == email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "An account with this email already exists", "field": "email"}
            )

        # Create organization
        org = models.Org(name=org_name, plan=plan)
        db.add(org)
        db.flush()

        # Create user
        user = models.User(
            org_id=org.id,
            email=email.lower(),  # Store email in lowercase
            name=name,
            hashed_password=security.hash_pw(password),
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Generate tokens
        access_token = security.create_token(user.id)
        refresh_token = security.create_token(user.id)  # In production, use different expiry

        # Build user response
        user_data = schemas.UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            org_id=user.org_id
        )

        return schemas.AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_data,
            status="success"
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Registration failed. Please try again later.", "error": str(e)}
        )


@router.post("/login", response_model=schemas.AuthResponse)
@limiter.limit("10/minute")  # Prevent brute force attacks
def login(
    request: Request,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access tokens with user data.

    Supports both email-based and OAuth2 password flow authentication.
    """
    try:
        # Find user by email (form.username contains email)
        user = db.query(models.User).filter(
            models.User.email == form.username.lower()
        ).first()

        # Verify user exists and password is correct
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid email or password", "field": "credentials"}
            )

        if not security.verify_pw(form.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid email or password", "field": "credentials"}
            )

        # Check if user is active
        if hasattr(user, 'is_active') and not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "Account is deactivated. Please contact support.", "field": "account"}
            )

        # Update last login timestamp
        if hasattr(user, 'last_login'):
            from datetime import datetime
            user.last_login = datetime.utcnow()
            db.commit()

        # Generate tokens
        access_token = security.create_token(user.id)
        refresh_token = security.create_token(user.id)  # In production, use different expiry

        # Build user response
        user_data = schemas.UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            org_id=user.org_id
        )

        return schemas.AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_data,
            status="success"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Login failed. Please try again later.", "error": str(e)}
        )


@router.post("/login/json", response_model=schemas.AuthResponse)
@limiter.limit("10/minute")  # Prevent brute force attacks
def login_json(
    request: Request,
    body: schemas.LoginIn,
    db: Session = Depends(get_db)
):
    """
    JSON-based login endpoint for frontend applications.

    Accepts email and password in JSON format and returns user data with tokens.
    """
    try:
        # Find user by email
        user = db.query(models.User).filter(
            models.User.email == body.email.lower()
        ).first()

        # Verify user exists and password is correct
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid email or password", "field": "credentials"}
            )

        if not security.verify_pw(body.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid email or password", "field": "credentials"}
            )

        # Check if user is active
        if hasattr(user, 'is_active') and not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "Account is deactivated. Please contact support.", "field": "account"}
            )

        # Update last login timestamp
        if hasattr(user, 'last_login'):
            from datetime import datetime
            user.last_login = datetime.utcnow()
            db.commit()

        # Generate tokens (consider remember_me for token expiry in production)
        access_token = security.create_token(user.id)
        refresh_token = security.create_token(user.id)

        # Build user response
        user_data = schemas.UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            org_id=user.org_id
        )

        return schemas.AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_data,
            status="success"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Login failed. Please try again later.", "error": str(e)}
        )


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
