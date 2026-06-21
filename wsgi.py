import sys
import os

# Add the Backend folder to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__name__), 'Backend')))

from Backend.app import app

if __name__ == "__main__":
    app.run()
