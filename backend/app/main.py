"""FastAPI main application"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    ChatRequest, ChatResponse, CourseRequest, CourseResponse,
    ExerciseRequest, ExerciseResponse, ProgressRequest, ProgressResponse
)
from app.langchain_service import langchain_service
from app.config import settings
import json

app = FastAPI(
    title="German Tutor API",
    description="Backend API for German learning assistant using Ollama",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# System prompts
CHAT_SYSTEM_PROMPT = """You are a helpful German language tutor. Your role is to:
1. Help students learn German through conversation
2. Translate between English and German when requested
3. Use the appropriate formality level (du/informal or Sie/formal)
4. Provide explanations and corrections when needed
5. Be encouraging and supportive

When translating:
- If language is 'en-de': Translate from English to German
- If language is 'de-en': Translate from English to German (the user is writing in English but wants German response)

When formality is:
- 'du': Use informal "du" form (du, dein, dir, etc.)
- 'sie': Use formal "Sie" form (Sie, Ihr, Ihnen, etc.)

Always respond in the target language when appropriate. If the user asks a question in English about German, you can respond in English. If they're practicing German, respond in German.
"""

COURSE_SYSTEM_PROMPT = """You are an expert German language course designer. Create comprehensive, structured German language courses.

Generate courses in JSON format with this exact structure:
{
  "courseName": "Course name",
  "level": "A1/A2/B1/B2/C1",
  "lessons": [
    {
      "title": "Lesson title",
      "content": "Detailed lesson content explaining the topic",
      "vocabulary": ["word1", "word2", "word3"],
      "grammar": ["grammar rule 1", "grammar rule 2"],
      "exercises": ["exercise 1", "exercise 2", "exercise 3"]
    }
  ],
  "estimatedDuration": "X weeks or Y months"
}

Guidelines:
- Create 5-8 lessons per course
- Each lesson should be comprehensive and progressive
- Vocabulary should be relevant to the lesson topic
- Grammar rules should be clear and applicable
- Exercises should be practical and varied
- Adjust lesson count based on dailyStudyHours (more hours = more lessons)
- Incorporate user goals if provided
- Make lessons engaging and practical

Always respond with valid JSON only, no additional text."""


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "German Tutor API",
        "status": "running",
        "model": settings.ollama_model
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handle chat messages for German-English conversation practice
    """
    try:
        import traceback
        
        # Build conversation history
        conversation_history = []
        if request.conversationHistory:
            conversation_history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.conversationHistory
            ]
        
        # Build the prompt based on language direction
        if request.language == "en-de":
            # User wants to practice English -> German
            prompt = f"""User message: {request.message}

Please respond as a German tutor. The user is practicing translating from English to German.
- Formality level: {'Sie (formal)' if request.formality == 'sie' else 'du (informal)'}
- Provide the German translation and explanation
- If they're asking a question, answer in German using the appropriate formality level
- Be encouraging and provide corrections if needed"""
        else:  # de-en
            # User wants to practice German -> English (or English -> German response)
            prompt = f"""User message: {request.message}

Please respond as a German tutor. The user is practicing German.
- Formality level: {'Sie (formal)' if request.formality == 'sie' else 'du (informal)'}
- Respond in German using the appropriate formality level
- Provide explanations, corrections, or translations as needed
- Be encouraging and supportive"""
        
        # Generate response (run in executor to avoid blocking)
        import asyncio
        loop = asyncio.get_event_loop()
        response_text = await loop.run_in_executor(
            None,
            lambda: langchain_service.generate(
                prompt=prompt,
                system_prompt=CHAT_SYSTEM_PROMPT,
                conversation_history=conversation_history
            )
        )
        
        return ChatResponse(
            response=response_text,
            translatedText=None  # Could be enhanced to extract translation separately
        )
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in chat endpoint: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")


@app.post("/create-course", response_model=CourseResponse)
async def create_course(request: CourseRequest):
    """
    Create a personalized German language course
    """
    try:
        # Calculate estimated number of lessons based on study hours
        # More hours per day = more lessons
        lessons_per_week = max(3, min(8, int(request.dailyStudyHours * 2)))
        
        # Build the prompt
        goals_text = f"\nUser goals: {request.goals}" if request.goals else ""
        
        prompt = f"""Create a comprehensive German language course for level {request.level}.

Requirements:
- Level: {request.level}
- Daily study hours: {request.dailyStudyHours}
- Number of lessons: {lessons_per_week}
{goals_text}

Generate a complete course with {lessons_per_week} lessons covering:
1. Vocabulary building
2. Grammar rules appropriate for {request.level} level
3. Practical exercises
4. Progressive difficulty

Return ONLY valid JSON matching the exact structure specified."""
        
        # Generate course JSON
        course_data = langchain_service.generate_json(
            prompt=prompt,
            system_prompt=COURSE_SYSTEM_PROMPT
        )
        
        # Validate and parse response
        if not isinstance(course_data, dict):
            raise ValueError("Invalid course data structure")
        
        # Calculate estimated duration
        if "estimatedDuration" not in course_data:
            weeks = lessons_per_week / (request.dailyStudyHours * 7)
            course_data["estimatedDuration"] = f"{int(weeks)} weeks" if weeks < 12 else f"{int(weeks/4)} months"
        
        # Ensure all required fields are present
        lessons = course_data.get("lessons", [])
        course_response = CourseResponse(
            courseName=course_data.get("courseName", f"German {request.level} Course"),
            level=course_data.get("level", request.level),
            lessons=lessons,
            estimatedDuration=course_data.get("estimatedDuration", "8 weeks")
        )
        
        # Initialize progress tracking
        course_id = "current_course"
        course_progress[course_id] = {
            "lessons": {},
            "totalLessons": len(lessons)
        }
        
        return course_response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating course: {str(e)}")


EXERCISE_SYSTEM_PROMPT = """You are an expert German language exercise creator. Generate interactive practice exercises for German lessons.

Generate exercises in JSON format with this exact structure:
{
  "exercises": [
    "Exercise 1 description",
    "Exercise 2 description",
    "Exercise 3 description"
  ],
  "solutions": [
    "Solution 1 (if applicable)",
    "Solution 2 (if applicable)",
    "Solution 3 (if applicable)"
  ]
}

Guidelines:
- Create 3-5 practical exercises per lesson
- Exercises should be relevant to the lesson content
- Include vocabulary practice, grammar application, and sentence construction
- Make exercises progressive in difficulty
- Solutions should be clear and helpful
- Exercises should be interactive and engaging

Always respond with valid JSON only, no additional text."""


# In-memory progress tracking (in production, use a database)
course_progress: dict = {}


@app.post("/generate-exercises", response_model=ExerciseResponse)
async def generate_exercises(request: ExerciseRequest):
    """
    Generate interactive exercises for a specific lesson
    """
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        
        prompt = f"""Generate interactive practice exercises for German lesson {request.lessonIndex + 1}: "{request.lessonTitle}"

Lesson Content: {request.lessonContent}

Vocabulary: {', '.join(request.vocabulary)}
Grammar Rules: {', '.join(request.grammar)}
Level: {request.level}

Create 3-5 practical exercises that:
1. Practice the vocabulary from this lesson
2. Apply the grammar rules
3. Build sentence construction skills
4. Are appropriate for {request.level} level

Return ONLY valid JSON matching the exact structure specified."""
        
        exercise_data = await loop.run_in_executor(
            None,
            lambda: langchain_service.generate_json(
                prompt=prompt,
                system_prompt=EXERCISE_SYSTEM_PROMPT
            )
        )
        
        if not isinstance(exercise_data, dict):
            raise ValueError("Invalid exercise data structure")
        
        return ExerciseResponse(
            exercises=exercise_data.get("exercises", []),
            solutions=exercise_data.get("solutions", [])
        )
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error generating exercises: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Error generating exercises: {str(e)}")


@app.post("/update-progress", response_model=ProgressResponse)
async def update_progress(request: ProgressRequest):
    """
    Update user progress for a lesson or exercise
    """
    try:
        # In-memory storage (use database in production)
        course_id = "current_course"  # In production, use actual course ID
        
        if course_id not in course_progress:
            course_progress[course_id] = {
                "lessons": {},
                "totalLessons": 0
            }
        
        if request.lessonIndex not in course_progress[course_id]["lessons"]:
            course_progress[course_id]["lessons"][request.lessonIndex] = {
                "completed": False,
                "exercises": {}
            }
        
        if request.completed:
            course_progress[course_id]["lessons"][request.lessonIndex]["completed"] = True
            
            if request.exerciseIndex is not None:
                course_progress[course_id]["lessons"][request.lessonIndex]["exercises"][request.exerciseIndex] = True
        
        # Calculate overall progress
        total_lessons = course_progress[course_id].get("totalLessons", 0)
        completed_lessons = sum(
            1 for lesson in course_progress[course_id]["lessons"].values()
            if lesson.get("completed", False)
        )
        
        progress = completed_lessons / total_lessons if total_lessons > 0 else 0.0
        
        return ProgressResponse(
            lessonIndex=request.lessonIndex,
            completed=request.completed,
            progress=progress
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating progress: {str(e)}")


@app.get("/get-progress")
async def get_progress():
    """
    Get user progress for the current course
    """
    course_id = "current_course"
    if course_id not in course_progress:
        return {"progress": 0.0, "lessons": {}}
    
    total_lessons = course_progress[course_id].get("totalLessons", 0)
    completed_lessons = sum(
        1 for lesson in course_progress[course_id]["lessons"].values()
        if lesson.get("completed", False)
    )
    
    progress = completed_lessons / total_lessons if total_lessons > 0 else 0.0
    
    return {
        "progress": progress,
        "lessons": course_progress[course_id]["lessons"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )

