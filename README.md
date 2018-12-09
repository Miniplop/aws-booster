# AWS - BOOSTER 🚀

## How to use

- Create a new AWS account

### 1. Install aws cli - 5 min

- [documentation](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)

### 2. Create your programmatic access - 10 min

- Go to [AWS IAM](https://console.aws.amazon.com/iam/home?region=eu-west-1#/users)
- Click on Add User
- Use as username {your_name}-ProgrammaticAccess
- Choose "Programmatic access" for Access type
- Click on "Next: Permissions"
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

### 3. Launch the provisioning

`````
./build_infrastructure.sh -p {your_profile_name} -r eu-west-1 --project-name {your_project_name}

