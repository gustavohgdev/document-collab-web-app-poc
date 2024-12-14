import logging
from urllib.parse import parse_qs
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from knox.models import AuthToken
from datetime import timedelta
from django.utils.timezone import now

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_token(token):
    try:
        logger.debug(f"Received token: {token}")
        # Extract token key (first 8 characters)
        token_instance = AuthToken.objects.filter(token_key=token[:8]).first()
        if token_instance:
            # Check if token is expired
            expiry = token_instance.expiry or (token_instance.created + timedelta(days=10))  # Default 10-day expiry
            if now() > expiry:
                logger.debug("Token is expired")
                return AnonymousUser()
            return token_instance.user
    except Exception as e:
        logger.error(f"Error resolving user from token: {e}")
    return AnonymousUser()


class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            logger.debug("No token provided in WebSocket request")
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)


def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(AuthMiddlewareStack(inner))
