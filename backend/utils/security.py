from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    if isinstance(password, str):
        password = password.encode("utf-8")

    # bcrypt hard limit
    password = password[:72]

    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if isinstance(plain_password, str):
        plain_password = plain_password.encode("utf-8")

    plain_password = plain_password[:72]

    return pwd_context.verify(plain_password, hashed_password)
