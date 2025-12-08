#!/usr/bin/env python3
"""
Remove ALL gradients and fix remaining styling issues
"""

import os
import re

def remove_gradients(content):
    """Remove all gradient patterns"""
    
    # Pattern 1: bg-gradient-to-* with colors
    content = re.sub(r'bg-gradient-to-[a-z]+ from-\w+-\d+(?:/\d+)? to-\w+-\d+(?:/\d+)?', 'bg-blue-50 dark:bg-blue-900/10', content)
    
    # Pattern 2: gradient in className with hover
    content = re.sub(r'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700', 'notion-button-primary', content)
    content = re.sub(r'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700', 'notion-button-primary', content)
    content = re.sub(r'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700', 'notion-button-primary', content)
    content = re.sub(r'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700', 'notion-button-primary', content)
    
    # Pattern 3: gradient without hover
    content = re.sub(r'bg-gradient-to-r from-purple-600 to-pink-600', 'bg-blue-500', content)
    content = re.sub(r'bg-gradient-to-r from-blue-600 to-cyan-600', 'bg-blue-500', content)
    content = re.sub(r'bg-gradient-to-r from-green-600 to-emerald-600', 'bg-green-500', content)
    content = re.sub(r'bg-gradient-to-r from-orange-600 to-red-600', 'bg-orange-500', content)
    
    # Pattern 4: gradient in cards/backgrounds
    content = re.sub(r'bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg', 'notion-card notion-shadow', content)
    content = re.sub(r'bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg', 'notion-card bg-blue-50 dark:bg-blue-900/10', content)
    content = re.sub(r'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg', 'notion-card bg-blue-50 dark:bg-blue-900/10', content)
    content = re.sub(r'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg', 'notion-card bg-blue-50 dark:bg-blue-900/10', content)
    content = re.sub(r'bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg', 'notion-card bg-orange-50 dark:bg-orange-900/10', content)
    
    # Pattern 5: gradient in stats cards
    content = re.sub(r'bg-gradient-to-br from-purple-500 to-indigo-600', 'notion-card', content)
    content = re.sub(r'bg-gradient-to-br from-blue-500 to-cyan-600', 'notion-card', content)
    content = re.sub(r'bg-gradient-to-br from-green-500 to-emerald-600', 'notion-card', content)
    content = re.sub(r'bg-gradient-to-br from-orange-500 to-red-600', 'notion-card', content)
    
    # Pattern 6: gradient in progress bars
    content = re.sub(r'bg-gradient-to-r from-green-400 to-blue-500', 'bg-blue-500', content)
    content = re.sub(r'bg-gradient-to-r from-purple-400 to-pink-500', 'bg-blue-500', content)
    
    # Pattern 7: gradient property in objects
    content = re.sub(r"gradient: '[^']*'", "gradient: ''", content)
    
    # Pattern 8: Any remaining bg-gradient-*
    content = re.sub(r'bg-gradient-[a-z-]+\s+from-[a-z]+-\d+(?:/\d+)?\s+to-[a-z]+-\d+(?:/\d+)?', 'bg-blue-50 dark:bg-blue-900/10', content)
    
    return content

def fix_remaining_white_text(content):
    """Fix any remaining white text"""
    # Fix text-white that wasn't caught
    content = re.sub(r'\btext-white\b(?!\s*["\'])', 'notion-text', content)
    
    return content

def update_file(filepath):
    """Update a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        content = remove_gradients(content)
        content = fix_remaining_white_text(content)
        
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
                print(f"✓ Removed gradients from: {filename}")
    
    print(f"\n✅ Updated {len(updated_files)} files")

if __name__ == '__main__':
    main()
