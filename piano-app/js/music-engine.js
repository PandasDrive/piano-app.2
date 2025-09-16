// js/music-engine.js
import EventEmitter from './event-emitter.js';

export default class MusicEngine extends EventEmitter {
    constructor() {
        super();
        this.jzz = null;
        this.midiIn = null;
        this.lessonData = [];
        this.isLessonActive = false;
        this.currentEventTime = -1;
        this.expectedNotes = new Set();
        this._initializeJZZ();
    }

    async _initializeJZZ() {
        if (typeof JZZ === 'undefined') return;
        try {
            this.jzz = await JZZ();
            this.emit('ready');
        } catch (err) {
            console.error('Could not initialize JZZ:', err);
        }
    }

    getMIDIPorts() {
        return this.jzz ? this.jzz.info().inputs : [];
    }

    async connectToMIDI(portName) {
        if (this.midiIn) this.midiIn.close();
        try {
            this.midiIn = await this.jzz.openMidiIn(portName);
            this.midiIn.connect(msg => this._handleMIDIMessage(msg));
            this.emit('midiConnected', `Connected to ${portName}`);
        } catch (err) {
            this.emit('error', `Cannot open MIDI port: ${err}`);
        }
    }

    async loadLesson(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.lessonData = data.notes;
            this.emit('lessonLoaded', data.title);
        } catch (error) {
            console.error('Error loading lesson:', error);
            this.emit('error', 'Failed to load lesson file.');
        }
    }

    startLesson() {
        if (this.lessonData.length === 0) return this.emit('error', 'No lesson loaded.');
        this.isLessonActive = true;
        this.currentEventTime = this.lessonData[0].time;
        this._updateExpectedNotes();
        this.emit('lessonStatusChanged', { active: true, message: 'Lesson started. Play the highlighted notes.' });
    }

    stopLesson() {
        this.isLessonActive = false;
        this.currentEventTime = -1;
        this.expectedNotes.clear();
        this.emit('lessonStatusChanged', { active: false, message: 'Lesson stopped.' });
    }

    _handleMIDIMessage(msg) {
        if (!this.isLessonActive || !msg.isNoteOn()) return;
        const playedMidi = msg.getNote();
        if (this.expectedNotes.has(playedMidi)) {
            this.expectedNotes.delete(playedMidi);
            this.emit('notePlayed', { midi: playedMidi, correct: true });
            if (this.expectedNotes.size === 0) {
                this._advanceToNextEvent();
            }
        } else {
            this.emit('notePlayed', { midi: playedMidi, correct: false });
        }
    }

    _advanceToNextEvent() {
        const nextNoteIndex = this.lessonData.findIndex(note => note.time > this.currentEventTime);
        if (nextNoteIndex === -1) {
            this.isLessonActive = false;
            this.emit('lessonStatusChanged', { active: false, message: 'Congratulations! Lesson complete!' });
        } else {
            this.currentEventTime = this.lessonData[nextNoteIndex].time;
            this._updateExpectedNotes();
        }
    }

    _updateExpectedNotes() {
        this.expectedNotes.clear();
        const currentNotesForEvent = this.lessonData.filter(note => note.time === this.currentEventTime);
        currentNotesForEvent.forEach(note => this.expectedNotes.add(note.midi));
        this.emit('nextNotes', currentNotesForEvent);
    }
}