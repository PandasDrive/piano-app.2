// In your main.js or web-piano-teacher.mjs file

// 1. Fetch the JSON data
async function loadScore(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// 2. Render the score with VexFlow
function renderScore(scoreData) {
    const { Renderer, Stave, StaveNote, Formatter, Voice } = Vex.Flow;

    const renderer = new Renderer(document.getElementById('score-container'), Renderer.Backends.SVG);
    renderer.resize(800, 400);
    const context = renderer.getContext();

    // Create staves for each part (e.g., treble and bass for piano)
    const trebleStave = new Stave(10, 40, 400).addClef('treble').addTimeSignature('4/4');
    const bassStave = new Stave(10, 150, 400).addClef('bass').addTimeSignature('4/4');

    trebleStave.setContext(context).draw();
    bassStave.setContext(context).draw();

    // Process notes from your JSON data
    const partP1 = scoreData.parts.P1; // Assuming "P1" is your piano part

    const trebleNotes = partP1.notes
        .filter(note => note.staff === '1')
        .map(note => new StaveNote({
            keys: [note.pitch],
            duration: note.duration,
            clef: 'treble'
        }));

    const bassNotes = partP1.notes
        .filter(note => note.staff === '2')
        .map(note => new StaveNote({
            keys: [note.pitch],
            duration: note.duration,
            clef: 'bass'
        }));

    // Create voices and render notes
    const trebleVoice = new Voice({ num_beats: 4, beat_value: 4 }).addTickables(trebleNotes);
    const bassVoice = new Voice({ num_beats: 4, beat_value: 4 }).addTickables(bassNotes);

    new Formatter().joinVoices([trebleVoice]).format([trebleVoice], 350);
    new Formatter().joinVoices([bassVoice]).format([bassVoice], 350);

    trebleVoice.draw(context, trebleStave);
    bassVoice.draw(context, bassStave);
}

// Main execution
loadScore('path/to/your/music.json')
    .then(renderScore)
    .catch(error => console.error('Failed to load or render score:', error));