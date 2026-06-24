from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from .. import models, schemas, security
from ..database import get_db
from ..deps import get_current_user
from ..validators import validate_password, validate_email

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=schemas.Token)
@limiter.limit("5/minute")  # Prevent account creation abuse
def register(request: Request, body: schemas.RegisterIn, db: Session = Depends(get_db)):
    # Validate email format
    email_valid, email_error = validate_email(body.email)
    if not email_valid:
        raise HTTPException(400, email_error)

    # Validate password complexity
    password_valid, password_error = validate_password(body.password)
    if not password_valid:
        raise HTTPException(400, password_error)

    # Check if email already exists
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(400, "Registration failed. Please try again.")  # Generic message to prevent user enumeration

    # Create organization and user
    org = models.Org(name=body.org_name, plan="free")
    db.add(org); db.flush()
    user = models.User(org_id=org.id, email=body.email.lower(),  # Store email in lowercase
                       hashed_password=security.hash_pw(body.password), role="admin")
    db.add(user); db.commit()
    return {"access_token": security.create_token(user.id)}


@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")  # Prevent brute force attacks
def login(request: Request, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.email == form.username).first()
    if not u or not security.verify_pw(form.password, u.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": security.create_token(u.id)}


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
