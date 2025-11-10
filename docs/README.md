# Ainslie Phone Web Interface

This is an interactive web simulation of the Ainslie Phone memorial installation.

## Features

- Interactive phone keypad with instant response
- Real telephone tones generated using Web Audio API
- Audio playback of Ainslie's recordings
- Activity log showing all interactions
- Help system
- Repeat functionality
- Sound effects for picking up and hanging up

## Usage

Visit the website and click "Pick Up Phone" to begin the experience. Use the keypad or your keyboard to interact:

- **1-9**: Play Ainslie's recordings
- **0**: Hear help message
- **\***: Repeat last recording
- **#**: (Voice memo - not yet implemented)

## Key Features

### Instant Response
Key presses immediately interrupt any currently playing audio or tones, providing a snappy, responsive experience that matches the physical phone.

### Authentic Tones
- **Dial Tone**: Dual frequency 350Hz + 440Hz (standard US dial tone)
- **Ascending Tone**: 442Hz → 262Hz → 330Hz → 220Hz
- **Descending Tone**: 220Hz → 330Hz → 262Hz → 442Hz
- **Pickup/Hangup**: Frequency sweep effects

All tone frequencies match the Asterisk dialplan configuration from the physical installation.

## Audio Files

Audio files are organized in the `/media` directory:
- `1.mp3` through `9.mp3`: Ainslie's recordings
- `prompts/help_main_menu.mp3`: Help message
- Both MP3 and OGG formats provided for browser compatibility

## Generating Audio

To generate the web-optimized audio files from source audio:

```bash
cd source-audio
./convert_audio.sh
```

This will create both Asterisk-compatible WAV files and web-optimized MP3/OGG files.

## Browser Compatibility

- Modern browsers with Web Audio API support (Chrome, Firefox, Safari, Edge)
- Fallback to silent tones if Web Audio API not available
- Multiple audio formats (MP3/OGG) for maximum compatibility

## Development

The website is built with vanilla HTML, CSS, and JavaScript with no external dependencies for maximum compatibility and ease of maintenance.

Files:
- `index.html`: Main page structure with semantic HTML and ARIA labels
- `style.css`: Responsive styling and animations
- `phone.js`: Phone state machine, Web Audio API tone generation, and interaction logic
- `IMPLEMENTATION_NOTES.md`: Technical details and recent changes

## Architecture

The phone operates as a state machine with these states:
- **idle**: Phone on hook, waiting for pickup
- **dialtone**: Playing dial tone sequence
- **main-menu**: Ready for digit input
- **playing**: Currently playing a recording

All transitions are interruptible - pressing any key immediately stops current audio/tones and begins the new action.

