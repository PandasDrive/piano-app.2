export default class UIManager {
    constructor() {
        this.pianoKeysContainer = document.getElementById('piano-keys');
        this.statusMessageEl = document.getElementById('status-message');
        this.lessonTitleEl = document.getElementById('lesson-title');
        this.nextKeys = new Set();
        this.createKeyboard();
    }

    createKeyboard() {
        this.pianoKeysContainer.innerHTML = '';
        const keyMap = [
            { midi: 21, note: 'A', octave: 0, type: 'white' }, { midi: 22, note: 'A#', octave: 0, type: 'black' }, { midi: 23, note: 'B', octave: 0, type: 'white' },
            ...Array.from({ length: 7 }, (_, octave) => [
                { midi: 24 + octave * 12, note: 'C', octave: octave + 1, type: 'white' }, { midi: 25 + octave * 12, note: 'C#', octave: octave + 1, type: 'black' },
                { midi: 26 + octave * 12, note: 'D', octave: octave + 1, type: 'white' }, { midi: 27 + octave * 12, note: 'D#', octave: octave + 1, type: 'black' },
                { midi: 28 + octave * 12, note: 'E', octave: octave + 1, type: 'white' }, { midi: 29 + octave * 12, note: 'F', octave: octave + 1, type: 'white' },
                { midi: 30 + octave * 12, note: 'F#', octave: octave + 1, type: 'black' }, { midi: 31 + octave * 12, note: 'G', octave: octave + 1, type: 'white' },
                { midi: 32 + octave * 12, note: 'G#', octave: octave + 1, type: 'black' }, { midi: 33 + octave * 12, note: 'A', octave: octave + 1, type: 'white' },
                { midi: 34 + octave * 12, note: 'A#', octave: octave + 1, type: 'black' }, { midi: 35 + octave * 12, note: 'B', octave: octave + 1, type: 'white' },
            ]).flat(),
            { midi: 108, note: 'C', octave: 8, type: 'white' }
        ];

        let whiteKeyOffset = 0;
        keyMap.forEach(keyInfo => {
            const keyElement = document.createElement('div');
            keyElement.className = `key ${keyInfo.type}-key`;
            keyElement.id = `key-${keyInfo.midi}`;
            if (keyInfo.type === 'white') {
                keyElement.style.left = `${whiteKeyOffset}px`;
                whiteKeyOffset += 40;
            } else {
                keyElement.style.left = `${whiteKeyOffset - 12}px`;
            }
            if (keyInfo.note === 'C') {
                const label = document.createElement('span');
                label.className = 'key-label';
                label.textContent = `C${keyInfo.octave}`;
                keyElement.appendChild(label);
            }
            this.pianoKeysContainer.appendChild(keyElement);
        });
    }

    updateStatus(message) {
        this.statusMessageEl.textContent = message;
    }

    updateLessonTitle(title) {
        this.lessonTitleEl.textContent = title;
    }

    highlightNextNotes(notesToHighlight) {
        this.nextKeys.forEach(midi => {
            const keyEl = document.getElementById(`key-${midi}`);
            if (keyEl) keyEl.classList.remove('key-next');
        });
        this.nextKeys.clear();

        notesToHighlight.forEach(note => {
            const keyEl = document.getElementById(`key-${note.midi}`);
            if (keyEl) {
                keyEl.classList.add('key-next');
                this.nextKeys.add(note.midi);
            }
        });
    }

    updatePlayedNote(midi, isCorrect) {
        const keyEl = document.getElementById(`key-${midi}`);
        if (!keyEl) return;
        const flashClass = isCorrect ? 'key-correct' : 'key-incorrect';
        keyEl.classList.add(flashClass);
        if (isCorrect && this.nextKeys.has(midi)) {
            keyEl.classList.remove('key-next');
            this.nextKeys.delete(midi);
        }
        setTimeout(() => {
            keyEl.classList.remove(flashClass);
        }, 300);
    }
}