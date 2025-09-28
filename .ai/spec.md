# Ainslie Memorial Gallery Installation Specification

## Project Overview
A memorial gallery installation featuring an interactive retro telephone system that plays recordings of a departed friend named Ainslie. Pick up the phone and experience her voice as if we were still connected through underground wires.

*For current implementation status and feature details, see [features.md](features.md).*

## Development Prerequisites

### Hardware Requirements
- **Raspberry Pi 5** with Raspberry Pi OS
- **Grandstream HT801 v2** (1 FXS port ATA)
- **HTMengt 2500** analog desk phone
- **Ethernet cables** for Pi-to-HT801 connection
- **MicroSD card** (32GB+ recommended)

### Software Tooling
- **Ansible** (control machine): `pip install ansible ansible-core`
- **SSH tools**: `ssh`, `sshpass` (`sudo apt install sshpass`)  
- **Audio processing**: `ffmpeg` with loudnorm filter
- **Git** for version control and deployment
- **Text editor** with YAML/Jinja2 syntax support

### Network Setup
- **Static IP configuration**: Pi at 192.168.50.10, HT801 at 192.168.50.20
- **Ethernet interface** on Pi for direct HT801 connection
- **SSH access** to Pi (key-based authentication)

See [ansible/README.md](../ansible/README.md) for detailed setup instructions.

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
   - RJ11 connection to ATA gateway (Grandstream HT801 v2 1 FXS)

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
- ✅ DTMF interruption system implemented with Background app
- ✅ Responsive keypad navigation with immediate audio stopping
- 🔄 Text-to-Speech integration (Festival) planned but not deployed
- 🔄 Ready for SIP/HT801 configuration and final audio content

## User Experience Flow

### Navigation System on Pickup
- **help message (main menu)**: "Welcome to the Ainslie Oneil memorial phone. Press 1-9 to hear a recording of Ainslie. Press star to repeat the last recording, pound to listen to or record a voice memo, and zero to hear this message again. Hang up to end the call."
  - Timeout: If no input for 15 seconds, this help message is replayed.
- **Press 1-9**: Plays specific recording assigned to that number
- **Press 0**: Repeats help message (main menu)
- **Press (*)**: Repeats the last played message in this context (main menu)
- **Press (#)**: Enters voice memo mode

- Voice Memo Mode
  - **help message (recording menu)**: "You are now in voice memo mode. Enter a three digit number to listen to a recording, or if there is no recording at that number, you will be prompted to record a message. Press star to repeat the last message, press pound to return to the main menu, or hang up to end the call. Press zero to hear this message again."
    - Timeout: If no input for 15 seconds, this help message is replayed.
  - **Press 0**: Repeats recording menu message (voice memo help)
  - **Press (*)**: Repeats the last played message in this context (voice memos)
  - **Press (#)**: Returns to main menu
  - **Press 000-999**: Plays recording at that number, or prompts to record if none exists
    - **If a recording exists**:
      - Play recording
      - **post recording message**: "You have listened to the message at [number]. Press star to listen to it again, press zero for help, press pound to return to the main menu, or press three numbers to go to another recording."
        - **Press 0**: Replays the voice memo help
        - **Press (*)**: Repeats the just-played message
        - **Press (#)**: Returns to main menu
        - **Enter 000-999**: Go to that recording code
    - **If no recording exists**: "No recording found at [number]. To record a message, press star. Press zero to hear this message again. Press pound to return to the main menu. To end the call, hang up."
      - **Press (*)**: "You may now record your message after the beep. Press pound when finished or hang up."
        - Recording in progress: User records message (max 20 minutes; recordings shorter than 5 seconds are discarded and you will be prompted to try again)
        - **Press (#)**: Ends recording
        - **After recording (only if >= 5 seconds)**: "Your message has been saved at [number]. Press star to listen to it, press 1 to re-record, press 9 to delete, press pound to return to the main menu, or hang up to end the call."
          - **Press (*)**: Plays the newly recorded message
          - **Press 1**: Re-record message (overwrites the just-recorded message at this number within the same session)
          - **Press 9**: "Press 9 again to confirm deletion of the message at [number], or press any other key to cancel."
            - **Press 9 (again)**: "Your message at [number] has been deleted." (return to voice memo help)
            - **Any other key**: "Deletion cancelled." (return to post-recording options)
          - **Press (#)**: Returns to main menu
          - **Press 0**: Repeats the recording menu help
- **Overwrite policy**: If a recording already exists at a code, visitors cannot create a new message at that code. They may only listen. Recording is only offered when a slot is empty.

### Recording Management
- **Storage capacity**: ~0.5 MB/minute at 8kHz mono WAV. 20-minute maximum per message.
- **Minimum length**: Recordings under 5 seconds are discarded and reprompted.
- **File finalization**: Files are saved when recording stops via # or hangup. Hangup preserves the current recording.

### Audio Organization
```
/var/lib/asterisk/sounds/
├── ainslie/
│   ├── prompts/
│   │   ├── help_prompt.wav
│   │   └── ...
│   ├── 1/
│   │   ├── recording.wavnoload => res_config_pgsql.so
│   ├── 2/
│   │   └── recording.wav
│   ├── ...
│   └── 9/
│       └── recording.wav
├── recordings/
│   ├── 000.wav
│   ├── 001.wav
│   ├── ...
│   └── 999.wav
```
Directory structure is complete. Wav files are 8kHz mono WAV files.

### Help Prompt Scripts

- `help_main_menu.wav`: Welcome to the Ainslie O'Neil memorial phone. Press 1 through 9 to hear a recording of Ainslie. Press star to repeat the last recording. Press pound to access voice memo mode. Press zero to hear this message again. Hang up to end your call.

- `help_voice_memo_menu.wav`: You are in voice memo mode. Enter a three-digit number to listen to a recording. If no recording exists, you can record a message at that number. Press star to repeat the last memo. Press pound to return to the main menu. Press zero to hear this message again.

- `post_recording_message.wav`: That was the recording at number [digits]. 

- `no_recording_found.wav`: No recording found at number [digits]. 
- `no_recording_options.wav`: To record a message at this number, press star. Press pound to return to the memo menu. Press zero to repeat this message.

- `recording_prompt.wav`: You may now record your message after the beep. Press pound when finished, or hang up.

- `recording_too_short.wav`: Your recording was too short. Please try again and speak for at least 5 seconds.

- `recording_saved.wav`: Your message has been saved at number [digits]. 
- `recording_saved_options.wav`: Press star to listen to your recording. Press 1 to re-record. Press 9 to delete. Press pound to return to the main menu. Press zero to repeat this message.

- `delete_confirmation.wav`: Press 9 again to confirm deletion of the message at number [digits]. 
- `delete_confirmation_options.wav`: Press any other key to cancel.
- `deletion_success.wav`: Your message has been deleted from number [digits].
- `deletion_cancelled.wav`: Deletion cancelled.

### Ring Feature (Optional)

Random ring feature that periodically rings the phone to attract attention.

- A systemd timer triggers a bash script periodically (e.g., every 30 minutes).
- The script uses Asterisk's `channel originate` command to initiate a call to the phone.
  - `channel originate local/start@ring-random extension 0@random-message`
- The dialplan context `ring-random` handles the ringing logic:
- The dialplan context `random-message` plays a random message if the call is answered.

This feature is available but will not be added at this time. It can be enabled in the future if desired.

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
1. **Idle State**: Phone on-hook, system waiting (working)
2. **Off-hook Event**: Immediate dial tone generation (working)
3. **DTMF Detection**: Real-time keypress processing (working)
4. **Audio Playback**: Immediate response to digit presses (working, volume normalization not yet implemented)
5. **State Management**: Track current/last played recording for repeat function (working)
6. **Hangup Handling**: Clean termination and state reset (working)

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
- SIP configuration and dialplan: Implemented and working

## Technical Constraints
- **Single Handset**: One phone interface only
- **No Internet Dependency**: Fully offline operation for gallery use
- **Direct Connection**: Pi and HT801 communicate directly via Ethernet
- **File-Based**: No database requirements
- **Local Development**: Git repository and deployment tools on desktop only

## Installation

- ensure pi connects to gallery wifi
- ensure asterisk is installed and configured
- ensure audio files are in place
- ensure proper permissions on files and directories
- connect phone and power on
- verify operation by picking up the handset
- tissues and trashcan next to phone