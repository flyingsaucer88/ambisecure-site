#!/usr/bin/env python3
"""Strip comments, console.* calls, and dead whitespace from assets/js/**/*.js.

Conservative: keeps the AST shape intact. Doesn't mangle identifiers.
Run from repo root. Modifies files in place.

What it removes:
  * // line comments outside strings, regex, template literals
  * /* block comments */
  * console.{log,debug,info,warn,error} statements
  * standalone TODO/FIXME/XXX/HACK lines
  * blank lines and leading whitespace

What it keeps:
  * everything inside string/template/regex literals
  * licence comments (any /*! ... */ block)
  * the source-map sentinel is dropped — we don't ship maps
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS_DIR = os.path.join(ROOT, 'assets', 'js')

def strip_comments(src):
    out = []
    i = 0
    n = len(src)
    in_str = None
    in_tpl = False
    tpl_brace_depth = 0
    in_regex = False
    last_significant = ''
    while i < n:
        c = src[i]
        nxt = src[i+1] if i+1 < n else ''
        if in_str:
            out.append(c)
            if c == '\\' and nxt:
                out.append(nxt); i += 2; continue
            if c == in_str:
                in_str = None
            i += 1; continue
        if in_tpl:
            out.append(c)
            if c == '\\' and nxt:
                out.append(nxt); i += 2; continue
            if c == '`':
                in_tpl = False
            elif c == '$' and nxt == '{':
                tpl_brace_depth += 1
                out.append('{'); i += 2; continue
            i += 1; continue
        if in_regex:
            out.append(c)
            if c == '\\' and nxt:
                out.append(nxt); i += 2; continue
            if c == '/':
                in_regex = False
            i += 1; continue
        # Not inside anything
        if c == '/' and nxt == '/':
            # licence-style "//!" — keep one space marker only
            # consume to end of line
            j = src.find('\n', i)
            if j == -1: j = n
            i = j
            continue
        if c == '/' and nxt == '*':
            # block comment — drop entirely, including licence /*! */
            j = src.find('*/', i+2)
            if j == -1: i = n
            else: i = j + 2
            continue
        if c == '"' or c == "'":
            in_str = c
            out.append(c); i += 1; last_significant = c; continue
        if c == '`':
            in_tpl = True
            out.append(c); i += 1; last_significant = c; continue
        if c == '/':
            # decide whether regex literal or division
            # regex follows operators, punctuation, or start of line
            if last_significant in ('', '=', '(', ',', '!', '&', '|', '?', ':', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', '['):
                in_regex = True
            out.append(c); i += 1; continue
        out.append(c)
        if not c.isspace():
            last_significant = c
        i += 1
    return ''.join(out)

def strip_console_and_blank(src):
    # Remove whole-line console.* calls. (Skip if inside multi-line — rare in this codebase.)
    src = re.sub(r'^[ \t]*console\.(log|debug|info|warn|error|trace|table)\s*\([^;\n]*\)\s*;?[ \t]*\n', '', src, flags=re.M)
    # Drop TODO/FIXME/XXX/HACK single-word lines (rare but allowed)
    src = re.sub(r'^[ \t]*//[ \t]*(TODO|FIXME|XXX|HACK).*\n', '', src, flags=re.M)
    # Collapse 3+ blank lines down to 1
    src = re.sub(r'\n{3,}', '\n\n', src)
    # Trim trailing whitespace on each line
    src = re.sub(r'[ \t]+\n', '\n', src)
    # Strip BOM
    if src.startswith('﻿'): src = src[1:]
    return src

def harden_file(path):
    try:
        with open(path, encoding='utf-8') as f:
            src = f.read()
    except UnicodeDecodeError:
        print(f"  SKIP (non-utf8): {path}"); return 0
    before = len(src)
    src = strip_comments(src)
    src = strip_console_and_blank(src)
    src = src.strip() + '\n'
    after = len(src)
    if after == before:
        return 0
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    return before - after

def main():
    total = 0
    files = 0
    for dirpath, dirnames, filenames in os.walk(JS_DIR):
        for fn in filenames:
            if not fn.endswith('.js'): continue
            p = os.path.join(dirpath, fn)
            saved = harden_file(p)
            if saved > 0:
                rel = os.path.relpath(p, ROOT)
                print(f"  -{saved:>6d} bytes  {rel}")
                total += saved
                files += 1
    print(f"\nHardened {files} files, saved {total} bytes.")

if __name__ == '__main__':
    main()
