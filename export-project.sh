#!/bin/bash

# Create an export directory if it doesn't exist
mkdir -p export

# Archive the project, excluding node_modules and other unnecessary files
tar --exclude="node_modules" --exclude=".git" --exclude="export" -czf export/replit-clone.tar.gz .

echo "Project exported to export/replit-clone.tar.gz"
echo "Download this file to your local machine and extract it."
echo "Then follow the instructions in README.md to set up the project."