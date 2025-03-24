/*---------------------------------------------------------------------------------------
© 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
 
This AWS Content is provided subject to the terms of the AWS Customer Agreement
available at http://aws.amazon.com/agreement or other written agreement between
Customer and either Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
---------------------------------------------------------------------------------------*/

# Reference: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster


################################################################################
# Service
################################################################################

module "ecs_service" {
  source = "../../../modules/ecs/service/v1"

  # Service
  name        = var.service_name
  cluster_arn = "arn:aws:ecs:${var.region}:${local.account_id}:cluster/${var.ecs_cluster_name}"

  subnet_ids = var.subnet_ids

  network_mode = var.network_mode

  # Task Definition
  requires_compatibilities   = var.requires_compatibilities
  capacity_provider_strategy = var.capacity_provider_strategy

  placement_constraints = var.task_definition_placement_constraints

  volume = var.volume

  cpu = var.cpu

  memory = var.memory

  # ignore_task_definition_changes  = true

  # Container definition(s)
  container_definitions = var.container_definitions

  # Ingress Setup
  load_balancer = var.load_balancer

  # AutoScaling Details
  enable_autoscaling       = var.enable_autoscaling
  desired_count            = var.desired_count
  autoscaling_min_capacity = var.autoscaling_min_capacity
  autoscaling_max_capacity = var.autoscaling_max_capacity
  autoscaling_policies     = var.autoscaling_policies

  # Default Security Group
  security_group_rules = {
    alb_http_ingress_to_container = {
      type        = "ingress"
      from_port   = var.container_port
      to_port     = var.container_port
      protocol    = "tcp"
      description = "Service port"
      # source_security_group_id = var.alb_security_group_id
      cidr_blocks = ["0.0.0.0/0"]
    }

    alb_http_ingress = {
      type                     = "ingress"
      from_port                = 80
      to_port                  = 80
      protocol                 = "tcp"
      description              = "Default port of http"
      source_security_group_id = local.alb_public_security_group_id
      # cidr_blocks              = ["0.0.0.0/0"]
    }

    alb_https_ingress = {
      type                     = "ingress"
      from_port                = 443
      to_port                  = 443
      protocol                 = "tcp"
      description              = "Default port of https"
      source_security_group_id = local.alb_public_security_group_id
      # cidr_blocks              = ["0.0.0.0/0"]
    }

    alb_all_tcp_ingress = {
      type                     = "ingress"
      from_port                = 0
      to_port                  = 65535
      protocol                 = "tcp"
      description              = "All TCP from ALB"
      source_security_group_id = local.alb_public_security_group_id
      # cidr_blocks              = ["0.0.0.0/0"]
    }

    egress = {
      type        = "egress"
      from_port   = 0
      to_port     = 65535
      protocol    = "-1"
      description = "Outbound to ALL"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  tags = local.tags

  iam_role_name           = var.short_name
  tasks_iam_role_name     = var.short_name
  task_exec_iam_role_name = var.short_name
}
