from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.database.database import get_db
from app.models.coach_profile import CoachProfile
from app.models.student_profile import StudentProfile
from app.models.user import User, UserRole
from app.auth.jwt import create_access_token
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
)
from app.auth.dependencies import (get_current_user, require_coach, require_student)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post(
    "/register/student",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_student(user_data: UserCreate,db: Session = Depends(get_db),):
    if user_data.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be student",
        )
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=UserRole.STUDENT,
    )

    db.add(user)

    try:
        db.flush()
        student_profile = StudentProfile( 
            user_id=user.id,
            )
        db.add(student_profile)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    return user

@router.post(
    "/register/coach",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_coach(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    if user_data.role != UserRole.COACH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be coach"
        )
    existing_user = db.query(User).filter(
        User.email==user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=UserRole.COACH,
    )

    db.add(user)

    try:
        db.flush()

        coach_profile = CoachProfile(
            user_id=user.id,
        )
        db.add(coach_profile)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )
    return user

@router.post("/login", response_model=TokenResponse)
def login( login_data: LoginRequest, db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password")

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= "Invalid email or password",
        )
    
    access_token = create_access_token(
        user_id=user.id,
        role=user.role.value,
    )

    return{
        "access_token": access_token,
        "token_type" : "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/student-test", response_model=UserResponse)
def student_test(current_user: User = Depends(require_student)):
    return current_user

@router.get("coach-test", response_model=UserResponse)
def coach_test(current_user: User = Depends(require_coach)):
    return current_user