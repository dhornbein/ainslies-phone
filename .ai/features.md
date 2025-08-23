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
**Technical**: File-based playback from organized directory structure

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
- DTMF interrupts current audio
- New selection starts immediately
- No buffering or wait states
**Technical**: Asterisk immediate DTMF processing

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

### F601: Local Git Version Control
**Description**: Track all project changes in local git repository
**Benefits**:
- Complete change history without external dependencies
- Branch management for experimental features
- Easy rollback to previous working states
- Commit-based deployment tracking
**Technical**: Local git repository on desktop development environment

### F602: Ansible Automated Deployment
**Description**: One-command deployment and updates via Ansible playbooks
**Capabilities**:
- `provision.yml`: Full system setup from fresh Pi
- `update.yml`: Deploy code/config changes
- `deploy-audio.yml`: Update audio content only
- `maintenance.yml`: System health checks and repairs
**Technical**: SSH over WiFi connection with ansible-playbook execution

### F604: Remote Configuration Management
**Description**: Update system parameters without physical access
**Configurable Elements**:
- Asterisk dialplan modifications
- Audio file organization and content
- Network settings and IP assignments
- System service parameters
**Technical**: Ansible template-based configuration deployment

### F607: Local Git Deployment Source
**Description**: Pi pulls updates directly from desktop git repository
**Implementation**:
- Desktop git repository as deployment source
- Ansible copies/syncs specific files to Pi
- No external git hosting required
- Local network git access via SSH
**Technical**: Git archive or rsync-based file transfer in Ansible

### F608: One-Command Updates
**Description**: Single command deploys all changes to Pi
**Usage**:
```bash
# Deploy everything
ansible-playbook -i inventory/hosts.yml playbooks/update.yml

# Deploy only audio content
ansible-playbook -i inventory/hosts.yml playbooks/deploy-audio.yml --tags audio

# Full system provision
ansible-playbook -i inventory/hosts.yml playbooks/provision.yml
```
**Technical**: Ansible playbook with tags for selective deployment

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