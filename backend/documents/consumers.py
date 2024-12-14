import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Document
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class DocumentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.document_id = self.scope['url_route']['kwargs']['document_id']
        self.room_group_name = f'document_{self.document_id}'

        logger.debug(f"Connecting WebSocket for document {self.document_id}")
        logger.debug(f"User in scope: {self.scope['user']}")

        # Check if user has permission to access the document
        if not await self.has_document_permission():
            logger.debug("User does not have permission to access the document")
            await self.close()
            return

        # Join document group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave document group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Check if user has edit permission
        if await self.has_edit_permission():
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'document_change',
                    'content': data['content'],
                    'user_id': self.scope['user'].id
                }
            )
            # Save to database
            await self.save_document(data['content'])

    async def document_change(self, event):
        # Don't send message back to the sender
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'change',
                'content': event['content']
            }))

    @database_sync_to_async
    def has_document_permission(self):
        try:
            user = self.scope['user']
            if not user.is_authenticated:
                logger.debug("User is not authenticated")
                return False

            logger.debug(f"Checking permissions for user {user} on document {self.document_id}")
            document = Document.objects.get(id=self.document_id)
            has_permission = (
                document.owner == user or
                document.collaborators.filter(user=user).exists()
            )
            logger.debug(f"Permission check result: {has_permission}")
            return has_permission
        except Document.DoesNotExist:
            logger.debug(f"Document {self.document_id} does not exist")
            return False

    @database_sync_to_async
    def has_edit_permission(self):
        """
        Check if the user has edit permissions for the document.
        """
        try:
            user = self.scope['user']
            if not user.is_authenticated:
                return False

            # Resolve UserLazyObject to a concrete User instance
            user = User.objects.get(id=user.id)

            document = Document.objects.get(id=self.document_id)
            if document.owner == user:
                return True

            collaborator = document.collaborators.filter(user=user).first()
            return collaborator and collaborator.permission in ['EDIT', 'ADMIN']
        except User.DoesNotExist:
            return False
        except Document.DoesNotExist:
            return False

    @database_sync_to_async
    def save_document(self, content):
        """
        Save the document content to the database.
        """
        try:
            document = Document.objects.get(id=self.document_id)
            document.content = content
            document.save()
        except Document.DoesNotExist:
            pass
