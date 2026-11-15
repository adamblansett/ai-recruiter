import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ResumeUploadResponse(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    label: str
    file_path: str
    file_hash: str
    file_size_bytes: int
    mime_type: str
    target_role_category: Optional[str] = None
    is_primary: bool
    created_at: datetime
    parsed_snippet: Optional[str] = None

    model_config = {"from_attributes": True}


class ResumeRead(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    label: str
    file_path: str
    file_hash: str
    file_size_bytes: int
    mime_type: str
    parsed_markdown: Optional[str] = None
    target_role_category: Optional[str] = None
    is_primary: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
