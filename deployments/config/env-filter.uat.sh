#!/bin/bash

# env
echo $image

# path
# prod_tfvars_path="deployments/terraform/production/apps.tfvars"
uat_tfvars_path="./deployments/terraform/uat/apps.tfvars"

# deployment
sed -i "s|{{ image }}|$image|g" $uat_tfvars_path