import os

def list_files(startpath):
    startpath = os.path.abspath(startpath)
    for root, dirs, files in os.walk(startpath):
        # Modify dirs in-place to prevent descent into unwanted folders
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git')]
        
        # Consistent depth calculation even if startpath is found in path components
        rel_path = os.path.relpath(root, startpath)
        level = 0 if rel_path == "." else rel_path.count(os.sep) + 1
        
        indent = ' ' * 4 * level
        print('{}{}/'.format(indent, os.path.basename(root)))
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print('{}{}'.format(subindent, f))

list_files('.')
