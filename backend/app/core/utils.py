import unicodedata
import re

def normalize_text(text: str) -> str:
    """Normalizes text: lowercase, strip accents, remove punctuation and extra spaces."""
    if not text:
        return ""
    # Lowercase
    text = text.lower()
    # Remove accents
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    # Remove punctuation
    text = re.sub(r'[^\w\s]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text
