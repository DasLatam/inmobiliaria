#!/usr/bin/env python3
import os
import sys
import argparse
import xml.etree.ElementTree as ET
from xml.dom import minidom

def add_dir(parent, path, exclude_git, root):
    name = os.path.basename(path) or path
    rel = os.path.relpath(path, root)
    dir_elem = ET.SubElement(parent, 'dir', name=name, path=rel)
    try:
        entries = sorted(os.listdir(path))
    except (PermissionError, FileNotFoundError):
        return
    for e in entries:
        full = os.path.join(path, e)
        if exclude_git and e == '.git':
            continue
        # skip node_modules optionally (common large folder)
        if e == 'node_modules':
            ET.SubElement(dir_elem, 'dir', name=e, note='skipped')
            continue
        try:
            if os.path.islink(full):
                ET.SubElement(dir_elem, 'symlink', name=e, target=os.readlink(full))
            elif os.path.isdir(full):
                add_dir(dir_elem, full, exclude_git, root)
            else:
                try:
                    st = os.stat(full)
                    ET.SubElement(dir_elem, 'file', name=e, size=str(st.st_size), mtime=str(int(st.st_mtime)))
                except (FileNotFoundError, PermissionError):
                    ET.SubElement(dir_elem, 'file', name=e, note='unreadable')
        except OSError:
            continue

def prettify(elem):
    raw = ET.tostring(elem, 'utf-8')
    parsed = minidom.parseString(raw)
    return parsed.toprettyxml(indent="  ")

def main():
    p = argparse.ArgumentParser(description="Generar mapa XML de la estructura del repositorio")
    p.add_argument('--root', '-r', default='.', help='Ruta raíz a escanear')
    p.add_argument('--exclude-git', action='store_true', help='Excluir la carpeta .git')
    p.add_argument('--skip-node-modules', action='store_true', help='Marcar node_modules como omitido')
    args = p.parse_args()

    root_path = os.path.abspath(args.root)
    repo = ET.Element('repository', path=root_path)
    add_dir(repo, root_path, args.exclude_git, root_path)
    print(prettify(repo))

if __name__ == '__main__':
    main()