@echo off
echo Starting Caption Generation Server...

:: Change to the caption-gen directory
cd .\caption-gen

:: Activate the Python virtual environment
call .\gen-env\Scripts\activate.bat

:: Run the server script
python script.py

:: If the script exits, keep the window open to see any error messages
pause
