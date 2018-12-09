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

aws cloudformation deploy --profile ${PROFILE} --stack-name ${PROJECT_NAME}-ecr-repository --template-file infrastructure/ecr-repository.yml --region ${REGION} --no-fail-on-empty-changeset --parameter-overrides RepositoryName=${PROJECT_NAME}-ecr-repository

aws cloudformation describe-stacks --stack-name ${PROJECT_NAME}-ecr-repository --region ${REGION} --profile ${PROFILE} --output text --query 'Stacks[].Outputs[]' | tr '\t' '='
