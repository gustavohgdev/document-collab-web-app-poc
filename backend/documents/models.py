from django.db import models
from django.contrib.auth.models import User  # Django's built-in user model

class Document(models.Model):
    # Basic document information
    title = models.CharField(max_length=255)  # The document's title
    content = models.JSONField(default=dict)  # The document's content
    
    # Who owns the document
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_documents'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)  # When document was created
    updated_at = models.DateTimeField(auto_now=True)      # When document was last updated

    def __str__(self):
        return self.title

class DocumentCollaborator(models.Model):
    # Possible permission levels
    PERMISSION_CHOICES = [
        ('VIEW', 'View Only'),
        ('EDIT', 'Edit'),
        ('ADMIN', 'Admin'),
    ]

    # Link to document and user
    document = models.ForeignKey(
        Document, 
        on_delete=models.CASCADE,
        related_name='collaborators'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='collaborated_documents'
    )
    
    # Collaborator's permission level
    permission = models.CharField(
        max_length=10,
        choices=PERMISSION_CHOICES,
        default='VIEW'
    )
    
    # When this collaboration was created
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensure a user can only be added once as a collaborator to a document
        unique_together = ('document', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.document.title} ({self.permission})"
    