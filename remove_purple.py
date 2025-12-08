#!/usr/bin/env python3
"""
Script untuk mengganti semua warna ungu/purple menjadi hitam/gray
"""

import os
import re

# Pattern replacements untuk warna ungu
PURPLE_PATTERNS = [
    # Purple colors
    (r'text-purple-\d+', 'notion-text'),
    (r'bg-purple-\d+', 'bg-gray-800'),
    (r'border-purple-\d+', 'border-gray-300'),
    (r'from-purple-\d+', 'from-gray-700'),
    (r'to-purple-\d+', 'to-gray-900'),
    
    # Pink colors (sering dipasangkan dengan purple)
    (r'text-pink-\d+', 'notion-text'),
    (r'bg-pink-\d+', 'bg-gray-800'),
    (r'border-pink-\d+', 'border-gray-300'),
    (r'from-pink-\d+', 'from-gray-700'),
    (r'to-pink-\d+', 'to-gray-900'),
    
    # Indigo colors
    (r'text-indigo-\d+', 'notion-text'),
    (r'bg-indigo-\d+', 'bg-gray-800'),
    (r'from-indigo-\d+', 'from-gray-700'),
    (r'to-indigo-\d+', 'to-gray-900'),
    
    # Violet colors
    (r'text-violet-\d+', 'notion-text'),
    (r'bg-violet-\d+', 'bg-gray-800'),
]

def update_file(filepath):
    """Update a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for pattern, replacement in PURPLE_PATTERNS:
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error updating {filepath}: {e}")
        return False

def main():
    """Main function"""
    components_dir = 'src/components'
    updated_files = []
    
    for filename in os.listdir(components_dir):
        if filename.endswith('.tsx'):
            filepath = os.path.join(components_dir, filename)
            if update_file(filepath):
                updated_files.append(filename)
                print(f"✓ Updated: {filename}")
    
    # Update CSS files
    css_files = ['src/index.css']
    for filepath in css_files:
        if os.path.exists(filepath):
            if update_file(filepath):
                updated_files.append(filepath)
                print(f"✓ Updated: {filepath}")
    
    print(f"\n✅ Updated {len(updated_files)} files")

if __name__ == '__main__':
    main()
