"""Pydantic models for request/response schemas"""
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    """Chat request model"""
    model_config = ConfigDict(populate_by_name=True)
    
    message: str
    language: str  # 'en-de' or 'de-en'
    formality: str  # 'du' or 'sie'
    conversationHistory: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    model_config = ConfigDict(populate_by_name=True)
    
    response: str
    translatedText: Optional[str] = None


class CourseRequest(BaseModel):
    """Course creation request model"""
    model_config = ConfigDict(populate_by_name=True)
    
    level: str  # 'A1', 'A2', 'B1', 'B2', 'C1'
    dailyStudyHours: float
    goals: Optional[str] = None


class Lesson(BaseModel):
    """Lesson model"""
    title: str
    content: str
    vocabulary: List[str]
    grammar: List[str]
    exercises: List[str]


class CourseResponse(BaseModel):
    """Course response model"""
    model_config = ConfigDict(populate_by_name=True)
    
    courseName: str
    level: str
    lessons: List[Lesson]
    estimatedDuration: str


class ExerciseRequest(BaseModel):
    """Exercise generation request"""
    lessonIndex: int
    lessonTitle: str
    lessonContent: str
    vocabulary: List[str]
    grammar: List[str]
    level: str


class ExerciseResponse(BaseModel):
    """Exercise response"""
    exercises: List[str]
    solutions: Optional[List[str]] = None


class ProgressRequest(BaseModel):
    """Progress update request"""
    lessonIndex: int
    exerciseIndex: Optional[int] = None
    completed: bool


class ProgressResponse(BaseModel):
    """Progress response"""
    lessonIndex: int
    completed: bool
    progress: float  # 0.0 to 1.0

