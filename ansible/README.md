# Ansible Deployment

This playbook demonstrates how an Ubuntu server could be prepared and used to run the Docker Compose version of the project.

## Usage

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

The default inventory uses `localhost` for a local demonstration. For a real server, replace it with the server IP address and SSH user.

