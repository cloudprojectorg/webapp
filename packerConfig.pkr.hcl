variable "aws_region" {
  type    = string
  default = "us-west-1"
}

variable "vpc_id" {
  type    = string
  default = "vpc-0d1d57c2bab66beb2"
}

provider "aws" {
  region = var.aws_region
}

source "debian-ami" "debian-ami" {
  owners      = ["amazon"]
  most_recent = true

  filter {
    name   = "name"
    values = ["debian-12-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "block-device-mapping.volume-type"
    values = ["gp2"]
  }
}

build {
  sources = ["source.debian-ami.debian-ami"]

  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y mariadb-server mariadb-client",
    ]
  }

  provisioner "shell" {
    script = "./script.sh"
  }

  post-processor "shell-local" {
    inline = [
      "echo 'AMI ID: {{user `custom_ami_id`}}'",
    ]
  }

  post-processor "manifest" {
    output = "manifest.json"
  }

  ami_name = "my-custom-ami-{{timestamp}}"
  ami_description = "Custom AMI description here"
  ami_users = ["119898521865"]
  instance_type = "t2.micro"
  ssh_username = "admin"
  vpc_id = var.vpc_id

  tags = {
    Name = "my-custom-ami"
  }
}

