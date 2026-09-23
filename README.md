# MY_Editor — Web Code Editor

MY_Editor is a lightweight web-based code editor that provides a VS Code-like development experience in the browser. It uses **React + Monaco Editor** for the frontend and **FastAPI + Python** for the backend.

The editor currently supports:

- Python code editing and execution
- Java code editing, compilation, and execution
- Creating files inside a backend `workspace` directory
- Opening existing files
- Saving edited files
- File explorer with refresh
- Syntax highlighting through Monaco Editor
- Execution output and error display
- Execution status reporting
- FastAPI REST APIs for file management and code execution

---

## 1. Project Architecture

The project follows a simple client-server architecture:

```text
                    ┌─────────────────────────┐
                    │       Browser           │
                    │                         │
                    │ React + Monaco Editor   │
                    │ File Explorer            │
                    │ Terminal / Output        │
                    └────────────┬────────────┘
                                 │
                         HTTP / REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       FastAPI           │
                    │                         │
                    │ File Management         │
                    │ Code Execution           │
                    └────────────┬────────────┘
                                 │
                         Python subprocess
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
          Python Interpreter                 Java Compiler
             python3                            javac
                 │                               │
                 ▼                               ▼
              Output                          JVM / java
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                           Browser Output
```

### Main components

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React | User interface |
| Code Editor | Monaco Editor | VS Code-style editor |
| Backend | FastAPI | REST API |
| Backend Language | Python | Server-side logic |
| Python execution | `python3` | Runs Python code |
| Java compilation | `javac` | Compiles Java code |
| Java execution | `java` | Runs compiled Java code |
| File storage | Local filesystem | Stores files in `workspace/` |

---

# 2. Features

## Code Editor

The application uses Monaco Editor, the same editor technology used by VS Code.

It provides:

- Syntax highlighting
- Line numbers
- Automatic layout
- Word wrapping
- Cursor animation
- Dark theme
- Configurable font size
- Tab size

Supported languages:

```text
Python
Java
```

---

## File Explorer

The left sidebar contains a `workspace` explorer.

Users can:

- View available files
- Create a new file
- Open a file
- Refresh the file list
- Save the current file

Supported file extensions:

```text
.py
.java
```

Example:

```text
workspace/
├── hello.py
├── calculator.py
└── Main.java
```

---

## Run Code

Clicking **Run** sends the current language and editor code to the FastAPI backend.

Example request:

```json
{
  "language": "python",
  "code": "print('Hello World')"
}
```

The backend executes the code and returns:

```json
{
  "output": "Hello World\n",
  "error": "",
  "status": 0
}
```

---

## Terminal / Output

The bottom panel displays:

- Program output
- Runtime errors
- Compilation errors
- Process exit status

Example:

```text
Hello Abhijeet

Process exited with code 0
```

---

# 3. Technology Stack

## Frontend

- React
- JavaScript / JSX
- Vite
- Monaco Editor
- CSS

## Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

## Execution

- Python 3
- Java JDK
- `subprocess`
- Temporary directories

---

# 4. Project Structure

A typical project structure is:

```text
MY_Editor/
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── editor.py
│   └── workspace/
│       ├── example.py
│       └── Main.java
│
└── README.md
```

The exact directory names can be changed according to your project setup.

---

# 5. Prerequisites

Before starting the project, install the following:

### Node.js

Check:

```bash
node --version
```

and:

```bash
npm --version
```

### Python

Check:

```bash
python3 --version
```

### Java JDK

Check:

```bash
java --version
```

and:

```bash
javac --version
```

The Java compiler (`javac`) is required because the backend compiles Java source code before running it.

---

# 6. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

## Create a virtual environment

Linux/macOS:

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

Windows:

```bash
python -m venv .venv
```

Activate:

```powershell
.venv\Scripts\activate
```

---

## Install dependencies

Install FastAPI and Uvicorn:

```bash
pip install fastapi uvicorn
```

You can also create a `requirements.txt`:

```text
fastapi
uvicorn
```

Then install:

```bash
pip install -r requirements.txt
```

---

# 7. Backend Configuration

The backend creates a local workspace automatically:

```python
WORKSPACE = Path("workspace")
WORKSPACE.mkdir(exist_ok=True)
```

Therefore, when the backend starts, the following directory is created if it does not already exist:

```text
workspace/
```

Files created through the web editor are stored there.

---

# 8. Start the Backend

If your backend file is named:

```text
editor.py
```

run:

```bash
uvicorn editor:app --reload
```

If it is named:

```text
main.py
```

run:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# 9. Frontend Setup

Open another terminal.

Navigate to your frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

If Monaco Editor is not installed:

```bash
npm install @monaco-editor/react
```

---

# 10. Start the Frontend

Run:

```bash
npm run dev
```

Vite will display a URL such as:

```text
http://localhost:5173
```

Open that URL in your browser.

The frontend communicates with:

```text
http://127.0.0.1:8000
```

---

# 11. CORS Configuration

The frontend and backend normally run on different ports.

Example:

```text
Frontend → localhost:5173
Backend  → 127.0.0.1:8000
```

Therefore, FastAPI needs CORS configuration.

The backend should contain:

```python
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
```

This allows the React application to communicate with FastAPI during local development.

---

# 12. Frontend API Configuration

The React application uses:

```javascript
const API_URL = 'http://127.0.0.1:8000';
```

All API requests are constructed from this URL.

For example:

```javascript
fetch(`${API_URL}/files`)
```

and:

```javascript
fetch(`${API_URL}/run`)
```

If your backend is hosted somewhere else, change `API_URL`.

---

# 13. REST API Documentation

## GET `/files`

Returns all files in the workspace.

### Request

```http
GET /files
```

### Response

```json
{
  "files": [
    "hello.py",
    "Main.java"
  ]
}
```

---

# 14. POST `/files`

Creates a new file.

### Request

```http
POST /files
Content-Type: application/json
```

Body:

```json
{
  "filename": "hello.py"
}
```

### Successful response

```json
{
  "success": true,
  "filename": "hello.py"
}
```

### Existing file response

```json
{
  "success": false,
  "error": "File already exists"
}
```

### Important implementation detail

The backend must receive the Pydantic request model:

```python
class CreateFileRequest(BaseModel):
    filename: str


@app.post("/files")
def create_file(request: CreateFileRequest):
    file_path = WORKSPACE / request.filename
```

The frontend sends `filename` as JSON.

---

# 15. GET `/files/{filename}`

Opens an existing file.

### Request

```http
GET /files/hello.py
```

### Response

```json
{
  "success": true,
  "filename": "hello.py",
  "code": "print('Hello World')"
}
```

The frontend loads the returned code into Monaco Editor.

---

# 16. PUT `/files`

Saves the current file.

### Request

```http
PUT /files
Content-Type: application/json
```

Body:

```json
{
  "filename": "hello.py",
  "code": "print('Hello Abhijeet')"
}
```

### Response

```json
{
  "success": true,
  "message": "File saved"
}
```

---

# 17. POST `/run`

Executes the code currently present in the editor.

### Request

```http
POST /run
Content-Type: application/json
```

Python example:

```json
{
  "language": "python",
  "code": "print('Hello World')"
}
```

Java example:

```json
{
  "language": "java",
  "code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello\"); } }"
}
```

---

# 18. Python Execution Flow

For Python, the backend uses:

```python
subprocess.run(
    ["python3", "-c", code],
    capture_output=True,
    text=True,
    timeout=5
)
```

The flow is:

```text
React Editor
     ↓
POST /run
     ↓
FastAPI
     ↓
python3 -c <code>
     ↓
Python Interpreter
     ↓
stdout / stderr
     ↓
FastAPI response
     ↓
React Terminal
```

Example:

```python
print("Hello World")
```

Output:

```text
Hello World
```

---

# 19. Java Execution Flow

Java requires compilation before execution.

The backend creates a temporary directory and writes:

```text
Main.java
```

The source is compiled using:

```bash
javac Main.java
```

If compilation succeeds, it runs:

```bash
java Main
```

The flow is:

```text
React Editor
     ↓
POST /run
     ↓
FastAPI
     ↓
Create temporary Main.java
     ↓
javac Main.java
     ↓
Compilation successful
     ↓
java Main
     ↓
Output
     ↓
React Terminal
```

---

# 20. Java Compilation Errors

If Java compilation fails, the backend returns the compiler error.

Example:

```text
error: ';' expected
```

The frontend displays the error in the terminal area.

---

# 21. Execution Timeout

The backend currently limits execution to five seconds:

```python
timeout=5
```

This prevents a program that does not terminate from running indefinitely.

For example:

```python
while True:
    pass
```

will eventually produce:

```text
Execution timed out
```

---

# 22. Frontend File Creation Flow

When the user clicks:

```text
＋ New File
```

the UI displays a filename input.

For example:

```text
calculator.py
```

The React application sends:

```json
{
  "filename": "calculator.py"
}
```

to:

```text
POST /files
```

After successful creation:

1. The filename is cleared.
2. The New File form closes.
3. The file list is refreshed.
4. The new file is opened.
5. The file becomes the current editor file.

---

# 23. Opening a File

Clicking a file in the explorer calls:

```javascript
openFile(filename)
```

The frontend requests:

```text
GET /files/{filename}
```

The returned source code is placed into Monaco:

```javascript
setCode(data.code || '');
```

The application also detects the language from the extension:

```text
.py   → Python
.java → Java
```

---

# 24. Saving a File

Clicking:

```text
💾 Save
```

sends:

```json
{
  "filename": "hello.py",
  "code": "print('Updated code')"
}
```

to:

```text
PUT /files
```

The backend writes the code to the corresponding workspace file.

The terminal displays:

```text
✓ hello.py saved successfully.
```

---

# 25. Running a File

The Run button does not directly execute a file from the browser.

Instead, it sends the current editor content:

```json
{
  "language": "python",
  "code": "..."
}
```

to the backend.

This means the user can edit code and immediately test the current editor content.

---

# 26. Error Handling

The frontend handles several types of errors.

### Backend unavailable

```text
Could not connect to backend.
```

### File creation error

```text
Could not create file.
```

### File opening error

```text
Could not open file.
```

### Save error

```text
Could not save file.
```

### Code execution error

The backend's `stderr` is displayed in the terminal.

---

# 27. Common Problems

## 422 Unprocessable Content

A 422 response generally means that the request sent to FastAPI does not match the expected request model.

For `POST /files`, the backend expects:

```json
{
  "filename": "example.py"
}
```

and the endpoint should use:

```python
@app.post("/files")
def create_file(request: CreateFileRequest):
```

not:

```python
@app.post("/files")
def create_file(filename: str):
```

---

## CORS Error

If the browser reports a CORS error, verify:

```python
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
```

Also verify that FastAPI is running on:

```text
127.0.0.1:8000
```

---

## Backend Connection Error

Check:

```bash
curl http://127.0.0.1:8000/files
```

A working backend should return JSON similar to:

```json
{
  "files": []
}
```

---

## Java Not Running

Check:

```bash
java --version
```

and:

```bash
javac --version
```

If `javac` is missing, install a Java Development Kit rather than only a Java runtime.

---

# 28. Testing the API with Swagger

FastAPI automatically provides interactive API documentation.

Open:

```text
http://127.0.0.1:8000/docs
```

You can test:

```text
GET  /files
POST /files
GET  /files/{filename}
PUT  /files
POST /run
```

For example, test `POST /files` with:

```json
{
  "filename": "test.py"
}
```

A successful response is:

```json
{
  "success": true,
  "filename": "test.py"
}
```

---

# 29. Example Python Program

Create:

```text
hello.py
```

Code:

```python
name = "Abhijeet"

print("Hello", name)
print("Welcome to MY_Editor")
```

Click **Save**, then **Run**.

Expected output:

```text
Hello Abhijeet
Welcome to MY_Editor
```

---

# 30. Example Java Program

Create:

```text
Main.java
```

Code:

```java
public class Main {

    public static void main(String[] args) {

        String name = "Abhijeet";

        System.out.println("Hello " + name);
        System.out.println("Welcome to MY_Editor");
    }
}
```

Click **Save** and then **Run**.

Expected output:

```text
Hello Abhijeet
Welcome to MY_Editor
```

---

# 31. Development Workflow

The normal development workflow is:

```text
1. Start FastAPI
       ↓
2. Start Vite
       ↓
3. Open browser
       ↓
4. Create/Open a file
       ↓
5. Write code in Monaco
       ↓
6. Save
       ↓
7. Run
       ↓
8. Backend executes code
       ↓
9. Output appears in terminal
```

---

# 32. Future Improvements

Possible improvements for the project include:

- Multiple editor tabs
- Delete and rename files
- Folder creation
- File search
- Code formatting
- IntelliSense/autocomplete
- Git integration
- Syntax error highlighting
- Command terminal
- More programming languages
- User authentication
- Project/workspace management
- Docker-based code execution
- Resource limits for CPU and memory
- Sandboxed execution
- Persistent database storage
- Cloud deployment
- WebSocket-based terminal
- Real-time collaborative editing

---

# 33. Security Considerations

The current backend executes code using the host machine's:

```python
subprocess
```

This is suitable for a local development project, but it should **not be exposed directly to untrusted users on the internet**.

Arbitrary code execution can potentially access the host system.

For production, code execution should be isolated using mechanisms such as:

```text
Browser
   ↓
FastAPI
   ↓
Execution Queue
   ↓
Sandbox / Container
   ↓
Resource Limits
   ↓
Output
```

Recommended production controls include:

- Containerized execution
- CPU limits
- Memory limits
- Execution time limits
- Network restrictions
- Restricted filesystem access
- Non-root execution
- Process limits
- Temporary isolated workspaces
- Input validation
- Filename/path validation

---

# 34. Important Security Improvement for File Paths

Before exposing the application to untrusted users, filenames should be validated to prevent path traversal.

For example, avoid allowing values such as:

```text
../../some-file
```

A safer approach is to validate the resolved path against the workspace directory before reading or writing files.

---

# 35. Current API Summary

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/files` | List workspace files |
| POST | `/files` | Create a file |
| GET | `/files/{filename}` | Read a file |
| PUT | `/files` | Save/update a file |
| POST | `/run` | Execute code |

---

# 36. Project Goal

The main goal of MY_Editor is to demonstrate how a browser-based code editor can communicate with a backend execution engine.

The project combines:

```text
React
+
Monaco Editor
+
FastAPI
+
Python subprocess
+
Java compiler/JVM
+
Local file system
```

This creates a complete development workflow where code can be **written, saved, executed, and viewed directly from a web interface**.

---

# 37. License

This project is intended for educational and development purposes. Add your preferred license here if you plan to publish the project publicly.

---

## Author

**Abhijeet Verma**

Built as a web-based code editor project using React, Monaco Editor, FastAPI, Python, and Java.
