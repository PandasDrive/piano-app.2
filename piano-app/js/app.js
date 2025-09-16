// js/app.js
import MusicEngine from './music-engine.js';
import UIManager from './ui-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    const musicEngine = new MusicEngine();
    const uiManager = new UIManager();

    const connectBtn = document.getElementById('connect-btn');
    const startBtn = document.getElementById('start-lesson-btn');
    const stopBtn = document.getElementById('stop-lesson-btn');
    const midiPortsSelect = document.getElementById('midi-ports-select');
    const lessonSelect = document.getElementById('lesson-select');

    async function populateLessonsDropdown() {
        try {
            // Assuming you have a lessons.json file to list your lessons
            const response = await fetch('./assets/lessons.json'); 
            const lessons = await response.json();
            lessonSelect.innerHTML = '<option value="">Select a lesson</option>';
            lessons.forEach(lesson => {
                const option = document.createElement('option');
                option.value = lesson.path;
                option.textContent = lesson.title;
                lessonSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load lessons.json. Manually adding test lesson.');
            // Fallback for testing without a lessons.json file
            const option = document.createElement('option');
            option.value = './assets/lessons/autumn-voyage-v2.json';
            option.textContent = 'Autumn Voyage (Test)';
            lessonSelect.appendChild(option);
        }
    }

    musicEngine.on('ready', () => {
        uiManager.updateStatus('Please select a MIDI device and connect.');
        const ports = musicEngine.getMIDIPorts();
        midiPortsSelect.innerHTML = '';
        if (ports.length > 0) {
            ports.forEach(port => {
                const option = document.createElement('option');
                option.value = port.name;
                option.textContent = port.name;
                midiPortsSelect.appendChild(option);
            });
        } else {
            midiPortsSelect.innerHTML = '<option>No MIDI Devices Found</option>';
        }
    });

    musicEngine.on('midiConnected', message => uiManager.updateStatus(message));
    musicEngine.on('lessonLoaded', title => {
        uiManager.updateLessonTitle(title);
        musicEngine.startLesson();
    });
    musicEngine.on('lessonStatusChanged', status => {
        uiManager.updateStatus(status.message);
        if (!status.active) uiManager.highlightNextNotes([]);
    });
    musicEngine.on('nextNotes', notes => uiManager.highlightNextNotes(notes));
    musicEngine.on('notePlayed', noteInfo => uiManager.updatePlayedNote(noteInfo.midi, noteInfo.correct));
    musicEngine.on('error', errorMessage => uiManager.updateStatus(`Error: ${errorMessage}`));

    connectBtn.addEventListener('click', () => {
        const selectedPort = midiPortsSelect.value;
        if (selectedPort) musicEngine.connectToMIDI(selectedPort);
    });

    startBtn.addEventListener('click', () => {
        const selectedLessonPath = lessonSelect.value;
        if (selectedLessonPath) {
            musicEngine.loadLesson(selectedLessonPath);
        } else {
            uiManager.updateStatus('Please select a lesson first.');
        }
    });

    stopBtn.addEventListener('click', () => musicEngine.stopLesson());

    populateLessonsDropdown();
});