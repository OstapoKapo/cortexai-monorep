#!/bin/bash
# Скрипт для створення S3 бакету в LocalStack

BUCKET_NAME="cortexai-reports-templates"

# Використовуємо awslocal для створення бакету
awslocal s3 mb s3://$BUCKET_NAME
