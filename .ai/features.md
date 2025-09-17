 # Ainslie Phone Features

## Primary Features

### F001: Phone Pickup Detection
**Description**: System detects when visitor lifts handset from cradle
**Behavior**: 
- Immediate off-hook event triggers dial tone
- 5-second dial tone duration (interruptible)
- Transitions to help prompt after dial tone
**Technical**: Asterisk detects FXS port off-hook state via HT801

### F002: Keypad Navigation System
**Description**: DTMF tone processing for interactive navigation
**Supported Keys**:
- `1-9`: Direct access to numbered recordings
- `0`: Help/instruction replay
- `*`: Repeat last played recording or current recording from start
- `#`: Random recording selection
**Technical**: RFC2833 DTMF method with immediate response

### F003: Audio Playback Engine
**Description**: High-quality audio playback of Ainslie's recordings
**Capabilities**:
- Multiple format support (WAV mono preferred)
- Real-time transcoding via Asterisk
- Consistent volume normalization
- Variable length recording support
- DTMF-interruptible playback via Background() app
**Technical**: File-based playback from organized directory structure
**Status**: ✅ **CORE IMPLEMENTED** - Background app enables interruption, ready for content

### F004: Recording Organization System
**Description**: Logical file structure for easy content management
**Structure**:
- Digit-based folders (1-9) for categorized recordings
- Multiple recordings per digit supported
- Random selection within digit categories
- Centralized prompts directory
**Technical**: `/var/lib/asterisk/sounds/ainslie/` base directory

### F005: Hangup Detection & Cleanup
**Description**: Immediate response to handset replacement
**Behavior**:
- Instant playback termination
- State reset to idle
- Clean session termination
**Technical**: On-hook event handling with immediate audio stop

## Interactive Features

### F101: Help System
**Description**: Automated guidance for gallery visitors
**Content**: Robot voice explaining navigation options
**Trigger**: Digit `0` or automatic after dial tone
**Technical**: TTS-generated or pre-recorded help prompt

### F102: Repeat Functionality
**Description**: Replay capability for current/last recording
**Behavior**: 
- Star key (`*`) triggers repeat from beginning
- Maintains state of last played recording
- Works across digit categories
**Technical**: Session state management in Asterisk dialplan

### F103: Random Selection
**Description**: Surprise discovery of recordings
**Modes**:
- Within-digit random (multiple files in same numbered folder)
- Global random (hash key `#` across all 1-9 folders)
**Technical**: Random file selection algorithm

### F104: Immediate Response
**Description**: Real-time interaction without delays
**Behavior**:
- DTMF interrupts current audio immediately
- New selection starts immediately  
- No buffering or wait states
- Background app enables instant keypress response
**Technical**: Asterisk Background() app with immediate DTMF processing
**Status**: ✅ **IMPLEMENTED** - Background applications replace Playback for instant interruption

### F105: Text-to-Speech Integration
**Description**: Dynamic audio generation for prompts and content
**Capabilities**:
- Festival TTS engine integration
- Real-time voice synthesis for help prompts
- Potential for dynamic content generation
- Consistent robotic voice for system messages
**Technical**: Festival daemon with Asterisk Festival() application
**Status**: 🔄 **PLANNED** - Framework designed, installation not deployed

## System Features

### F201: Offline Operation
**Description**: Complete functionality without internet connectivity
**Benefits**:
- Gallery installation reliability
- No external dependencies
- Privacy and security
**Technical**: Direct Pi-to-HT801 connection with static IPs

### F202: Boot Sequence Management
**Description**: Automatic system initialization
**Process**:
- Raspberry Pi boot (~60 seconds)
- Asterisk service startup
- HT801 SIP registration
- Ready state indication
**Technical**: systemd service management

### F203: Content Update System
**Description**: Simple method for adding/changing recordings
**Process**:
- File system access to audio directories
- Drop-in replacement of audio files
- Asterisk restart for recognition
- No database or complex procedures
**Technical**: Direct file system operations

### F204: Static Network Configuration
**Description**: Reliable networking without DHCP dependencies
**Configuration**:
- Pi: 192.168.50.10/24
- HT801: 192.168.50.20/24
- No gateway or DNS required
**Technical**: /etc/dhcpcd.conf static assignment

## Memorial-Specific Features

### F301: Ainslie Recording Preservation
**Description**: Digital preservation of Ainslie's voice recordings
**Format**: Professional audio quality with phone-bandwidth simulation
**Organization**: Thematic or chronological categorization by digit
**Technical**: WAV format at 8kHz or 16kHz mono

### F302: Visitor Interaction Tracking
**Description**: Understanding of gallery engagement (future feature)
**Metrics**: Pickup frequency, recording preferences, session duration
**Privacy**: No personal data collection
**Technical**: Log analysis capabilities (not implemented initially)

### F303: Memorial Ambiance
**Description**: Authentic telephone experience honoring Ainslie
**Elements**:
- Classic red phone aesthetics
- Traditional dial tone and audio quality
- Respectful interaction design
**Technical**: Audio processing to simulate vintage phone characteristics

## Optional/Future Features

### F401: Invite Ringing
**Description**: Gentle periodic ringing to attract gallery visitors
**Behavior**:
- Configurable timing and frequency
- Short, non-intrusive ring patterns
- Easily enabled/disabled
**Technical**: Asterisk automatic call generation to phone

### F402: Message Recording
**Description**: Allow visitors to leave messages about Ainslie
**Functionality**:
- Record after specific key sequence
- Playback capability for other visitors
- Message management and curation
**Technical**: Asterisk record() application with file management

### F403: Multi-Language Prompts
**Description**: Accessibility for diverse gallery audiences
**Languages**: Configurable based on installation location
**Technical**: Multiple prompt directories with language selection

### F404: Remote Monitoring
**Description**: Gallery staff oversight capabilities
**Features**:
- System health monitoring
- Usage statistics
- Remote content updates
**Technical**: SSH access and web interface (security considerations required)

## Deployment & Development Features

### F601: Local Git Version Control ✅ **IMPLEMENTED**
**Description**: Track all project changes in local git repository
**Benefits**:
- Complete change history without external dependencies
- Branch management for experimental features
- Easy rollback to previous working states
- Commit-based deployment tracking
**Technical**: Local git repository on desktop development environment

### F602: Ansible Automated Deployment
**Description**: One-command deployment and updates via Ansible playbooks
**Status**: ✅ **IMPLEMENTED AND TESTED**
**Capabilities**:
- `setup-ssh.yml`: Configure SSH key authentication ✅ **WORKING**
- `provision.yml`: Basic system setup and file deployment ✅ **WORKING**
- `install-asterisk.yml`: Professional Asterisk installation from source ✅ **WORKING**
- `network-setup.yml`: NetworkManager static IP configuration ✅ **WORKING**
- `update.yml`: Deploy Asterisk config changes with targeted reloads ✅ **WORKING**
- `ht801-autoprovision.yml`: HTTP API-based HT801 auto-configuration ✅ **WORKING**
- `full-setup.yml`: Complete end-to-end automation orchestration ✅ **WORKING**
- `deploy-audio.yml`: Update audio content only (future)
- `maintenance.yml`: System health checks and repairs (future)
**Technical**: SSH over WiFi connection with ansible-playbook execution

**Current Installation Results**:
```bash
# Complete automation pipeline implemented:
ansible-playbook playbooks/setup-ssh.yml          # ✅ SSH keys configured
ansible-playbook playbooks/provision.yml          # ✅ Base system ready  
ansible-playbook playbooks/install-asterisk.yml   # ✅ Asterisk 18.26.4 running
ansible-playbook playbooks/network-setup.yml      # ✅ Static IP networking
ansible-playbook playbooks/update.yml             # ✅ Config deployment with targeted reloads
ansible-playbook playbooks/ht801-autoprovision.yml # ✅ HTTP API auto-configuration
ansible-playbook playbooks/full-setup.yml         # ✅ Complete end-to-end setup

# One-command deployment:
ansible-playbook playbooks/full-setup.yml         # 🎉 Everything automated!
```

**Asterisk Installation Features** ✅ **COMPLETED**:
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

### F604: Remote Configuration Management ✅ **IMPLEMENTED**
**Description**: Update system parameters without physical access
**Configurable Elements**:
- Asterisk dialplan modifications via Jinja2 templates ✅ **WORKING**
- Asterisk PJSIP configuration via templates ✅ **WORKING**
- Network settings and IP assignments via NetworkManager ✅ **WORKING**
- System service parameters via Ansible handlers ✅ **WORKING**
- Targeted Asterisk reloads (no full service restarts) ✅ **WORKING**
**Technical**: Ansible template-based configuration deployment with handlers

### F605: HT801 Auto-Provisioning ✅ **IMPLEMENTED**
**Description**: Programmatic configuration of HT801 device via HTTP API
**Capabilities**:
- Automatic device discovery and connectivity testing ✅ **WORKING**
- HTTP API authentication with multiple credential attempts ✅ **WORKING**
- Network configuration (static IP, gateway, DNS) ✅ **WORKING**
- SIP endpoint configuration (server, credentials, codecs) ✅ **WORKING**
- Audio settings optimization (gain, echo cancellation) ✅ **WORKING**
- Security hardening (password changes, access control) ✅ **WORKING**
- Automatic configuration application and device reboot ✅ **WORKING**
**Technical**: RESTful HTTP POST requests to HT801 web interface API
**Benefits**: Eliminates manual SSH tunneling and web interface configuration

### F606: Intelligent Asterisk Management ✅ **IMPLEMENTED**
**Description**: Granular Asterisk configuration management without service disruption
**Features**:
- Targeted PJSIP module reload (preserves active calls) ✅ **WORKING**
- Selective dialplan reload (immediate config updates) ✅ **WORKING**
- Configuration backup with timestamps ✅ **WORKING**
- Handler-based reload triggering (only when needed) ✅ **WORKING**
**Technical**: Asterisk CLI commands via ansible.builtin.command module
**Benefits**: Zero-downtime configuration updates for production systems

### F607: Network Topology Automation ✅ **IMPLEMENTED**
**Description**: Automated network setup for Pi-to-HT801 direct connection
**Configuration**:
- NetworkManager-based static IP assignment ✅ **WORKING**
- Secondary ethernet interface configuration ✅ **WORKING**
- Route management (prevents default route conflicts) ✅ **WORKING**
- Connection profile management (ht801-link) ✅ **WORKING**
**Technical**: nmcli commands via Ansible for reliable network state
**Benefits**: Repeatable, consistent network configuration

### F608: One-Command Updates ✅ **IMPLEMENTED**
**Description**: Single command deploys all changes to Pi
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
- Network disconnection
- HT801 registration failure
**Technical**: Asterisk error handling and automatic recovery

### F502: Logging and Diagnostics
**Description**: Troubleshooting and maintenance support
**Logs**:
- Asterisk call detail records
- System boot and error logs
- Audio playback statistics
**Technical**: Standard Linux logging with Asterisk CDR

### F503: Configuration Management
**Description**: Easy system parameter adjustment
**Parameters**:
- Audio levels and processing
- Timing configurations
- Network settings
**Technical**: Asterisk configuration files and Linux system config