"""
Run the full Week 4 pipeline end to end:
    1. Generate the synthetic retail dataset
    2. Train and evaluate the classification models
    3. (Report generation is a separate Node.js step — see README)

Usage (from the project root, in VS Code's integrated terminal):
    python main.py
"""
import subprocess
import sys

def run(script):
    print(f"\n{'='*60}\nRunning {script}\n{'='*60}")
    result = subprocess.run([sys.executable, script])
    if result.returncode != 0:
        sys.exit(result.returncode)

if __name__ == "__main__":
    run("src/generate_dataset.py")
    run("src/train_and_evaluate.py")
    print("\nDone. Metrics saved to outputs/metrics.json, figures saved to outputs/figures/.")
