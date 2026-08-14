import os

files_to_fix = [
    "backend/app/rag/embeddings.py",
    "backend/app/rag/llm.py",
    "backend/app/auth/router.py",
    "backend/app/rag/vectorstore.py",
    "backend/app/auth/service.py",
    "backend/app/auth/dependencies.py",
    "backend/app/chat/router.py",
    "backend/app/database.py",
    "backend/app/chat/service.py",
    "backend/app/documents/chunking.py",
    "backend/app/documents/service.py",
    "backend/app/main.py",
    "backend/app/documents/router.py"
]

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i in range(1, len(lines)):
        # If the previous line opens a block (ends with ':') and this line is double-indented (8 spaces instead of 4)
        if lines[i-1].strip().endswith(':') and lines[i].startswith('        ') and not lines[i].startswith('            '):
            lines[i] = lines[i][4:]
            
        # Or if it's 12 spaces instead of 8 (e.g. inside a class method)
        elif lines[i-1].strip().endswith(':') and lines[i].startswith('            ') and not lines[i].startswith('                '):
            lines[i] = lines[i][4:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)

print("Fixed indentation.")
