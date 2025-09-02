# Deployment Setup Guide

## Overview
This guide sets up an Ansible-based deployment workflow from your desktop to the Raspberry Pi 5 running the Ainslie Phone Gallery.

## Prerequisites
- Raspberry Pi 5 with Raspberry Pi OS flashed to SD card
- Pi accessible at `pi5phone.local` or `pi5phone` (via SSH config)
- Ansible installed on desktop: `pip install ansible ansible-core`
- `sshpass` installed for initial setup: `sudo apt install sshpass` (Ubuntu/Debian)

## Pi Initial Setup
When flashing the SD card with Raspberry Pi Imager:
1. **Enable SSH** in advanced options
2. **Set username**: `drew`
3. **Set password**: Choose a secure password (you'll need this for initial Ansible setup)
4. **Configure WiFi** if needed
5. **Set hostname**: `pi5phone`

## Ansible Structure
The project uses this simple Ansible structure:
```
ansible/
├── ansible.cfg              # Ansible configuration
├── inventory/
│   └── hosts.yml            # Pi connection details
├── group_vars/
│   └── all.yml              # Project variables
└── playbooks/
    ├── setup-ssh.yml        # Initial SSH key setup
    ├── provision.yml        # Full system setup
    └── update.yml           # Deploy code changes
```

## Setup Process

### 0. Generate SSH Key (if not already done)
Generate an Ed25519 SSH key for the Pi:

```bash
ssh-keygen -t ed25519 -C "ainslie-phone-desktop" -f ~/.ssh/ainslie_phone_pi -N ""
```

### 1. Setup SSH Key Authentication
Run the SSH setup playbook (you'll be prompted for the Pi password):

```bash
cd ansible
ansible-playbook playbooks/setup-ssh.yml
```

### 2. Provision the Pi
Run the full provisioning playbook:

```bash
ansible-playbook playbooks/provision.yml
```

This will:
- Update all system packages
- Install required packages (git, python3, Asterisk, etc.)
- Configure static IP (192.168.50.10/24)
- Create project directories
- Enable Asterisk service

### 3. Deploy Code
Deploy your code to the Pi:

```bash
ansible-playbook playbooks/update.yml
```

## Deployment Workflow

### Day-to-Day Development
1. Make changes locally
2. Commit changes: `git add . && git commit -m "Your message"`
3. Deploy to Pi: `cd ansible && ansible-playbook playbooks/update.yml`
4. Code automatically syncs to `~/ainslie-phone-live` on the Pi

### Available Commands
```bash
# Full system provision (fresh Pi)
ansible-playbook playbooks/provision.yml

# Deploy code changes
ansible-playbook playbooks/update.yml

# Setup SSH keys (first time only)
ansible-playbook playbooks/setup-ssh.yml

# Test connectivity
ansible all -m ping
```

### Directory Structure on Pi
```
/home/drew/
└── ainslie-phone-live/         # Live code (deployed via Ansible)
    ├── src/
    ├── config/
    └── ...
```

## Customizing Deployment

### Adding Packages
Edit `ansible/group_vars/all.yml` to add packages:

```yaml
base_packages:
  - git
  - python3
  - your-package-here
  
asterisk_packages:
  - asterisk
  - your-asterisk-module
```

### Modifying Network Configuration
Update the static IP settings in `ansible/group_vars/all.yml`:

```yaml
pi_static_ip: "192.168.50.10"
ht801_ip: "192.168.50.20"
```

### Custom Post-Deploy Tasks
Add tasks to `ansible/playbooks/update.yml`:

```yaml
- name: Your custom task
  ansible.builtin.shell: |
    # Your commands here
  become: true
```

## Troubleshooting

### Check Deployment Status
```bash
ansible all -m shell -a "ls -la ~/ainslie-phone-live"
```

### Test Connectivity
```bash
ansible all -m ping
```

### Check Service Status
```bash
ansible all -m shell -a "systemctl status asterisk" --become
```

### Manual File Sync
If Ansible fails, manual rsync backup:

```bash
rsync -avz --delete ./ pi5phone:~/ainslie-phone-live/ --exclude='ansible' --exclude='.git' --exclude='.ai'
```

### View Ansible Logs
Add `-v`, `-vv`, or `-vvv` for verbose output:

```bash
ansible-playbook playbooks/update.yml -vv
```

## Security Notes
- Pi password is only needed for initial SSH key setup
- SSH key authentication used for all subsequent access
- Ansible uses your SSH key from `~/.ssh/ainslie_phone_pi`
- Consider using Ansible Vault for sensitive variables

## Configuration Files
Key Ansible files to understand:
- `ansible/inventory/hosts.yml`: Pi connection details
- `ansible/group_vars/all.yml`: Project variables and package lists
- `ansible/playbooks/provision.yml`: Full system setup
- `ansible/playbooks/update.yml`: Code deployment
- `ansible/ansible.cfg`: Ansible behavior configuration
