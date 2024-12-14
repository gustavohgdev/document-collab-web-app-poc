from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Document, DocumentCollaborator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class DocumentCollaboratorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = DocumentCollaborator
        fields = ('id', 'user', 'permission', 'added_at')

class DocumentSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    collaborators = DocumentCollaboratorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Document
        fields = ('id', 'title', 'content', 'owner', 'collaborators', 
                 'created_at', 'updated_at')
        read_only_fields = ('owner', 'created_at', 'updated_at')