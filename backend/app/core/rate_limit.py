from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter - uses client IP for rate limiting
limiter = Limiter(key_func=get_remote_address)
