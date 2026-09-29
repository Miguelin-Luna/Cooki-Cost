from dotenv import load_dotenv
load_dotenv()
import os
print('KEY:', os.getenv('GEMINI_API_KEY'))