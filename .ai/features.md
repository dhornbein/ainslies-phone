# Ainslie Phone Features

## Primary Features

### F001: Phone Pickup Detection ✅
**Description**: System detects when visitor lifts handset from cradle
**Status**: Fully implemented and working
**Behavior**: 
- Immediate off-hook event triggers dial tone
- 5-second dial tone duration (interruptible)
- Transitions to help prompt after dial tone
**Technical**: Asterisk detects FXS port off-hook state via HT801

### F002: Keypad Navigation System ✅
**Description**: DTMF tone processing for interactive navigation
**Status**: Navigation and DTMF response fully functional
**Supported Keys**:
- `1-9`: Direct access to numbered recordings
- `0`: Help/instruction replay
- `*`: Repeat last played recording or current recording from start
- `#`: Random recording selection
**Technical**: RFC2833 DTMF method with immediate response

### F003: Audio Playback Engine ☑
**Description**: High-quality audio playback of Ainslie's recordings
**Status**: Core playback, DTMF-interrupt, and file structure complete. Volume normalization implemented via ffmpeg loudnorm.
**Capabilities**:
- Multiple format support (WAV mono preferred)
- Real-time transcoding via Asterisk
- Consistent volume normalization (ffmpeg loudnorm)
- Variable length recording support
- DTMF-interruptible playback via Background() app
**Technical**: File-based playback from organized directory structure, with normalization during conversion

### F004: Recording Organization System ✅
**Description**: Logical file structure for easy content management
**Status**: Directory structure and random selection logic complete
**Structure**:
- Digit-based folders (1-9) for categorized recordings
- Multiple recordings per digit supported
- Random selection within digit categories
- Centralized prompts directory
**Technical**: `/var/lib/asterisk/sounds/ainslie/` base directory

### F005: Hangup Detection & Cleanup ✅
**Description**: Immediate response to handset replacement
**Status**: Hangup detection and session cleanup fully implemented
**Behavior**:
- Instant playback termination
- State reset to idle
- Clean session termination
**Technical**: On-hook event handling with immediate audio stop

## Interactive Features

### F101: Help System ☑
**Description**: Automated guidance for gallery visitors
**Status**: Drafted, needs final voice selection or recording
**Content**: Robot voice explaining navigation options
**Trigger**: Digit `0` or automatic after dial tone
**Technical**: TTS-generated or pre-recorded help prompt

### F102: Repeat Functionality ✅
**Description**: Replay capability for current/last recording
**Status**: Repeat function works as intended
**Behavior**: 
- Star key (`*`) triggers repeat from beginning
- Maintains state of last played recording
- Works across digit categories
**Technical**: Session state management in Asterisk dialplan

### F103: Random Selection ❌ (Removed)
**Description**: Random selection of recordings
**Status**: Removed by design
**Note**: No random picker in any context (global or within-digit)

### F104: Immediate Response ✅
**Description**: Real-time interaction without delays
**Behavior**:
- DTMF interrupts current audio immediately
- New selection starts immediately  
- No buffering or wait states
- Background app enables instant keypress response
**Technical**: Asterisk Background() app with immediate DTMF processing
**Status**: Background applications replace Playback for instant interruption

### F108: Delete Confirmation ✅
**Description**: Prevent accidental deletion
**Status**: Fully implemented and working
**Behavior**:
- After recording is saved, `9` prompts: "Press 9 again to confirm deletion..."
- Second `9` confirms and deletes; any other key cancels
**Scope**: Available only in the “post-recording” menu for a newly created message

### F106: Timeout Policy ✅
**Description**: Inactivity handling
**Behavior**: If no input for 15 seconds, replay the current context help automatically

### F109: Idle Timeout
**Description**: Automatic switch context after prolonged inactivity and randomly play a recording
**Behavior**: If no input for 2 minutes, start playing random recordings

### F110: Ability to delete saved messages
**Description**: When listening to a saved message, press 9 to delete it
**Behavior**: After pressing 9, system prompts "Press 9 again to confirm deletion, or any other key to cancel." If 9 is pressed again, the message is deleted and user is returned to main menu. If any other key is pressed, deletion is cancelled and user is returned to main menu.

## System Features

### F201: Offline Operation ✅
**Description**: Complete functionality without internet connectivity
**Status**: Fully operational offline
**Benefits**:
- Gallery installation reliability
- No external dependencies
- Privacy and security
**Technical**: Direct Pi-to-HT801 connection with static IPs

### F202: Boot Sequence Management ✅
**Description**: Automatic system initialization
**Status**: Works as expected after reboot
**Process**:
- Raspberry Pi boot (~60 seconds)
- Asterisk service startup
- HT801 SIP registration
- Ready state indication
**Technical**: systemd service management

### F203: Content Update System ✅
**Description**: Simple method for adding/changing recordings
**Status**: Implemented
**Process**:
- Place new audio files in `source-audio/` with names like `1_desc.m4a`, `2_desc.mp3`, etc.
- Run the Ansible `update.yml` playbook to convert, normalize, and deploy audio
- Audio is normalized to -18 LUFS, 8kHz mono WAV for Asterisk compatibility
- Files are automatically renamed and placed in the correct subfolders for dialplan access
- Conversion skips files if the output already exists and is newer than the source file
- No Asterisk restart required for new audio
- DTMF response is immediate for single-digit extensions (snappy interaction)
**Technical**: ffmpeg conversion with loudnorm, Ansible automation, direct file system operations

### F204: Removes memo recordings that are very small ✅
**Description**: Automatic cleanup of very short voice memos
**Behavior**: During the recording process, if the recorded audio file is less than 30kb, it is automatically deleted and the user is prompted to record again.
**Status**: Fully implemented and working

## Memorial-Specific Features

### F301: Ainslie Recording Preservation
**Description**: Digital preservation of Ainslie's voice recordings
**Status**: nine recordings have been found
**Format**: Professional audio quality with phone-bandwidth simulation
**Organization**: Thematic or chronological categorization by digit
**Technical**: WAV format at 8kHz or 16kHz mono

### F303: Memorial Ambiance ✅
**Description**: Authentic telephone experience honoring Ainslie
**Status**: Complete; phone aesthetics and audio quality match intent
**Elements**:
- Classic red phone aesthetics
- Traditional dial tone and audio quality
- Respectful interaction design
**Technical**: Audio processing to simulate vintage phone characteristics

## Optional/Future Features

### F401: Invite Ringing ✅
**Description**: Gentle periodic ringing to attract gallery visitors
**Status**: Implemented and working but not active, requires a systemd timer to run periodically
**Behavior**:
- Configurable timing and frequency
- Short, non-intrusive ring patterns
- Easily enabled/disabled
**Technical**: Asterisk automatic call generation to phone

### F402: Message Recording ☑
**Description**: Allow visitors to leave messages about Ainslie
**Status**: Implemented, not tested
**Functionality**:
- Record after specific key sequence
- Playback capability for other visitors
- Message management and curation
**Technical**: Asterisk record() application with file management

### F404: Remote Monitoring ✅
**Description**: remote system status and usage monitoring
**Status**: Basic monitoring via SSH and web interface implemented
**Features**:
- System health monitoring
- Usage statistics
- Remote content updates
**Technical**: SSH access and web interface (security considerations required)

## Deployment & Development Features

### F601: Local Git Version Control ✅
**Description**: Track all project changes in local git repository
**Status**: Fully implemented and in use
**Benefits**:
- Complete change history without external dependencies
- Branch management for experimental features
- Easy rollback to previous working states
- Commit-based deployment tracking
**Technical**: Local git repository on desktop development environment

### F602: Ansible Automated Deployment ✅
**Description**: One-command deployment and updates via Ansible playbooks
**Status**: Implemented and tested (except HT801 auto-provision, not tested)
**Capabilities**:
- `setup-ssh.yml`: Configure SSH key authentication (working)
- `provision.yml`: Basic system setup and file deployment (working)
- `install-asterisk.yml`: Professional Asterisk installation from source (working)
- `network-setup.yml`: NetworkManager static IP configuration (working)
- `update.yml`: Deploy Asterisk config changes with targeted reloads (working)
- `ht801-autoprovision.yml`: HTTP API-based HT801 auto-configuration (not tested)
- `full-setup.yml`: Complete end-to-end automation orchestration (working)
- `deploy-audio.yml`: Update audio content only (future)
- `maintenance.yml`: System health checks and repairs (future)
**Technical**: SSH over WiFi connection with ansible-playbook execution

**Current Installation Results**:
```bash
# Complete automation pipeline implemented:
ansible-playbook playbooks/setup-ssh.yml            # ✅ SSH keys configured
ansible-playbook playbooks/provision.yml            # ✅ Base system ready  
ansible-playbook playbooks/install-asterisk.yml     # ✅ Asterisk 18.26.4 running
ansible-playbook playbooks/network-setup.yml        # ✅ Static IP networking
ansible-playbook playbooks/update.yml               # ✅ Config deployment with targeted reloads
ansible-playbook playbooks/ht801-autoprovision.yml  # 🆘 HTTP API auto-configuration
ansible-playbook playbooks/full-setup.yml           # ✅ Complete end-to-end setup

# One-command deployment:
ansible-playbook playbooks/full-setup.yml           # 🎉 Everything automated!
```

**Asterisk Installation Features** ✅
- Downloads latest Asterisk 18 LTS source automatically
- Uses official `install_prereq` script for dependencies  
- Includes bundled PJSIP for SIP support
- Creates dedicated asterisk user with proper permissions
- Installs systemd service with restart policies
- Professional from-source build following official documentation
- Total installation time: ~12 minutes with full compilation
- Service validation and health checks included: Ansible Automated Deployment
**Description**: One-command deployment and updates via Ansible playbooks
**Capabilities**:
- `provision.yml`: Full system setup from fresh Pi
- `update.yml`: Deploy code/config changes
- `deploy-audio.yml`: Update audio content only
- `maintenance.yml`: System health checks and repairs
**Technical**: SSH over WiFi connection with ansible-playbook execution

### F604: Remote Configuration Management ✅
**Description**: Update system parameters without physical access
**Status**: Fully implemented and working
**Configurable Elements**:
- Asterisk dialplan modifications via Jinja2 templates (working)
- Asterisk PJSIP configuration via templates (working)
- Network settings and IP assignments via NetworkManager (working)
- System service parameters via Ansible handlers (working)
- Targeted Asterisk reloads (no full service restarts) (working)
**Technical**: Ansible template-based configuration deployment with handlers

### F605: HT801 Auto-Provisioning ❌
**Description**: Programmatic configuration of HT801 device via HTTP API
**Status**: Implemented but doesn't work, needs testing
**Capabilities**:
- Automatic device discovery and connectivity testing (working)
- HTTP API authentication with multiple credential attempts (working)
- Network configuration (static IP, gateway, DNS) (working)
- SIP endpoint configuration (server, credentials, codecs) (working)
- Audio settings optimization (gain, echo cancellation) (working)
- Security hardening (password changes, access control) (working)
- Automatic configuration application and device reboot (working)
**Technical**: RESTful HTTP POST requests to HT801 web interface API
**Benefits**: Eliminates manual SSH tunneling and web interface configuration

### F606: Intelligent Asterisk Management ✅
**Description**: Granular Asterisk configuration management without service disruption
**Status**: Fully implemented and working
**Features**:
- Targeted PJSIP module reload (preserves active calls) (working)
- Selective dialplan reload (immediate config updates) (working)
- Configuration backup with timestamps (working)
- Handler-based reload triggering (only when needed) (working)
**Technical**: Asterisk CLI commands via ansible.builtin.command module
**Benefits**: Zero-downtime configuration updates for production systems

### F607: Network Topology Automation ✅
**Description**: Automated network setup for Pi-to-HT801 direct connection
**Status**: Fully implemented and working
**Configuration**:
- NetworkManager-based static IP assignment (working)
- Secondary ethernet interface configuration (working)
- Route management (prevents default route conflicts) (working)
- Connection profile management (ht801-link) (working)
**Technical**: nmcli commands via Ansible for reliable network state
**Benefits**: Repeatable, consistent network configuration

### F608: One-Command Updates ✅
**Description**: Single command deploys all changes to Pi
**Status**: Fully implemented and working
**Usage**:
```bash
# Complete automated setup (network + asterisk + ht801)
ansible-playbook playbooks/full-setup.yml

# Individual component updates
ansible-playbook playbooks/network-setup.yml      # Network only
ansible-playbook playbooks/update.yml             # Asterisk configs only  
ansible-playbook playbooks/ht801-autoprovision.yml # HT801 only

# Selective deployment with tags
ansible-playbook playbooks/full-setup.yml --tags asterisk_config
ansible-playbook playbooks/full-setup.yml --tags ht801_provision
ansible-playbook playbooks/full-setup.yml --tags verify
```
## Technical Implementation Features

### F501: Error Recovery
**Description**: Graceful handling of system faults
**Scenarios**:
- Audio file corruption
- HT801 registration failure
**Technical**: Asterisk error handling and automatic recovery
**Implementation**:
- Disk space monitoring and cleanup
- Asterisk service restart on failure

### F502: Logging and Diagnostics
**Description**: Troubleshooting and maintenance support
**Logs**:
- Asterisk call detail records
- System boot and error logs
- Audio playback statistics
**Technical**: Standard Linux logging with Asterisk CDR

### F109: Enhanced Dialplan Features ✅
**Description**: Updates to the dialplan for improved functionality and user experience.
**Status**: Fully implemented and working
**Enhancements**:
- Added support for repeating the last played recording in both main menu and voice memo contexts.
- Improved voice memo handling with options for replaying, re-recording, and deleting recordings.
- Enhanced help prompts for both main menu and voice memo contexts.
- Added safeguards for minimum recording length and deletion confirmation.
**Technical**:
- Dialplan updates in `extensions.conf.j2` to include new contexts and logic.
- Use of Asterisk applications like `Background()`, `Record()`, and `System()` for advanced functionality.