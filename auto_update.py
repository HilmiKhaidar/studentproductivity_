#!/usr/bin/env python3
"""
Auto-update script untuk mengubah semua komponen ke Notion style
"""

import os
import re

# Pattern replacements
PATTERNS = [
    # Headers
    (r'text-3xl font-bold text-white', 'text-[40px] font-bold notion-heading leading-tight'),
    (r'text-2xl font-bold text-white', 'text-2xl font-bold notion-heading'),
    (r'text-xl font-bold text-white', 'text-lg font-semibold notion-heading'),
    (r'text-white/70 mt-1', 'notion-text-secondary text-sm mt-2'),
    (r'text-white/60', 'notion-text-secondary'),
    (r'text-white/70', 'notion-text-secondary'),
    (r'text-white', 'notion-text'),
    
    # Cards
    (r'bg-white/10 backdrop-blur-lg rounded-xl (p-\d+) border border-white/20', r'notion-card \1'),
    (r'bg-white/10 backdrop-blur-lg rounded-xl border border-white/20', 'notion-card'),
    (r'bg-white/5 rounded-lg', 'notion-card'),
    
    # Buttons - Gradient
    (r'bg-gradient-to-r from-purple-600 to-pink-600 text-white', 'notion-button-primary'),
    (r'bg-gradient-to-r from-purple-600 to-pink-600', 'notion-button-primary'),
    (r'bg-gradient-to-br from-purple-500 to-pink-500', 'bg-blue-500'),
    
    # Inputs
    (r'bg-white/10 border border-white/20 rounded-lg ([^"]*) text-white placeholder-white/50', r'notion-input \1'),
    
    # Empty states
    (r'text-white/60 text-center py-4', 'notion-text-secondary text-center py-8 text-sm'),
]

def update_file(filepath):
    """Update a single file with pattern replacements"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for pattern, replacement in PATTERNS:
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
    """Main function to update all component files"""
    components_dir = 'src/components'
    updated_files = []
    
    for filename in os.listdir(components_dir):
        if filename.endswith('.tsx') and filename not in ['Auth.tsx', 'Dashboard.tsx', 'Sidebar.tsx', 'StudyPlanner.tsx']:
            filepath = os.path.join(components_dir, filename)
            if update_file(filepath):
                updated_files.append(filename)
                print(f"✓ Updated: {filename}")
    
    print(f"\n✅ Updated {len(updated_files)} files")
    for f in updated_files:
        print(f"  - {f}")

if __name__ == '__main__':
    main()
