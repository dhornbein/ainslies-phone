# Ainslie Phone Features

## Outstanding Features

### F602: Ansible Automated Deployment ☑
**Description**: One-command deployment and updates via Ansible playbooks
**Status**: Partially implemented - Core deployment working, HT801 automation not functional
**Capabilities**:
- `setup-ssh.yml`: Configure SSH key authentication (working)
- `provision.yml`: Basic system setup and file deployment (working)
- `install-asterisk.yml`: Professional Asterisk installation from source (working)
- `network-setup.yml`: NetworkManager static IP configuration (working)
- `update.yml`: Deploy Asterisk config changes with targeted reloads (working)
- `ht801-autoprovision.yml`: HTTP API-based HT801 auto-configuration ❌ (broken)
- `maintenance.yml`: System health checks and repairs (future)
**Technical**: SSH over WiFi connection with ansible-playbook execution

### F605: HT801 Auto-Provisioning ❌
**Description**: Programmatic configuration of HT801 device via HTTP API
**Status**: Not functional - implementation has critical bugs preventing execution
**Next Steps**:
- Research methods to configure the HT801 device programmatically.
- Explore using the device's API or HTTP-based web interface for automation.
- Ensure idempotent and secure configuration logic.
**Issues**:
- Login flow sets `ht801_logged_in` to raw URI object instead of boolean
- References undefined variable `ht801_login_default` causing execution abort
- Password rotation logic is incomplete and not idempotent
- Tasks execute even when authentication fails (401/403 responses)
**Current State**: Manual HT801 setup required via web interface
**Technical**: Attempted RESTful HTTP POST requests to HT801 web interface API
**Workaround**: Use manual configuration following HT801-Setup-Guide.md

## Completed or Removed Features

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

### F003: Audio Playback Engine ✅
**Description**: High-quality audio playback of Ainslie's recordings
**Status**: Fully implemented and working
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

### F101: Help System ✅
**Description**: Automated guidance for gallery visitors
**Status**: voice recording complete and uploaded
**Content**: see spec.md for full script
**Trigger**: Digit `0` or automatic after dial tone
**Technical**: pre-recorded help prompt in `source-audio/prompts/` converted and deployed to `sounds/prompts/`

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

### F109: Idle Timeout ✅
**Description**: Automatic switch context after prolonged inactivity and randomly play a recording
**Behavior**: MAX_IDLE_COUNT measures inactivity and after reaching the limit, switches to idle context and plays random recordings with pauses in between
**Status**: Fully implemented and working

### F110: Ability to delete saved messages ✅
**Description**: When listening to a saved message, press 00 to delete it
**Behavior**: After pressing 00, send to delete confirmation prompt
**Status**: Fully implemented and working

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

### F401: Invite Ringing ✅
**Description**: Gentle periodic ringing to attract gallery visitors
**Status**: Implemented and working but not active, requires a systemd timer to run periodically
**Behavior**:
- Configurable timing and frequency
- Short, non-intrusive ring patterns
- Easily enabled/disabled
**Technical**: Asterisk automatic call generation to phone

### F402: Message Recording ✅
**Description**: Allow visitors to leave messages about Ainslie
**Status**: Implemented
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

### F503: Replace off hook beeping with something more pleasant
**Description**: Replace default HT801 off-hook beep with custom sound

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

## Documentation Features

### F801: Case Study and Technical Blog Post
**Description**: Create a detailed case study and technical blog post about the Ainslie Phone project.
**Status**: Planned, chosen photos ready for editing
**Goals**:
- Highlight the project's technical challenges and solutions.
- Document the design and implementation process.
**Deliverables**:
- A comprehensive case study document.
- A blog post suitable for publication on technical platforms.
**Technical**: Include diagrams, code snippets, and metrics where applicable.

### F802: Online website for the Ainslie Phone
**Description**: Develop a dedicated website to showcase the Ainslie Phone project.
**Status**: MVP implemented
**Goals**:
- responsive website contained in /docs/ folder of the repo ✅
- Interactive phone with clickable buttons to simulate the experience ✅
- A log for button presses, instructional text, and media playback ✅
**Deliverables**:
- A fully functional website hosted via GitHub Pages. ✅
**Technical**: HTML, CSS, JavaScript for interactivity and media handling. As few dependencies as possible while having solid reactivity and usability. Update convert_audio.sh to add web-optimized audio files (ogg/mp3) to the /docs/media/ folder. ✅
**Implementation**:

There is a photo of a phone in a white void. A bouncing "pick up the phone" text invites the user to click the headset to start the experience. Once clicked, we shift closer to the keypad and the headset is off the hook, out of focus along the edge of the screen. The user clicks numbers and moves through the same menu structure as the physical phone, with audio playback and text instructions.

**MVP Complete**: Basic functionality with main menu, keypad, audio playback, and activity log implemented.

### F803: Voice Memo Web Interface
**Description**: Add voice memo functionality to the web interface to match the physical phone experience.
**Status**: Planned
**Goals**:
- Implement 3-digit code entry (111-999) for voice memo access
- Playback existing voice memos
- Display appropriate prompts and instructions
- Match the state machine behavior from the Asterisk dialplan
**Technical**: Extend the JavaScript state machine to handle memo contexts (top-memo, play-memo, no-memo)
**Note**: Recording new memos is not feasible in web interface without backend server