#!/bin/bash

set -e

########################
### NAMING ARGUMENTS ###
########################

while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -r|--region)
    REGION="$2"
    shift # past argument
    ;;
    -p|--profile)
    PROFILE="$2"
    shift # past argument
    ;;
    --project-name)
    PROJECT_NAME="$2"
    shift # past argument
    ;;
    *)
    printf "***************************\n"
    printf "* Error: Invalid argument.*\n"
    printf "***************************\n"
    exit 1
esac
shift # past argument or value
done

echo "===== AWS Booster ====="

# We check if AWS Cli profile is in parameters to set env var
if [ -z "$PROFILE" ]
then
    echo "/!\ Profile parameter is empty, please provide one using --profile or -p !"
    exit
fi

if [ -z "$REGION" ]
then
    echo "/!\ Region parameter is empty, please provide one using --region or -r !"
    exit
fi

if [ -z "$PROJECT_NAME" ]
then
    echo "/!\ Project name parameter is empty, please provide one using --project-name  !"
    exit
fi

VPC_ID=$(aws ec2 describe-vpcs --region ${REGION} --profile ${PROFILE} --filters "Name=isDefault, Values=true" | grep -oe 'VpcId": "[^"]*' | grep -oe 'vpc-.*')
SUBNETS=$(aws ec2 describe-subnets --region ${REGION} --profile ${PROFILE} | grep -oe 'SubnetId": "[^"]*' | grep -oe 'subnet-.*' | awk '{print $0}' ORS=',' | sed 's/,$//')


## Create LoadBalancer security group
aws cloudformation deploy \
    --stack-name ${PROJECT_NAME}-sg \
    --profile ${PROFILE} \
    --template-file infrastructure/load-balancer-security-group.yml \
    --region ${REGION} \
    --parameter-overrides \
        ProjectName=${PROJECT_NAME} \
    --no-fail-on-empty-changeset

# Export the LoadBalancer security group variable
export $(aws cloudformation describe-stacks --stack-name ${PROJECT_NAME}-sg --region ${REGION} --profile ${PROFILE} --output text --query 'Stacks[].Outputs[]' | tr '\t' '=')

## Create LoadBalancer
aws cloudformation deploy \
    --stack-name ${PROJECT_NAME}-load-balancer \
    --profile ${PROFILE} \
    --template-file infrastructure/load-balancer.yml \
    --region ${REGION} \
    --parameter-overrides \
        ProjectName=${PROJECT_NAME} \
        Subnets=${SUBNETS} \
        SecurityGroup=${AlbSg} \
        VpcId=${VPC_ID} \
    --no-fail-on-empty-changeset

# Export the LoadBalancer variable
export $(aws cloudformation describe-stacks --stack-name ${PROJECT_NAME}-load-balancer --region ${REGION} --profile ${PROFILE} --output text --query 'Stacks[].Outputs[]' | tr '\t' '=')

## Create cloud front
aws cloudformation deploy \
    --profile ${PROFILE} \
    --stack-name ${PROJECT_NAME}-cloud-fornt \
    --template-file infrastructure/cloud-front.yml \
    --capabilities CAPABILITY_NAMED_IAM \
    --no-fail-on-empty-changeset \
    --region ${REGION} \
    --parameter-overrides \
        ProjectName=${PROJECT_NAME} \
        AlbDNS=${AlbDNS} \

## Create IAM Roles
aws cloudformation deploy \
    --profile ${PROFILE} \
    --stack-name ${PROJECT_NAME}-iam \
    --template-file infrastructure/iam.yml \
    --capabilities CAPABILITY_NAMED_IAM \
    --no-fail-on-empty-changeset \
    --region ${REGION} \
    --parameter-overrides ProjectName=${PROJECT_NAME}

# Export the TaskRole variable
export $(aws cloudformation describe-stacks --stack-name ${PROJECT_NAME}-iam --region ${REGION} --profile ${PROFILE} --output text --query 'Stacks[].Outputs[]' | tr '\t' '=')

# Create an ECS Repository for Dockerfile
aws cloudformation deploy \
    --profile ${PROFILE} \
    --stack-name ${PROJECT_NAME}-ecs-repository \
    --template-file infrastructure/ecs-repository.yml \
    --region ${REGION} \
    --no-fail-on-empty-changeset \
    --parameter-overrides RepositoryName=${PROJECT_NAME}-ecr-repository

# Export the ECSRepository variable
export $(aws cloudformation describe-stacks --stack-name ${PROJECT_NAME}-ecs-repository --region ${REGION} --profile ${PROFILE} --output text --query 'Stacks[].Outputs[]' | tr '\t' '=')

# Push the Dockerfile on ECS
$(aws ecr get-login --no-include-email --region ${REGION} --profile ${PROFILE})
docker build --tag "${ECSRepository}:latest" .
docker push "${ECSRepository}:latest"

## Create an ECS Cluster
aws cloudformation deploy \
    --stack-name ${PROJECT_NAME}-ecs-cluster \
    --profile ${PROFILE} \
    --template-file infrastructure/ecs-cluster.yml \
    --region ${REGION} \
    --parameter-overrides ClusterName=${PROJECT_NAME}-cluster \
    --no-fail-on-empty-changeset

# Export the ECSCluster variable
export $(aws cloudformation describe-stacks --stack-name ${PROJECT_NAME}-ecs-cluster --region ${REGION} --profile ${PROFILE} --output text --query 'Stacks[].Outputs[]' | tr '\t' '=')

## Enable ECS Services for the cluster
aws cloudformation deploy \
    --stack-name ${PROJECT_NAME}-ecs-services \
    --profile ${PROFILE} \
    --template-file infrastructure/ecs-services.yml \
    --region ${REGION} \
    --parameter-overrides \
        ECSTaskRole=${TaskRole} \
        DockerRepository=${ECSRepository} \
        ProjectName=${PROJECT_NAME} \
    --no-fail-on-empty-changeset
