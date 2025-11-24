## configure AWS 

### AWC_CDK install 
    pip install awscli
### configure AWS
    aws configure  
    (Validate connection) aws sts get-caller-identity

## Set Cdk projecct

### install globally
    npm install -g aws-cdk
### inililize cdk project
    cdk init app --language typescript
### scripts 
    * `npm run build`   compile typescript to js
    * `npm run watch`   watch for changes and compile
    * `npm run test`    perform the jest unit tests
    * `npx cdk deploy`  deploy this stack to your default AWS account/region
    * `npx cdk diff`    compare deployed stack with current state
    * `npx cdk synth`   emits the synthesized CloudFormation template

## create infra
    cdk bootstarp => it will create a `CDKToolkit` stack
    cdk synth
        Converts your CDK code → YAML CloudFormation template
        Shows what will be deployed
        Helps debug issues before deployment
    cdk deploy
        to deploy desire stack to aws

## Check path on terminal 
    node -e "console.log(require('fs').readdirSync('./lambda'))"

## package.json
    private : true || it will not get pusbilsh to npm registery even we run accidently


## Description 
    -   aws-cdk-app : Simple cdk app to demostration purpose
    -   event=driven-app : This is a cdk app which published message to evenrBus through Lambda
                       EventBus rule place it to Consumer SQs and lambda process to DyanmoDB
    -   expres-fargate : simple project to push docker Image to ECR and deploy to ECS
    -   express-fargate-cdk : express API, where image has been pused from gtihub Pipeline and 
                          Deployemt to ECS from DCK app
    -   express-lambda : an express app which is wrapped in a helper package to run on lambda