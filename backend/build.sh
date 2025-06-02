#!/bin/bash

set -e

rm -rf build package lambda.zip

mkdir -p package
pip install -r requirements.txt -t package/

cp -r app package/app
cp -r app/main.py package/

cd package
zip -r9 ../lambda.zip .
cd ..

echo "✅ Lambda package created: lambda.zip"
