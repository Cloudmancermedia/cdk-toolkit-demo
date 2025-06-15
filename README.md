# AWS CDK Toolkit Library Example

This repository demonstrates how to use the **AWS CDK Toolkit Library** for programmatically managing AWS infrastructure, including deployment, testing, and teardown of resources like Lambda functions, S3 buckets, and DynamoDB tables.

## Overview

This project uses the AWS CDK Toolkit Library to create a stack that includes an S3 bucket, a Lambda function, and a DynamoDB table. The functionality of the Lambda function is tested by invoking it with different payloads. Once the tests are complete, the stack is destroyed to avoid leaving any unused resources.

## Prerequisites

- Node.js 
- AWS CLI (configured with the necessary credentials)
- AWS CDK installed globally (`npm install -g aws-cdk`)

## Installation

To install the necessary dependencies, run the following command:

```bash
npm install --save-dev typescript ts-node aws-cdk-lib constructs colors @aws-cdk/toolkit-lib && npm install @aws-sdk/client-lambda
```

This command installs:

Development dependencies: typescript, ts-node

Regular dependencies: aws-cdk-lib, constructs, colors, @aws-cdk/toolkit-lib, and @aws-sdk/client-lambda

## Setup
Clone the repository:

```bash
git clone https://github.com/your-username/aws-cdk-toolkit-example.git
cd aws-cdk-toolkit-example
```
Install dependencies (as per the command above).

Create or modify your Lambda function code in the lambda directory.

Usage
Synthesize and Deploy Stack:
Use the cdk deploy functionality provided by the AWS CDK Toolkit Library programmatically. This example includes a test harness that creates a stack, deploys it, runs tests, and destroys it automatically.

```bash
npx ts-node lambda-test-harness.ts
```

Lambda Invocation:
The Lambda function is invoked automatically during the tests, using the AWS SDK, with a payload to ensure it works as expected.

Stack Destruction:
After tests are complete, the stack is destroyed to prevent unnecessary costs.

Code Walkthrough
The TestFeatureStack creates the resources: an S3 bucket, DynamoDB table, and Lambda function.

The CDK Toolkit Library (@aws-cdk/toolkit-lib) is used to programmatically:

Synthesize the cloud assembly.

Deploy the stack.

Invoke the Lambda function.

Destroy the stack.

Additional Notes
The AWS CDK Toolkit Library is in alpha. Be aware that the API may change, and it may not support all features.

Make sure your AWS credentials are configured either in your environment or via the AWS CLI (aws configure).