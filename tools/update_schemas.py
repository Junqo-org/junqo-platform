import os
import shutil
import subprocess
import sys

"""
This script is used to update schemas from /schemas folder to the frontend and backend.

The frontend schemas are copied to the junqo_front/lib/src/schemas folder.
Then it generates the corresponding classes using the `flutter pub run build_runner build` command.
The backend classes are generated using the `npm run generate_types` command.
"""


SCHEMAS_DIR = './schemas'
FRONTEND_DIR = './junqo_front/lib/schemas'
BACKEND_DIR = './junqo_back'
EXPECTED_CURRENT_DIR = 'junqo-platform'


def check_current_dir():
    if os.path.basename(os.getcwd()) != EXPECTED_CURRENT_DIR:
        print(
            f'\033[91mPlease run this script from the {EXPECTED_CURRENT_DIR} directory.\033[0m')
        sys.exit(1)


def copy_schemas_to_frontend():
    if not os.path.exists(FRONTEND_DIR):
        raise FileNotFoundError(
            f'\033[91mFrontend directory not found: {FRONTEND_DIR}\033[0m')
    for filename in os.listdir(SCHEMAS_DIR):
        if filename.endswith('.graphql'):
            shutil.copy(os.path.join(SCHEMAS_DIR, filename), FRONTEND_DIR)
    print(
        f'\033[92mSchemas copied to frontend directory: {FRONTEND_DIR}\033[0m')


def generate_frontend_classes():
    current_directory = os.getcwd()

    if not os.path.exists(FRONTEND_DIR):
        raise FileNotFoundError(
            f'\033[91mFrontend directory not found: {FRONTEND_DIR}\033[0m')
    os.chdir('./junqo_front')
    subprocess.run(
        ['dart', 'run', 'build_runner', 'build', '--delete-conflicting-outputs'], check=True)
    print('\033[92mFrontend classes generated.\033[0m')
    os.chdir(current_directory)


def generate_backend_classes():
    current_directory = os.getcwd()

    if not os.path.exists(BACKEND_DIR):
        raise FileNotFoundError(
            f'\033[91mBackend directory not found: {BACKEND_DIR}\033[0m')
    os.chdir(BACKEND_DIR)
    subprocess.run(['npm', 'run', 'generate_types'], check=True)
    print('\033[92mBackend classes generated.\033[0m')
    os.chdir(current_directory)


if __name__ == '__main__':
    check_current_dir()
    copy_schemas_to_frontend()
    generate_frontend_classes()
    generate_backend_classes()
