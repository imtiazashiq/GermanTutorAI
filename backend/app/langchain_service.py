"""Service for interacting with Ollama using LangChain"""
from typing import List, Dict, Optional
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.config import settings


class LangChainService:
    """Service to handle Ollama interactions using LangChain"""
    
    def __init__(self):
        try:
            self.llm = ChatOllama(
                base_url=settings.ollama_base_url,
                model=settings.ollama_model,
                temperature=0.7,
            )
            print(f"Initialized ChatOllama with model: {settings.ollama_model}, base_url: {settings.ollama_base_url}")
        except Exception as e:
            print(f"Error initializing ChatOllama: {e}")
            raise
    
    def generate(self, prompt: str, system_prompt: Optional[str] = None, 
                 conversation_history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Generate a response from Ollama using LangChain
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            conversation_history: Previous conversation messages (optional)
        
        Returns:
            Generated response text
        """
        try:
            # Build messages list
            messages = []
            
            # Add system prompt if provided (should be first)
            if system_prompt:
                messages.append(SystemMessage(content=system_prompt))
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history:
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=msg["content"]))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=msg["content"]))
            
            # Add current user message
            messages.append(HumanMessage(content=prompt))
            
            # Use invoke for synchronous calls
            response = self.llm.invoke(messages)
            
            # Handle different response types
            if hasattr(response, 'content'):
                return response.content
            elif isinstance(response, str):
                return response
            else:
                # Try to get string representation
                return str(response)
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            error_msg = str(e)
            
            # Check if it's a connection error
            if "10061" in error_msg or "refused" in error_msg.lower() or "ConnectError" in error_msg:
                raise Exception(
                    f"Cannot connect to Ollama at {settings.ollama_base_url}. "
                    f"Please ensure Ollama is running. You can start it with: ollama serve"
                )
            
            print(f"Error in langchain_service.generate: {error_trace}")
            print(f"Messages sent: {messages}")
            print(f"System prompt: {system_prompt}")
            raise Exception(f"Error calling Ollama via LangChain: {error_msg}")
    
    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> dict:
        """
        Generate a JSON response from Ollama
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
        
        Returns:
            Parsed JSON response
        """
        import json
        response_text = self.generate(prompt, system_prompt)
        
        # Try to extract JSON from response
        try:
            # Look for JSON in code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                # Try to find JSON object directly
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_text = response_text[json_start:json_end]
                else:
                    raise ValueError("No JSON found in response")
            
            return json.loads(json_text)
        except (json.JSONDecodeError, ValueError) as e:
            # If JSON parsing fails, return the raw response
            raise Exception(f"Failed to parse JSON response: {str(e)}\nResponse: {response_text}")


# Global instance
langchain_service = LangChainService()
