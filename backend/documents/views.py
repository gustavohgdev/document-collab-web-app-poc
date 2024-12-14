from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q

from .models import Document, DocumentCollaborator
from .serializers import DocumentSerializer, DocumentCollaboratorSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return documents that the user owns or collaborates on
        """
        user = self.request.user
        return Document.objects.filter(
            Q(owner=user) | 
            Q(collaborators__user=user)
        ).distinct()

    def perform_create(self, serializer):
        """
        Set the owner when creating a new document
        """
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_collaborator(self, request, pk=None):
        """
        Add a collaborator to the document
        POST /api/documents/{username}/add_collaborator/
        """
        document = self.get_object()
        
        # Check if user is the owner
        if document.owner != request.user:
            return Response(
                {'error': 'Only the owner can add collaborators'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get username to add as collaborator
        username = request.data.get('username')
        if not username:
            return Response(
                {'error': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get permission level
        permission = request.data.get('permission', 'VIEW')
        if permission not in ['VIEW', 'EDIT', 'ADMIN']:
            return Response(
                {'error': 'Invalid permission level'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or update collaborator
        collaborator, created = DocumentCollaborator.objects.update_or_create(
            document=document,
            user=user,
            defaults={'permission': permission}
        )

        serializer = DocumentCollaboratorSerializer(collaborator)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def remove_collaborator(self, request, pk=None):
        """
        Remove a collaborator from the document
        POST /api/documents/{id}/remove_collaborator/
        """
        document = self.get_object()
        
        # Check if user is the owner
        if document.owner != request.user:
            return Response(
                {'error': 'Only the owner can remove collaborators'},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get('username')
        if not username:
            return Response(
                {'error': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            collaborator = DocumentCollaborator.objects.get(
                document=document,
                user=user
            )
            collaborator.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DocumentCollaborator.DoesNotExist:
            return Response(
                {'error': 'Collaborator not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def collaborators(self, request, pk=None):
        """
        Get list of collaborators for a document
        GET /api/documents/{id}/collaborators/
        """
        document = self.get_object()
        collaborators = document.collaborators.all()
        serializer = DocumentCollaboratorSerializer(collaborators, many=True)
        return Response(serializer.data)