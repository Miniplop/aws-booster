# AWS - BOOSTER 🚀

## Prerequisites

- Minimun AWS CLI version 1.16

## How to use

- Create a new AWS account

### 1. Install aws cli - 5 min

- [documentation](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)

### 2. Create your programmatic access - 10 min

- Login in your [AWS console](https://signin.aws.amazon.com/signin)
- Go to [AWS IAM](https://console.aws.amazon.com/iam/home?region=eu-west-1#/users)
- Click on Add User
- Use as username {your_name}-ProgrammaticAccess
- Choose "Programmatic access" for Access type
- Click on "Next: Permissions"
- Click on "Next: Tags"
- Choose "Attach existing policies directly" and check "AdministratorAccess"
- Click on "Next: Review" and then on "Create User"
- Note the Access key ID and the Secret Access key (will be needed later) 

- On your computer, edit the ~/.aws/credentials file and add these lines with the Access keys and Secret keys

````
[default]
aws_access_key_id = {aws_access_key_id}
aws_secret_access_key = {aws_secret_access_key}

[{your_profile_name}]
aws_access_key_id = {aws_access_key_id}
aws_secret_access_key = {aws_secret_access_key}
````

- On your computer, edit the ~/.aws/config file : 

````
[default]
output = json
region = eu-west-1

[profile {your_profile_name}]
output = json
region = eu-west-1

````

- You can test that your profile is well-configured :

``
aws configure get aws_access_key_id --profile {your_profile_name}
``

- Create a key pair in [EC2 services](https://eu-west-1.console.aws.amazon.com/ec2/v2/home?region=eu-west-1#KeyPairs:sort=keyName)
- Note the key pair name (will be needed later) 

### 3. Launch the provisioning

`````
./build_infrastructure.sh -p {your_profile_name} -r eu-west-1 -k {your_key_pair_name_without_pem_extension} --project-name {your_project_name}

