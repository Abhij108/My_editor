import subprocess
import tempfile
import os 
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class CodeRequest(BaseModel):
    language: str
    code: str



WORKSPACE = Path("workspace")
WORKSPACE.mkdir(exist_ok=True)


class CreateFileRequest(BaseModel):
    filename: str


@app.post("/files")
def create_file(request: CreateFileRequest):

    file_path = WORKSPACE / request.filename

    if file_path.exists():
        return {
            "success": False,
            "error": "File already exists"
        }

    file_path.touch()

    return {
        "success": True,
        "filename": request.filename
    }

@app.get("/files/{filename}")
def read_file(filename: str):

    file_path = WORKSPACE / filename

    if not file_path.exists():
        return {
            "success": False,
            "error": "File not found"
        }

    return {
        "success": True,
        "filename": filename,
        "code": file_path.read_text()
    }

class FileRequest(BaseModel):
    filename: str
    code: str

@app.put("/files")
def update_file(request: FileRequest):

    file_path = WORKSPACE / request.filename

    file_path.write_text(request.code)

    return {
        "success": True,
        "message": "File saved"
    }

@app.get("/files")
def list_files():

    files = []

    for file in WORKSPACE.iterdir():

        if file.is_file():
            files.append(file.name)

    return {
        "files": files
    }


def python_editor(code):

    try:

        result = subprocess.run(
            ["python3", "-c", code],
            capture_output=True,
            text=True,
            timeout=5
        )

        return {
            "output": result.stdout,
            "error": result.stderr,
            "status": result.returncode
            }

    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": "Execution timed out",
            "status": -1
        }
        

def java_editor(code):
    

    with tempfile.TemporaryDirectory() as temp_dir:

        java_file = os.path.join(temp_dir, "Main.java")

        with open(java_file, "w") as file:
            file.write(code)

        # Compile
        compile_result = subprocess.run(
            ["javac", java_file],
            capture_output=True,
            text=True,
            timeout=5
        )

        # Compilation error
        if compile_result.returncode != 0:
            print("----- COMPILATION ERROR -----")
            print(compile_result.stderr)
            return

        # Run
        run_result = subprocess.run(
            ["java", "-cp", temp_dir, "Main"],
            capture_output=True,
            text=True,
            timeout=5
        )

        
        return {
            "output": run_result.stdout,
            "error": run_result.stderr,
            "status": run_result.returncode
            }




@app.post("/run")
def run_code(request: CodeRequest):

    if request.language == "python":
        return python_editor(request.code)

    elif request.language == "java":
        return java_editor(request.code)

    else:
        return {
            "output": "",
            "error": "Unsupported language",
            "status": -1
        }