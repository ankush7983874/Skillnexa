import sys
import os

# Add ai-service directory to python path for module imports
ai_service_dir = os.path.join(os.path.dirname(__file__), '..', 'ai-service')
if ai_service_dir not in sys.path:
    sys.path.insert(0, ai_service_dir)

from app.main import app

# Export app for Vercel Python Serverless Runtime
__all__ = ["app"]
