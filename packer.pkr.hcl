packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1"
    }
  }
}



# Define variables
variable "aws_region" { 
  type    = string
  default = "us-east-1"
}

variable "access_key" {
  type = string
  #   sensitive = true
  default = ""
}

variable "secret_key" {
  type = string
  #   sensitive = true
  default = ""
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "source_ami_filter" {
  type = object({
    virtualization-type = string
    name                = string
    root-device-type    = string
    architecture        = string
  })
  default = {
    virtualization-type = "hvm"
    name                = "debian-12-*"
    root-device-type    = "ebs"
    architecture        = "x86_64"
  }
}

variable "ami_name" {
  type    = string
  default = "my-custom-ami-{{timestamp}}"
}

variable "ami_description" {
  type    = string
  default = "Custom AMI description here"
}

variable "ami_users" {
  type    = list(string)
  default = ["119898521865", "949500228056"]
}

variable "tags" {
  type = map(string)
  default = {
    "Name" = "my-custom-ami"
  }
}

variable "vpc_id" {
  type    = string
  default = "vpc-0d1d57c2bab66beb2"
}


# Packer configuration
source "amazon-ebs" "debian" {
  region          = var.aws_region
  ami_name        = "my-custom-ami-{{timestamp}}"
  ami_description = "Custom AMI description here"
  instance_type   = "t2.micro"
  #   region          =  "us-east-1"
  ami_users      = var.ami_users
  # access_key = var.access_key != "" ? var.access_key : null
  # secret_key=  var.secret_key != "" ? var.secret_key: null
  ssh_agent_auth = false
  #   region          = var.aws_region
  source_ami_filter {
    filters = {
      "virtualization-type" = "hvm"
      "name"                = "debian-12-*"
      "root-device-type"    = "ebs"
      "architecture"        = "x86_64"
    }
    owners      = ["amazon"]
    most_recent = true
  }
  ssh_username = var.ssh_username

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 25
    volume_type           = "gp2"
  }

  tags = {
    Name = "packer-ami-webapp"
  }
}


# Build configuration
build {
  sources = ["source.amazon-ebs.debian"]

  # Provisioners and other build settings...
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /tmp/webapp && sudo chown admin:admin /tmp/webapp"
    ]
  }

  provisioner "shell" {
    inline = [
      "ls -ld /tmp/webapp",
      "id"
    ]
  }

  provisioner "file" {
    source      = "./"
    destination = "/tmp/webapp"
    direction   = "upload"
  }

  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/webapp",
      "sudo mv /tmp/webapp/* /opt/webapp/",
      "sudo chown -R nobody:nogroup /opt/webapp"
    ]
  }

  # Packer provisioners
  provisioner "shell" {
    # type        = "shell"
    inline = [
      "export DEBIAN_FRONTEND=noninteractive",
      "sudo apt-get update",
      "sudo apt-get install -y mariadb-server mariadb-client"
    ]
  }
  provisioner "shell" {
    # type   = "shell"
    script = "./script.sh"
  }

  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
  }
}
