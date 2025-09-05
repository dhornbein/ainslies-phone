# HT801 Setup Automation

This directory contains Ansible automation for the complete HT801 and Asterisk setup process described in the HT801-Setup-Guide.md.

## Quick Setup Commands

```bash
# Complete setup from scratch
cd ansible

# 1. Setup SSH keys (first time only)
ansible-playbook playbooks/setup-ssh.yml

# 2. Provision the Pi (basic system setup)
ansible-playbook playbooks/provision.yml

# 3. Install Asterisk from source
ansible-playbook playbooks/install-asterisk.yml

# 4. Configure HT801 and Asterisk
ansible-playbook playbooks/ht801-setup.yml

# 5. Deploy/update configurations
ansible-playbook playbooks/update.yml
```

## Individual Components

### Network Setup
```bash
# Configure Pi static IP for HT801 connection
ansible-playbook playbooks/network-setup.yml
```

### Configuration Updates
```bash
# Deploy latest pjsip.conf and extensions.conf
ansible-playbook playbooks/update.yml --tags=asterisk_config

# Deploy project files only
ansible-playbook playbooks/update.yml --tags=deploy

# Verify Asterisk status
ansible-playbook playbooks/update.yml --tags=asterisk_verify
```

### HT801 Setup
```bash
# Full HT801 and Asterisk configuration
ansible-playbook playbooks/ht801-setup.yml

# Check connectivity only
ansible-playbook playbooks/ht801-setup.yml --tags=connectivity

# Verify Asterisk status only
ansible-playbook playbooks/ht801-setup.yml --tags=verify
```

## Manual HT801 Configuration

If the HT801 is not automatically reachable, you'll need to configure it manually:

1. **Get current IP**: Pick up phone, dial `***`, then `02`
2. **SSH Tunnel**: `ssh -L 8080:<current_ip>:80 drew@pi5phone`
3. **Web Interface**: Open `http://localhost:8080`, login with password on the HT801 device
4. **Configure Static IP**: Set to `192.168.50.20` in BASIC SETTINGS
5. **Configure SIP**: In FXS PORT1, set server to `192.168.50.10`, user `ht801-aor`

## Files and Structure

```
ansible/
├── playbooks/
│   ├── setup-ssh.yml          # Initial SSH key setup
│   ├── provision.yml          # Basic Pi provisioning + network
│   ├── network-setup.yml      # Network configuration for HT801
│   ├── install-asterisk.yml   # Asterisk installation from source
│   ├── ht801-setup.yml       # Complete HT801 + Asterisk config
│   └── update.yml            # Deploy configs and project updates
├── templates/
│   ├── pjsip.conf.j2         # SIP configuration template
│   └── extensions.conf.j2    # Dialplan configuration template
├── handlers/
│   └── main.yml              # Service restarts and system handlers
├── group_vars/
│   └── all.yml               # Project variables and settings
└── inventory/
    └── hosts.yml             # Pi connection details
```

## Configuration Variables

Key variables in `group_vars/all.yml`:

```yaml
pi_static_ip: "192.168.50.10"    # Pi IP address
ht801_ip: "192.168.50.20"        # HT801 IP address
project_user: "drew"             # Project user on Pi
deploy_path: "/home/drew/ainslie-phone"  # Deployment path
```

## Testing and Verification

### Network Connectivity
```bash
# Test HT801 web interface connectivity (ping doesn't work on HT801)
ansible all -m uri -a "url=http://192.168.50.20 timeout=5" 

# Alternative: Test port accessibility
ansible all -m wait_for -a "host=192.168.50.20 port=80 timeout=5"
```

### Asterisk Status
```bash
# Check Asterisk service
ansible all -m shell -a "systemctl status asterisk" --become

# Check SIP endpoints
ansible all -m shell -a "asterisk -rx 'pjsip show endpoints'" --become
```

### Phone Testing
1. Pick up handset - should hear dial tone
2. Any 3-digit number should play "hello-world" message
3. Extension 100 or 999 for specific test messages

## Troubleshooting

### Common Issues

**HT801 not reachable**: 
- Note: HT801 devices typically have ping disabled for security
- Use web interface test: `ansible all -m uri -a "url=http://192.168.50.20"`
- Run manual configuration steps above
- Check network cable connections
- Verify Pi ethernet interface: `ip addr show eth0`

**Asterisk not responding**:
- Check service: `sudo systemctl status asterisk`
- Check logs: `sudo tail -f /var/log/asterisk/messages`
- Restart: `sudo systemctl restart asterisk`

**SIP registration failed**:
- Verify HT801 IP configuration matches `ht801_ip` variable
- Check pjsip.conf configuration: `sudo asterisk -rx "pjsip show endpoints"`
- Review HT801 web interface SIP settings

### Manual Commands

```bash
# SSH to Pi
ssh pi5phone

# Connect to Asterisk CLI
sudo asterisk -rvvv

# Useful Asterisk CLI commands
pjsip show endpoints
pjsip show transports
core show channels
core reload
```

## Development Workflow

1. **Make changes** to templates or playbooks
2. **Test changes**: `ansible-playbook playbooks/update.yml --check`
3. **Deploy**: `ansible-playbook playbooks/update.yml`
4. **Verify**: Test phone functionality or run verification tags

## Automation Benefits

- ✅ **Reproducible**: Complete setup from clean Pi
- ✅ **Version Controlled**: All configurations in git
- ✅ **Rollback Capable**: Automatic config backups
- ✅ **Documented**: Self-documenting playbooks
- ✅ **Testable**: Individual components can be tested
- ✅ **Remote**: No manual Pi access required after initial setup
