import os
import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    if filepath.endswith('.py'):
        # Remove all docstrings
        content = re.sub(r'"""[\s\S]*?"""\n?', '', content)
        # Remove full-line comments
        content = re.sub(r'^[ \t]*#.*?\n', '', content, flags=re.MULTILINE)
        # Remove end-of-line comments
        content = re.sub(r'[ \t]+#.*?\n', '\n', content)
        
    elif filepath.endswith('.js') or filepath.endswith('.jsx'):
        # Remove JSDoc / block comments
        content = re.sub(r'/\*[\s\S]*?\*/\n?', '', content)
        # Remove full-line // comments
        content = re.sub(r'^[ \t]*//.*?\n', '', content, flags=re.MULTILINE)
        # Remove end-of-line // comments
        content = re.sub(r'[ \t]+//.*?\n', '\n', content)
        # Remove full-line JSX comments
        content = re.sub(r'^[ \t]*\{/\*[\s\S]*?\*/\}\n', '', content, flags=re.MULTILINE)

    # Clean up excessive blank lines (more than 2 consecutive newlines -> 2 newlines)
    content = re.sub(r'\n{3,}', '\n\n', content)
    # Strip leading blank lines
    content = content.lstrip('\n')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned {filepath}")

for root, dirs, files in os.walk('.'):
    if 'venv' in root or 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith(('.py', '.js', '.jsx')):
            # Skip this script itself and config files that might need comments
            if file == 'cleanup.py' or file == 'vite.config.js':
                continue
            clean_file(os.path.join(root, file))
