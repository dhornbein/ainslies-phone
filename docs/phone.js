/**
 * Ainslie Phone Web Interface
 * Simulates the Asterisk dialplan logic in JavaScript
 */

class AinsliePhone {
    constructor() {
        // Phone state
        this.state = 'idle'; // idle, dialtone, main-menu, playing
        this.lastRecordingFile = null;
        this.currentAudio = null;
        this.idleCount = 0;
        this.maxIdleCount = 5;
        this.helpRepeatTimeout = 5000; // 5 seconds
        this.helpTimeoutId = null;
        this.pendingCallbacks = []; // Track pending timeouts/callbacks
        
        // Web Audio API setup
        this.audioContext = null;
        this.currentOscillators = [];
        this.currentGainNode = null;
        
        // Tone frequencies from dialplan
        // TONE_UP=442/500,262/100,330/200,220/2000
        // TONE_DOWN=220/500,330/100,262/200,442/2000
        this.tones = {
            dial: [{ freq: 350, duration: 0 }, { freq: 440, duration: 0 }], // Standard US dial tone
            up: [
                { freq: 442, duration: 500 },
                { freq: 262, duration: 100 },
                { freq: 330, duration: 200 },
                { freq: 220, duration: 2000 }
            ],
            down: [
                { freq: 220, duration: 500 },
                { freq: 330, duration: 100 },
                { freq: 262, duration: 200 },
                { freq: 442, duration: 2000 }
            ]
        };
        
        // DOM elements
        this.pickupBtn = document.getElementById('pickup-btn');
        this.hangupBtn = document.getElementById('hangup-btn');
        this.keypad = document.getElementById('keypad');
        this.activityLog = document.getElementById('activity-log');
        
        // Bind event listeners
        this.pickupBtn.addEventListener('click', () => this.pickup());
        this.hangupBtn.addEventListener('click', () => this.hangup());
        
        // Add keypad listeners
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                const digit = key.getAttribute('data-key');
                this.handleDigit(digit);
            });
        });
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (this.state === 'idle') return;
            
            const keyMap = {
                '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
                '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                '*': '*', '#': '#'
            };
            
            if (keyMap[e.key]) {
                this.handleDigit(keyMap[e.key]);
            }
        });
        
        this.log('System ready. Pick up the phone to begin.', 'system');
    }
    
    ensureAudioContext() {
        // Initialize Web Audio Context on demand
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Web Audio Context initialized');
            } catch (e) {
                console.error('Failed to initialize Web Audio Context:', e);
            }
        }
        return this.audioContext !== null;
    }
    
    clearAllPendingCallbacks() {
        // Clear all pending timeouts to prevent race conditions
        this.pendingCallbacks.forEach(id => clearTimeout(id));
        this.pendingCallbacks = [];
        this.clearHelpTimeout();
    }
    
    addPendingCallback(timeoutId) {
        this.pendingCallbacks.push(timeoutId);
    }
    
    pickup() {
        this.log('Phone picked up', 'system');
        this.clearAllPendingCallbacks();
        
        // Initialize audio context on first interaction
        this.ensureAudioContext();
        
        this.state = 'dialtone';
        this.pickupBtn.style.display = 'none';
        this.hangupBtn.style.display = 'block';
        this.keypad.classList.remove('disabled');
        
        // Play pickup sound effect
        this.playPickupSound();
        
        // Small delay before dial tone to let pickup sound play
        const timeoutId = setTimeout(() => {
            // Play dial tone
            this.playTone('dial', 2000, () => {
                // Play tone up
                this.playTone('up', 2000, () => {
                    // Go to help
                    this.playHelp();
                });
            });
        }, 150);
        this.addPendingCallback(timeoutId);
    }
    
    hangup() {
        this.log('Phone hung up', 'system');
        this.playHangupSound();
        this.stopAudio();
        this.stopAllTones();
        this.clearAllPendingCallbacks();
        this.state = 'idle';
        this.lastRecordingFile = null;
        this.pickupBtn.style.display = 'block';
        this.hangupBtn.style.display = 'none';
        this.keypad.classList.add('disabled');
    }
    
    handleDigit(digit) {
        if (this.state === 'idle') return;
        
        this.log(`Button pressed: ${digit}`, 'button');
        
        // IMPORTANT: Stop everything immediately for instant response
        this.stopAudio();
        this.stopAllTones();
        this.clearAllPendingCallbacks();
        this.resetIdleCount();
        
        switch (this.state) {
            case 'dialtone':
            case 'main-menu':
            case 'playing':
                this.handleMainMenuDigit(digit);
                break;
        }
    }
    
    handleMainMenuDigit(digit) {
        if (digit >= '1' && digit <= '9') {
            // Play Ainslie's recording
            this.playRecording(digit);
        } else if (digit === '0') {
            // Play help
            this.playHelp();
        } else if (digit === '*') {
            // Repeat last recording
            this.repeatLast();
        } else if (digit === '#') {
            // Voice memo mode - not implemented in MVP
            this.log('Voice memo feature not available in this version', 'system');
            this.state = 'main-menu';
            this.scheduleHelpRepeat();
        }
    }
    
    playRecording(digit) {
        this.log(`Playing Ainslie's recording #${digit}`, 'audio');
        this.state = 'playing';
        this.lastRecordingFile = digit;
        
        const audioPath = `media/${digit}.mp3`;
        this.playAudio(audioPath, `Recording ${digit}`, () => {
            // After recording finishes, play tone down and wait
            this.playTone('down', 1200, () => {
                this.state = 'main-menu';
                this.scheduleHelpRepeat();
            });
        });
    }
    
    repeatLast() {
        if (!this.lastRecordingFile) {
            this.log('No recording to repeat', 'system');
            this.state = 'main-menu';
            this.scheduleHelpRepeat();
            return;
        }
        
        this.log(`Repeating recording #${this.lastRecordingFile}`, 'audio');
        this.state = 'playing';
        
        const audioPath = `media/${this.lastRecordingFile}.mp3`;
        this.playAudio(audioPath, `Recording ${this.lastRecordingFile}`, () => {
            this.playTone('down', 1200, () => {
                this.state = 'main-menu';
                this.scheduleHelpRepeat();
            });
        });
    }
    
    playHelp() {
        this.log('Playing help message', 'system');
        this.state = 'main-menu';
        
        const helpText = `Welcome to the Ainslie Phone. Press digits 1 through 9 to hear different recordings from Ainslie. Press 0 to hear this help message again. Press star (*) to repeat the last recording you heard.`;
        
        this.log(helpText, 'system');
        
        const audioPath = 'media/prompts/help_main_menu.mp3';
        this.playAudio(audioPath, 'Help Message', () => {
            this.scheduleHelpRepeat();
        });
    }
    
    scheduleHelpRepeat() {
        this.clearHelpTimeout();
        this.helpTimeoutId = setTimeout(() => {
            this.incrementIdleCount();
            this.playHelp();
        }, this.helpRepeatTimeout);
        // Don't add to pendingCallbacks - help timeout should persist until explicitly cleared
    }
    
    clearHelpTimeout() {
        if (this.helpTimeoutId) {
            clearTimeout(this.helpTimeoutId);
            this.helpTimeoutId = null;
        }
    }
    
    incrementIdleCount() {
        this.idleCount++;
        if (this.idleCount >= this.maxIdleCount) {
            this.log('Entering idle mode', 'system');
            // In full version, would play random recordings
        }
    }
    
    resetIdleCount() {
        this.idleCount = 0;
    }
    
    playAudio(src, label, onEnded) {
        this.stopAudio();
        
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.autoplay = true;
        audioElement.preload = 'auto';
        
        // Try MP3 first, fallback to OGG
        const source1 = document.createElement('source');
        source1.src = src;
        source1.type = 'audio/mpeg';
        audioElement.appendChild(source1);
        
        const source2 = document.createElement('source');
        source2.src = src.replace('.mp3', '.ogg');
        source2.type = 'audio/ogg';
        audioElement.appendChild(source2);
        
        // Handle successful playback end
        audioElement.addEventListener('ended', () => {
            if (onEnded) onEnded();
        });
        
        // Handle loading errors
        audioElement.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.log(`Error loading audio: ${src}`, 'system');
            if (onEnded) onEnded();
        });
        
        // Store reference
        this.currentAudio = audioElement;
        
        // Add to log with audio player
        this.addAudioToLog(label, audioElement);
    }
    
    addAudioToLog(label, audioElement) {
        const entry = document.createElement('div');
        entry.className = 'log-entry audio';
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        entry.appendChild(timestamp);
        
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action';
        actionDiv.textContent = label;
        entry.appendChild(actionDiv);
        
        entry.appendChild(audioElement);
        
        this.activityLog.insertBefore(entry, this.activityLog.firstChild);
        
        // Keep only last 50 entries
        while (this.activityLog.children.length > 50) {
            this.activityLog.removeChild(this.activityLog.lastChild);
        }
    }
    
    playTone(type, duration, callback) {
        if (!this.ensureAudioContext()) {
            console.warn('AudioContext not initialized, using silent tone');
            const timeoutId = setTimeout(() => {
                if (callback) callback();
            }, duration);
            this.addPendingCallback(timeoutId);
            return;
        }
        
        let description = '';
        let toneSequence = [];
        
        switch (type) {
            case 'dial':
                description = 'Playing dial tone';
                toneSequence = this.tones.dial;
                break;
            case 'up':
                description = 'Playing ascending tone';
                toneSequence = this.tones.up;
                break;
            case 'down':
                description = 'Playing descending tone';
                toneSequence = this.tones.down;
                break;
        }
        
        this.log(description, 'system');
        this.stopAllTones();
        
        // For dial tone (continuous), play both frequencies simultaneously
        if (type === 'dial') {
            this.playDualTone(350, 440, duration);
            const timeoutId = setTimeout(() => {
                this.stopAllTones();
                if (callback) callback();
            }, duration);
            this.addPendingCallback(timeoutId);
        } else {
            // For sequential tones (up/down), play one after another
            this.playToneSequence(toneSequence, 0, callback);
        }
    }
    
    playDualTone(freq1, freq2, duration) {
        try {
            const now = this.audioContext.currentTime;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.connect(this.audioContext.destination);
            
            const osc1 = this.audioContext.createOscillator();
            osc1.frequency.setValueAtTime(freq1, now);
            osc1.type = 'sine';
            osc1.connect(gainNode);
            osc1.start(now);
            
            const osc2 = this.audioContext.createOscillator();
            osc2.frequency.setValueAtTime(freq2, now);
            osc2.type = 'sine';
            osc2.connect(gainNode);
            osc2.start(now);
            
            this.currentOscillators.push(osc1, osc2);
            this.currentGainNode = gainNode;
        } catch (e) {
            console.error('Error playing dual tone:', e);
        }
    }
    
    playToneSequence(sequence, index, callback) {
        if (index >= sequence.length) {
            if (callback) callback();
            return;
        }
        
        try {
            const tone = sequence[index];
            const now = this.audioContext.currentTime;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.connect(this.audioContext.destination);
            
            const osc = this.audioContext.createOscillator();
            osc.frequency.setValueAtTime(tone.freq, now);
            osc.type = 'sine';
            osc.connect(gainNode);
            osc.start(now);
            
            this.currentOscillators.push(osc);
            if (this.currentGainNode) {
                this.currentGainNode = gainNode;
            } else {
                this.currentGainNode = gainNode;
            }
            
            const timeoutId = setTimeout(() => {
                try {
                    osc.stop();
                    osc.disconnect();
                    gainNode.disconnect();
                } catch (e) {
                    // Already stopped
                }
                this.playToneSequence(sequence, index + 1, callback);
            }, tone.duration);
            this.addPendingCallback(timeoutId);
        } catch (e) {
            console.error('Error in tone sequence:', e);
            if (callback) callback();
        }
    }
    
    stopAllTones() {
        // Stop all active oscillators
        this.currentOscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // Already stopped
            }
        });
        this.currentOscillators = [];
        
        if (this.currentGainNode) {
            try {
                this.currentGainNode.disconnect();
            } catch (e) {
                // Already disconnected
            }
            this.currentGainNode = null;
        }
    }
    
    playPickupSound() {
        if (!this.ensureAudioContext()) {
            console.warn('Audio context not available for pickup sound');
            return;
        }
        
        try {
            // Create a short "click" sound for pickup
            const now = this.audioContext.currentTime;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            gainNode.connect(this.audioContext.destination);
            
            const osc = this.audioContext.createOscillator();
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
            osc.type = 'sine';
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            console.error('Error playing pickup sound:', e);
        }
    }
    
    playHangupSound() {
        if (!this.ensureAudioContext()) {
            console.warn('Audio context not available for hangup sound');
            return;
        }
        
        try {
            // Create a short "clunk" sound for hangup
            const now = this.audioContext.currentTime;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            gainNode.connect(this.audioContext.destination);
            
            const osc = this.audioContext.createOscillator();
            osc.frequency.setValueAtTime(250, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
            osc.type = 'sine';
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.18);
        } catch (e) {
            console.error('Error playing hangup sound:', e);
        }
    }
    
    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            // Setting to null will allow garbage collection to clean up listeners
            this.currentAudio = null;
        }
    }
    
    log(message, type = 'system') {
        const entry = this.createLogEntry(type, '', message);
        this.activityLog.insertBefore(entry, this.activityLog.firstChild);
        
        // Keep only last 50 entries
        while (this.activityLog.children.length > 50) {
            this.activityLog.removeChild(this.activityLog.lastChild);
        }
    }
    
    createLogEntry(type, action, message, audioElement = null) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        entry.appendChild(timestamp);
        
        if (action) {
            const actionDiv = document.createElement('div');
            actionDiv.className = 'action';
            actionDiv.textContent = action;
            entry.appendChild(actionDiv);
        }
        
        if (message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = message;
            entry.appendChild(messageDiv);
        }
        
        if (audioElement) {
            entry.appendChild(audioElement);
        }
        
        // Only insert if this method is being used (not for audio)
        // Audio uses addAudioToLog instead
        if (!audioElement) {
            this.activityLog.insertBefore(entry, this.activityLog.firstChild);
        }
        
        return entry;
    }
}

// Initialize phone when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.phone = new AinsliePhone();
});
