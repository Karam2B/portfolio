# Terrafor
Here I specify the infrastructure for my portfolio website. I'm using Terraform -- an IaC tool that allows me to define and manage my infrastructure as code.

## Usage

A very important arguemnt is the `-var-file` flag, it allows me to pass the variables from the `main.tfvars` (hidden file) file to the Terraform configuration.

```
terraform x -var-file=main.tfvars
```