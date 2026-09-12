import subprocess
import sys
import os
import time

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def main():
    print("=" * 70)
    print(">> PACKD AI: Intelligent Food Packaging Recommendation Engine")
    print("   Smart India Hackathon (SIH 2026) Flagship Architecture")
    print("=" * 70)
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    
    # Path to python in venv if present
    python_exe = os.path.join(backend_dir, "venv", "Scripts", "python.exe") if sys.platform == "win32" else os.path.join(backend_dir, "venv", "bin", "python")
    if not os.path.exists(python_exe):
        python_exe = sys.executable

    print("\n[1/2] Starting FastAPI Backend (http://127.0.0.1:8000)...")
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = backend_dir
    backend_proc = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=backend_dir,
        env=backend_env
    )
    
    time.sleep(2)
    
    print("[2/2] Starting React + Vite Frontend (http://127.0.0.1:3000)...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )
    
    print("\n" + "=" * 70)
    print("Application Running Successfully!")
    print("  Frontend UI:      http://127.0.0.1:3000")
    print("  Backend Swagger:  http://127.0.0.1:8000/docs")
    print("  Backend Redoc:    http://127.0.0.1:8000/redoc")
    print("=" * 70)
    print("Press Ctrl+C to gracefully stop all services.\n")
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
