import argparse
import os
import sys
import time

from ruamel.yaml import YAML
from ruamel.yaml.constructor import SafeConstructor
import jinja2

MAIN_FILE = 'main.yaml'
GENERATOR_MESSAGE = """
# This file is automatically generated by lovelace-gen.py
# https://github.com/thomasloven/homeassistant-lovelace-gen
# Any changes made to it will be overwritten the next time the script is run.
"""

def get_input_dir(inp):
    if not inp:
        if os.path.exists(os.path.join('/config/lovelace', MAIN_FILE)):
            return '/config/lovelace'
        if os.path.exists(os.path.join('lovelace/', MAIN_FILE)):
            return 'lovelace/'

    if os.path.exists(os.path.join(inp, MAIN_FILE)):
        return inp
    print("Input file main.yaml not found.", file=sys.stderr)
    sys.exit(2);

def process_file(jinja, yaml, path):
    template = jinja.get_template(path)
    return yaml.load(template.render())

def include_statement(loader, node):
    global jinja, yaml
    return process_file(jinja, yaml, node.value)

def file_statement(loader, node):
    path = node.value
    timestamp = time.time()
    if '?' in path:
        return f'{path}&{str(timestamp)}'
    else:
        return f'{path}?{str(timestamp)}'

def secret_statement(loader, node):
    global yaml, secrets
    if not secrets:
        secrets = yaml.load(open(os.path.join(inp, '..', 'secrets.yaml')))
    if not node.value in secrets:
        raise yaml.scanner.ScannerError('Could not find secret {}'. format(node.value))
    return secrets[node.value]


def main():
    global jinja, yaml, inp
    parser = argparse.ArgumentParser()
    parser.add_argument("input", help="Input directory", nargs='?')
    parser.add_argument("-o", "--output", help="Output file")

    args = parser.parse_args()

    inp = get_input_dir(args.input)
    outp = args.output or os.path.join(inp, '..', 'ui-lovelace.yaml')

    jinja = jinja2.Environment(loader=jinja2.FileSystemLoader(inp))
    yaml = YAML(typ='safe')
    yaml.Constructor = SafeConstructor

    SafeConstructor.add_constructor("!include", include_statement)
    SafeConstructor.add_constructor("!file", file_statement)

    try:
        data = process_file(jinja, yaml, MAIN_FILE)
    except Exception as e:
        print("Processing of yaml failed.", file=sys.stderr)
        print(e)
        sys.exit(3)

    try:
        with open(outp, 'w') as fp:
            fp.write(GENERATOR_MESSAGE)
            yaml.dump(data, fp)
    except Exception as e:
        print("Writing ui-lovelace.yaml failed.", file=sys.stderr)
        print(e)
        sys.exit(4)

if __name__ == '__main__':
    main()
