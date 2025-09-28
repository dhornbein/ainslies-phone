# Ainslie Memorial Phone Gallery

A memorial gallery installation featuring an interactive retro telephone system that plays recordings of a departed friend named Ainslie. Pick up the phone and experience her voice as if we were still connected through underground wires.

## Quick Start

**Prerequisites**: Raspberry Pi 5, Grandstream HT801 ATA, analog desk phone

```bash
git clone <this-repo>
cd ainslie-phone/ansible

# First time setup
ansible-playbook playbooks/setup-ssh.yml      # Setup SSH keys
ansible-playbook playbooks/provision.yml      # Basic system setup
ansible-playbook playbooks/install-asterisk.yml  # Install Asterisk (~12 mins)
ansible-playbook playbooks/full-setup.yml     # Configure networking + Asterisk

# Manual HT801 configuration required (see ansible/README.md)
# Then test: pick up phone, dial any single digit 1-9
```

## System Architecture

**Hardware Components:**
- **HTMengt 2500** analog desk phone (the interface)
- **Grandstream HT801** ATA gateway (analog-to-SIP converter)
- **Raspberry Pi 5** with Asterisk PBX (the brain)
- **Direct ethernet connection** (Pi ↔ HT801, no router needed)

**Software Stack:**
- **Asterisk 18.26.4** PBX with custom dialplan
- **Ansible automation** for deployment and updates
- **ffmpeg** audio processing with loudnorm
- **Static IP networking** (offline operation)

**User Experience:**
1. Pick up phone → instant dial tone
2. Press single digit (1-9) → immediate audio playback
3. Hang up → automatic cleanup and reset

## Project Structure

```
ainslie-phone/
├── README.md                    # This file
├── ansible/                     # Deployment automation
│   ├── README.md                # Complete setup guide
│   ├── playbooks/               # Ansible playbooks
│   ├── templates/               # Config templates
│   └── group_vars/all.yml       # Project variables
├── sounds/                      # Processed audio (8kHz mono WAV)
│   ├── 1/recording.wav          # Dial 1 to hear
│   ├── 2/recording.wav          # Dial 2 to hear
│   ├── prompts/                 # Help prompts (e.g., help_main_menu.wav)
│   └── ...
├── source-audio/                # Original recordings
│   ├── 1_description.m4a        # Convert to sounds/1/
│   ├── 2_description.mp3        # Convert to sounds/2/
│   └── convert_audio.sh         # Manual conversion script
└── .ai/                         # Project documentation
    ├── spec.md                  # Architecture details
    └── features.md              # Feature status tracking
```

## Key Features

✅ **Instant Response**: Single-digit dialing with immediate audio playback  
✅ **Volume Normalized**: All audio processed to consistent -18 LUFS  
✅ **Offline Operation**: No internet required after setup  
✅ **Simple Updates**: Add audio files and run `ansible-playbook update.yml`  
✅ **Automated Deployment**: Complete Pi setup via Ansible  
✅ **Help System**: Voice prompts for navigation  

## Getting Started

### 1. Hardware Setup
- Flash Raspberry Pi OS to SD card (enable SSH, set username: `drew`)
- Connect Pi ethernet port directly to HT801 ethernet port
- Connect analog phone to HT801 FXS port
- Power on both devices

### 2. Software Deployment
See [ansible/README.md](ansible/README.md) for complete setup instructions including:
- SSH key configuration
- Ansible prerequisites
- Step-by-step deployment process
- HT801 manual configuration (auto-provisioning not yet working)

### 3. Audio Content Management
Add new recordings by placing files in `source-audio/` with format `<digit>_description.<ext>`, then:

```bash
ansible-playbook playbooks/update.yml --tags audio
```

This automatically converts, normalizes, and deploys audio to the Pi.

## Network Configuration

The system uses a simple direct connection:
- **Pi**: 192.168.50.10 (static)
- **HT801**: 192.168.50.20 (configured via web interface)
- **Subnet**: 255.255.255.0
- **No DHCP/DNS required** (offline operation)

## Troubleshooting

**No dial tone**: Check HT801 web interface SIP registration status  
**Audio not playing**: Verify files in `/var/lib/asterisk/sounds/ainslie/`  
**Setup issues**: See detailed troubleshooting in [ansible/README.md](ansible/README.md)  
**HT801 configuration**: Manual setup required, see deployment guide  

## Development

**Daily workflow**:
```bash
# Make changes locally
git add . && git commit -m "Update description"

# Deploy to Pi
cd ansible && ansible-playbook playbooks/update.yml
```

**Audio development with watch mode**:
```bash
# Auto-deploy on file changes (requires chokidar-cli)
chokidar -c "ansible-playbook playbooks/update.yml --tags asterisk_config"
```

## Technical Details

For comprehensive technical documentation:
- **Architecture**: [.ai/spec.md](.ai/spec.md)
- **Feature Status**: [.ai/features.md](.ai/features.md)  
- **Deployment**: [ansible/README.md](ansible/README.md)
- **Audio Processing**: [source-audio/convert_audio.sh](source-audio/convert_audio.sh)

## License

This is a personal memorial project. Code is provided for educational purposes.

---

*In memory of my dear friend Ainslie*