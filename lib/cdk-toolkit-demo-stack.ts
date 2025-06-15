import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Toolkit, StackSelectionStrategy } from '@aws-cdk/toolkit-lib';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { green, red, bold } from 'colors/safe';

export class TestFeatureStack extends cdk.Stack {
  public readonly functionArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'TestBucket');

    const table = new dynamodb.Table(this, 'TestTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    const testLambda = new lambda.Function(this, 'TestLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(testLambda);

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: testLambda.functionArn,
    });

    this.functionArn = testLambda.functionArn;
  }
}

async function createCloudAssembly(toolkit: Toolkit) {
  return await toolkit.fromAssemblyBuilder(async () => {
    const app = new cdk.App();
    new TestFeatureStack(app, 'TestFeatureStack');
    return app.synth();
  });
}

async function deployStack(toolkit: Toolkit, cloudAssembly: any, stackName: string) {
  successLog(`${bold('Deploying stack:')} ${stackName}...`);
  const result = await toolkit.deploy(cloudAssembly, {
    stacks: {
      strategy: StackSelectionStrategy.PATTERN_MUST_MATCH,
      patterns: [stackName],
    },
  });
  successLog('Deployment successful.');
  
  const stack = result.stacks.find((s) => s.stackName === stackName);
  if (!stack) {
    throw new Error(`Stack ${stackName} not found after deployment`);
  }
  
  return stack;
}

async function invokeLambda(functionArn: string, payload: any) {
  successLog('Invoking Lambda with payload...');
  const lambdaClient = new LambdaClient({});
  const invokeCommand = new InvokeCommand({
    FunctionName: functionArn,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  const response = await lambdaClient.send(invokeCommand);
  const responseData = JSON.parse(Buffer.from(response.Payload ?? []).toString());

  if (responseData.status === "ok") {
    successLog('Test passed');
    successLog(responseData);
    return responseData;    
  } else {
    errorLog('Test failed');
    errorLog(responseData);
    return responseData;
  }
}

async function destroyStack(toolkit: Toolkit, cloudAssembly: any, stackName: string) {
  successLog(`${bold('Destroying stack:')} ${stackName}...`);
  try {
    await toolkit.destroy(cloudAssembly, {
      stacks: {
        strategy: StackSelectionStrategy.PATTERN_MUST_MATCH,
        patterns: [stackName],
      },
    });
    successLog('Stack destroyed successfully.');
  } catch (error) {
    errorLog('Error during stack destruction:');
    throw error;
  }
}

const errorLog = (message: any) => {
  console.error(bold(red(message)));
}

const successLog = (message: any) => {
  console.log(bold(green(message)));
}

async function main() {
  const toolkit = new Toolkit();
  const stackName = 'TestFeatureStack';
  let cloudAssembly;

  try {
    cloudAssembly = await createCloudAssembly(toolkit);

    const stack = await deployStack(toolkit, cloudAssembly, stackName);

    const functionArn = stack.outputs['LambdaFunctionArn'];
    successLog(`Lambda Function ARN: ${functionArn}`);

    // Uncomment for a successful test payload
    await invokeLambda(functionArn, { payload: 'test-successful' });

    // Uncomment for a failed test payload
    // await invokeLambda(functionArn, { payload: 'test-failed' });

    await destroyStack(toolkit, cloudAssembly, stackName);
    
  } catch (error) {
    errorLog('Error during test:');
    errorLog(error);
    
    if (cloudAssembly) {
      try {
        await destroyStack(toolkit, cloudAssembly, stackName);
      } catch (cleanupError) {
        errorLog('Failed to clean up stack after error:');
        errorLog(cleanupError);
      }
    }
    
    process.exit(1);
  }
}

main();
