# Audio Content Update Workflow (F203)

The system supports simple, automated updates of all phone audio content:

1. **Add or replace audio files** in `source-audio/` using the format `<digit>_<desc>.<ext>` (e.g., `1_birthday.m4a`, `2_meditation.mp3`).
2. **Run the update playbook:**
  ```bash
  ansible-playbook playbooks/update.yml --tags audio
  ```
  This will:
  - Convert and normalize all audio to 8kHz mono WAV using ffmpeg with loudnorm (target -18 LUFS)
  - Place each file in the correct subfolder as `recording.wav` for Asterisk
  - Sync files to `/var/lib/asterisk/sounds/ainslie/` with correct permissions
  - No Asterisk restart is required for new audio

  ```bash
  # use watch mode for automatic updates on file changes
  chokidar  -c "ansible-playbook playbooks/update.yml --tags asterisk_config"
  ```
3. **Dial a single digit (1-9) on the phone** to play the corresponding recording. DTMF response is immediate and snappy.

**Technical details:**
- Normalization: ffmpeg `loudnorm=I=-18:TP=-1:LRA=11` for consistent volume
- File structure is managed automatically by Ansible
- Only single-digit extensions are active for instant response

# HT801 Setup Automation

This directory contains Ansible automation for the complete HT801 and Asterisk setup process described in the HT801-Setup-Guide.md.

## Quick Setup Commands

```bash
# Complete setup from scratch (includes HT801 auto-provisioning)
cd ansible

# 1. Setup SSH keys (first time only)
ansible-playbook playbooks/setup-ssh.yml

# 2. Provision the Pi (basic system setup)
ansible-playbook playbooks/provision.yml

# 3. Install Asterisk from source
ansible-playbook playbooks/install-asterisk.yml

# 4. Full automated setup (network + Asterisk + HT801 auto-config)
ansible-playbook playbooks/full-setup.yml

# Alternative: Step-by-step manual approach
ansible-playbook playbooks/ht801-setup.yml          # Manual HT801 config
ansible-playbook playbooks/update.yml               # Deploy/update configs only
```

## HT801 Auto-Provisioning ✨ **NEW**

The system now supports **automatic HT801 configuration** via HTTP API calls, eliminating most manual web interface configuration:

```bash
# Auto-configure HT801 only
ansible-playbook playbooks/ht801-autoprovision.yml

# Complete automated setup (recommended)
ansible-playbook playbooks/full-setup.yml
```

**What Gets Auto-Configured:**
- ✅ Static IP address (192.168.50.20)
- ✅ Network settings (subnet, gateway, DNS)
- ✅ SIP server configuration (points to Pi)
- ✅ SIP user credentials (ht801-aor)
- ✅ Audio codec settings (G.711 μ-law)
- ✅ Admin password change (to Phone2Pi)
- ✅ Device reboot and verification

**Fallback:** If auto-provisioning fails, detailed manual instructions are provided.

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

# Auto-provision HT801 via HTTP API (recommended)
ansible-playbook playbooks/ht801-autoprovision.yml

# Complete automated setup (network + asterisk + HT801)
ansible-playbook playbooks/full-setup.yml

# Check connectivity only
ansible-playbook playbooks/ht801-setup.yml --tags=connectivity

# Verify Asterisk status only
ansible-playbook playbooks/ht801-setup.yml --tags=verify
```

## Manual HT801 Configuration

⚠️ **Note**: Most HT801 configuration is now automated via `playbooks/ht801-autoprovision.yml` or `playbooks/full-setup.yml`. Manual configuration is only needed as a fallback.

If auto-provisioning fails, you'll need to configure manually:

1. **Get current IP**: Pick up phone, dial `***`, then `02`
2. **SSH Tunnel**: `ssh -L 8080:<current_ip>:80 drew@pi5phone`
3. **Web Interface**: Open `http://localhost:8080`, login with password on the HT801 device
4. **Configure Static IP**: Set to `192.168.50.20` in BASIC SETTINGS
5. **Configure SIP**: In FXS PORT1, set server to `192.168.50.10`, user `ht801-aor`

**Auto-Provisioning Parameters** (applied automatically):
```yaml
Network Settings:
  IP Address: 192.168.50.20
  Subnet Mask: 255.255.255.0  
  Gateway: 192.168.50.10
  
SIP Settings:
  Primary SIP Server: 192.168.50.10
  SIP User ID: ht801-aor
  Authenticate ID: ht801-aor
  Authenticate Password: (blank - IP-based auth)
  
Security:
  Admin Password: Phone2Pi
```

## Files and Structure

```
ansible/
├── playbooks/
│   ├── setup-ssh.yml          # Initial SSH key setup
│   ├── provision.yml          # Basic Pi provisioning + network
│   ├── network-setup.yml      # Network configuration for HT801
│   ├── install-asterisk.yml   # Asterisk installation from source
│   ├── ht801-setup.yml       # Complete HT801 + Asterisk config
│   ├── ht801-autoprovision.yml # HT801 auto-config via HTTP API ✨ NEW
│   ├── full-setup.yml        # Complete automated setup ✨ NEW
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
