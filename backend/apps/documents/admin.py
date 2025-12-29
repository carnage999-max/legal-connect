from django.contrib import admin
from .models import Document, DocumentSignature, DocumentAccessLog


class DocumentSignatureInline(admin.TabularInline):
    model = DocumentSignature
    extra = 0
    readonly_fields = ('signer', 'status', 'signed_at', 'signature_hash')


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'matter', 'document_type', 'status', 'version', 'uploaded_by', 'created_at')
    list_filter = ('document_type', 'status', 'requires_signature', 'is_confidential', 'created_at')
    search_fields = ('title', 'description', 'matter__title', 'uploaded_by__email')
    readonly_fields = ('id', 'original_filename', 'file_size', 'file_type', 'created_at', 'updated_at')
    inlines = [DocumentSignatureInline]


@admin.register(DocumentSignature)
class DocumentSignatureAdmin(admin.ModelAdmin):
    list_display = ('document', 'signer', 'status', 'requested_at', 'signed_at')
    list_filter = ('status', 'requested_at', 'signed_at')
    search_fields = ('document__title', 'signer__email')
    readonly_fields = ('id', 'signature_hash', 'ip_address', 'requested_at', 'signed_at')


@admin.register(DocumentAccessLog)
class DocumentAccessLogAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'access_type', 'accessed_at')
    list_filter = ('access_type', 'accessed_at')
    search_fields = ('document__title', 'user__email')
    readonly_fields = ('id', 'document', 'user', 'access_type', 'ip_address', 'accessed_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
