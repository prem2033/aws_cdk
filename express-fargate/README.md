# list of image : 
    docker image ls
# delete iamge
    delete by rag : docker rmi express-fargate:latest
    delete if exist : docker rmi -f express-fargate:latest
    dlete with id : docker rmi 123abc456def
# rebuild docker image
    docker build -t <express-fargate> .
# build docker image : 
    docker build -t express-fargate .
# run docker image : 
    docker run -p 3000:3000 express-fargate
    docker run -it(intractive mode) -p 3000:3000 express-fargate
# login to ecr : 
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 141991823339.dkr.ecr.us-east-1.amazonaws.com
# create ecr repository : 
    aws ecr create-repository --repository-name express-fargate --region us-east-1
    to make immutable --image-tag-mutability IMMUTABLE

    repository-url : 123456789012.dkr.ecr.us-east-1.amazonaws.com/express-fargate
# tag docket image 
    docker tag express-fargate:latest 141991823339.dkr.ecr.us-east-1.amazonaws.com/express-fargate:latest
# push repository : 
    docker push 141991823339.dkr.ecr.us-east-1.amazonaws.com/express-fargate:latest

# Once pused to ECR
    create ECS
    Create task
    attach that task to services
    once attched use, ALB to hit that API. API url will look as below

# url : go to ALB and get DNS :
    https://ex-0773d37314ee4ee784987df87fa5e5bf.ecs.us-east-1.on.aws/healthcheck