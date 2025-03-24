#####################################################################################
# Parameters for Host Account

variable "application_name" {
  description = "Application Name"
  type        = string
}

variable "region" {
  description = "Region of the Service"
  type        = string
  default     = "ap-southeast-3"
}

variable "environment" {
  description = "SDLC Environment"
  type        = string
  default     = "undefined"
}

variable "subnet_ids" {
  description = "Subnet Ids to host the Services."
  type        = list(string)
  default     = []
}

#####################################################################################
# Parameters for ECS Cluster Information

variable "ecs_cluster_name" {
  description = "Name of the ECS Cluster that host the service"
  type        = string
  default     = ""
}

#####################################################################################
# Parameters for Service Details

variable "service_name" {
  description = "Service Name, always start with 'svc-'"
  type        = string
  default     = "svc-testbed"
}

variable "network_mode" {
  description = "Network mode of the service, awsvpc or bridge"
  type        = string
  default     = "bridge"
}

variable "requires_compatibilities" {
  description = "List of Service Compatibilities, Default is [EC2, FARGATE]"
  type        = list(string)
  default     = ["EC2", "FARGATE"]
}


variable "capacity_provider_strategy" {
  description = "Capacity Provider for the Service"
  type        = any
  default     = {}
}

variable "task_definition_placement_constraints" {
  description = "Placement COnstraint for the Service"
  type        = any
  default     = {}
}

variable "volume" {
  description = "Persistence Volume of the Service"
  type        = any
  default     = {}
  # sample : 
  # {
  #   svc-vol = {}
  # }
}

#####################################################################################
# Parameters for Ingress 

variable "load_balancer" {
  description = "Load Balancer detail for service that require Ingress thru Load Balancer."
  type        = any
  default     = {}
}

#####################################################################################
# Parameters for Container Details

variable "container_definitions" {
  description = "Container Definition, It can be more than 1, if 1 Service consists of multiple Containers, e.g: Sidecar"
  type        = any
  default     = {}
}

variable "container_port" {
  description = "Container Port, where it serves request."
  type        = number
  default     = 80
}

variable "cpu" {
  description = "CPU Detail for the task."
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory Detail for the task."
  type        = number
  default     = 512
}

#######################
# AutoScaling Variables

variable "enable_autoscaling" {
  description = "Enable AutoScaling."
  type        = bool
  default     = true
}

variable "desired_count" {
  description = "Number of Desired Tasks."
  type        = number
  default     = 2
}

variable "autoscaling_min_capacity" {
  description = "Number of Minimum Autoscaling Capacity."
  type        = number
  default     = 2
}

variable "autoscaling_max_capacity" {
  description = "Number of Maximum Autoscaling Capacity."
  type        = number
  default     = 10
}


variable "autoscaling_policies" {
  description = "Autoscaling Policies Details."
  type        = any
  default = {
    cpu = {
      policy_type = "TargetTrackingScaling"

      target_tracking_scaling_policy_configuration = {
        predefined_metric_specification = {
          predefined_metric_type = "ECSServiceAverageCPUUtilization"
        }

        target_value = 75
      }
    }
    memory = {
      policy_type = "TargetTrackingScaling"

      target_tracking_scaling_policy_configuration = {
        predefined_metric_specification = {
          predefined_metric_type = "ECSServiceAverageMemoryUtilization"
        }

        target_value = 75
      }
    }
  }
}

variable "tags" {
  description = "Specific Tagging for the Resources."
  type        = map(string)
  default     = {}
}

variable "short_name" {
  description = "short name of services"
  type        = string
  default     = "none"
}
