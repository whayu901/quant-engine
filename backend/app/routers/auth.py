from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import models, schemas, security
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token)
def register(body: schemas.RegisterIn, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    org = models.Org(name=body.org_name, plan="free")
    db.add(org); db.flush()
    user = models.User(org_id=org.id, email=body.email,
                       hashed_password=security.hash_pw(body.password), role="admin")
    db.add(user); db.commit()
    return {"access_token": security.create_token(user.id)}


@router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.email == form.username).first()
    if not u or not security.verify_pw(form.password, u.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": security.create_token(u.id)}


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
