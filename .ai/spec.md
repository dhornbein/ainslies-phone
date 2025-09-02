# Ainslie Phone Gallery Installation Specification

## Project Overview
A memorial gallery installation featuring an interactive retro telephone system that plays recordings of a departed friend named Ainslie. Pick up the phone and experience her voice as if we were still connected through underground wires.

**Current Status**: ✅ **Infrastructure Phase Complete** - Raspberry Pi provisioned, Asterisk PBX installed and running, ready for phone gallery implementation.

## Core Concept
- **Primary Device**: HTMengt 2500 Analog Desk Phone
- **Purpose**: Memorial tribute allowing visitors to hear Ainslie's voice through recordings
- **Interaction Model**: Traditional telephone interface with keypad navigation
- **Technical Foundation**: Raspberry Pi + Asterisk PBX + Grandstream HT801 v2 1 FXS

## Loose feature Ideas
- **Participants record**: Allow visitors to leave their own messages or memories of Ainslie, which can be played back later. Allow saving at number address and playback by future visitors. Allow listener to play random recordings.

## System Architecture

### Hardware Components
1. **Phone Interface**
   - HTMengt 2500 Analog Desk Phone
   - Red telephone line cord for visual authenticity
   - RJ11 connection to ATA gateway

2. **Communication Gateway**
   - Grandstream HT801 ATA (Analog Telephone Adapter)
   - Converts analog phone signals to SIP/VoIP
   - Single FXS port for phone connection
   - Ethernet connection to Raspberry Pi

3. **Processing Unit**
   - Raspberry Pi 5
   - Runs Asterisk PBX software
   - Handles call logic and audio playback
   - Direct Ethernet connection to HT801 (no internet required)

4. **Storage & Power**
   - 32-64GB microSD card for OS and audio files
   - 5V 3A power supply for Raspberry Pi
   - Power adapter for HT801

### Software Stack
- **Operating System**: Raspberry Pi OS Lite ✅ **DEPLOYED**
- **PBX Software**: Asterisk 18.26.4 LTS ✅ **INSTALLED AND RUNNING**
- **Configuration**: Minimal dialplan for hotline operation 🔄 **NEXT PHASE**
- **Audio Management**: File-based system with directory structure 🔄 **READY FOR IMPLEMENTATION**
- **Deployment**: Ansible automation pipeline ✅ **FULLY OPERATIONAL**

**Current Implementation Status**:
- ✅ Raspberry Pi 5 configured and accessible via SSH
- ✅ Asterisk compiled from source with official dependencies
- ✅ systemd service running with proper permissions  
- ✅ Sample configurations installed at `/etc/asterisk/`
- ✅ Audio directory structure ready at `/var/lib/asterisk/sounds/`
- ✅ Ansible deployment pipeline tested and working
- 🔄 Ready for SIP/HT801 configuration and dialplan implementation

## User Experience Flow

### Initial Interaction
1. **Pickup Detection**: Phone goes off-hook
2. **Dial Tone**: 5-second dial tone plays (interruptible by keypress)
3. **Welcome Prompt**: Automated help message explains navigation

### Navigation System
- **Digits 1-9**: Play specific recordings assigned to each number
- **Digit 0**: Replay help/instruction prompt
- **Star (*)**: Repeat last played recording from beginning
- **Hash (#)**: Random selection from all available recordings
- **Hangup**: Immediately stop playback and return to idle state

### Audio Organization
```
/var/lib/asterisk/sounds/ainslie/
├── prompts/
│   └── help_prompt.wav
├── 1/
│   ├── recording1.wav
│   └── recording2.wav (if multiple recordings per digit)
├── 2/
│   └── recording.wav
├── ...
└── 9/
    └── recording.wav
```

## Technical Specifications

### Network Configuration
- **Topology**: Direct connection (Pi ↔ HT801)
- **IP Assignment**: Static addressing
  - Raspberry Pi: 192.168.50.10
  - HT801: 192.168.50.20
- **Protocol**: SIP registration with RFC2833 DTMF
- **Internet**: Not required (isolated system)

### Audio Requirements
- **Format**: WAV mono preferred
- **Sample Rate**: 8kHz (authentic phone bandwidth) or 16kHz
- **Processing**: Asterisk handles transcoding as needed
- **Normalization**: Consistent perceived loudness across recordings
- **Length**: Variable duration supported

### Call Flow Logic
1. **Idle State**: Phone on-hook, system waiting
2. **Off-hook Event**: Immediate dial tone generation
3. **DTMF Detection**: Real-time keypress processing
4. **Audio Playback**: Immediate response to digit presses
5. **State Management**: Track current/last played recording for repeat function
6. **Hangup Handling**: Clean termination and state reset

## Operational Characteristics

### Gallery Environment
- **Power-on Sequence**: ~1 minute boot time for full system availability
- **Testing Protocol**: Pickup handset to verify operation
- **Content Updates**: File system replacement + Asterisk restart
- **Maintenance**: Minimal - file-based operation with no database

### Optional Features (Future Enhancement)
- **Invite Ringing**: Periodic gentle rings to attract attention
- **Message Recording**: Capability for visitors to leave messages about Ainslie
- **Ring Patterns**: Short, non-intrusive ring bursts

## Design Principles
- **Simplicity**: Minimal complexity for maximum reliability
- **Authenticity**: Vintage phone experience with modern reliability
- **Memorial Focus**: Technology serves the emotional purpose
- **Gallery-Appropriate**: Suitable for public exhibition space
- **Maintenance-Minimal**: Self-contained operation with simple content updates

## Deployment Strategy

### Development Environment ✅ **IMPLEMENTED**
- **Local Git Repository**: Version control without remote dependencies
- **Ansible Automation**: Automated provisioning and updates via SSH over WiFi ✅ **WORKING**
- **Professional Installation**: Asterisk compiled from source following official docs ✅ **COMPLETED**

### Deployment Workflow ✅ **OPERATIONAL**
1. **Development**: Code and configure on desktop using VS Code ✅ **READY**
2. **Version Control**: Commit changes to local git repository ✅ **READY**
3. **Deployment**: Ansible playbook syncs changes to Pi via WiFi ✅ **TESTED**
4. **Gallery Operation**: Pi runs standalone on dedicated SD card 🔄 **NEXT PHASE**

**Completed Ansible Playbooks**:
- ✅ `setup-ssh.yml` - SSH key authentication working
- ✅ `provision.yml` - Base system and file deployment working  
- ✅ `install-asterisk.yml` - Asterisk 18.26.4 installed and running
- 🔄 `update.yml` - Ready for ongoing deployments

### Network Architecture ✅ **INFRASTRUCTURE READY**
- **Development Phase**: Pi connected to WiFi for remote management and deployment ✅ **CURRENT**
- **Gallery Operation**: Pi isolated with direct Ethernet to HT801 (no internet required) 🔄 **NEXT PHASE** 
- **Maintenance Access**: WiFi available for remote updates when needed ✅ **AVAILABLE**

**Current System Status**:
- Raspberry Pi 5: Provisioned and accessible
- Asterisk Service: Active and validated  
- CLI Access: `sudo asterisk -rvvv` working
- Logs: Available at `/var/log/asterisk/messages`
- Ready for: SIP configuration and dialplan implementation

## Technical Constraints
- **Single Handset**: One phone interface only
- **No Internet Dependency**: Fully offline operation for gallery use
- **Direct Connection**: Pi and HT801 communicate directly via Ethernet
- **File-Based**: No database requirements
- **Local Development**: Git repository and deployment tools on desktop only
