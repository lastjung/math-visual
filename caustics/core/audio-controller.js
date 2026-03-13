export const BGM_BASE_PATH = '../visualization/assets/music/bgm/';

export const BGM_TRACKS = [
    'Math_01_Minimalist_Sine_Pulse.mp3', 'Math_02_Fractal_Recursive_Ambient.mp3',
    'Math_03_Euclidean_Polyrhythm.mp3', 'Math_04_Cybernetic_Grid_Logic.mp3',
    'Math_05_Infinite_Series_Flow.mp3', 'Math_06_Binary_Symphony.mp3',
    'Math_07_Quantum_Resonance.mp3', 'Math_08_Geometric_Vector_Motion.mp3',
    'Math_09_Fibonacci_Golden_Ratio.mp3', 'Math_10_Bitwise_Glitch_Architecture.mp3',
    'Math_11_Calculus_Flow.mp3', 'Math_12_Neural_Network_Synapse.mp3',
    'Math_13_Retro_8-bit_Math.mp3', 'Math_14_Primality_Test_Beat.mp3',
    'Math_15_Deep_Space_Topology.mp3', 'Math_16_Coordinate_Plane_Ambient.mp3',
    'Math_17_Mathematical_Induction.mp3', 'Math_18_Lo-fi_Coding_Marathon.mp3',
    'Math_19_Abstract_Set_Theory.mp3', 'Math_20_Theorem_Q.E.D..mp3',
    'piano-shorts/Piano_Short_01_Nocturne_Full_HQ.mp3', 'piano-shorts/Piano_Short_02_Moonlight_Full_HQ.mp3',
    'piano-shorts/Piano_Short_03_Claire_Full_HQ.mp3', 'piano-shorts/Piano_Short_04_Liebestraum_Full_HQ.mp3',
    'piano-shorts/Piano_Short_05_Gymnopedie_Full_HQ.mp3', 'piano-shorts/Piano_Short_06_Classical_Sonata_Full_HQ.mp3',
    'piano-shorts/Piano_Short_07_Rach_Grand_Full_HQ.mp3', 'piano-shorts/Piano_Short_08_River_Flows_Full_HQ.mp3',
    'piano-shorts/Piano_Short_09_Hisaishi_Fantasy_Full_HQ.mp3', 'piano-shorts/Piano_Short_10_Jazz_Mood_Full_HQ.mp3',
    'piano-shorts/Piano_Short_11_Ragtime_Fun_Full_HQ.mp3', 'piano-shorts/Piano_Short_12_Minimal_Cycle_Full_HQ.mp3',
    'piano-shorts/Piano_Short_13_Cinematic_Tear_Full_HQ.mp3', 'piano-shorts/Piano_Short_14_Pop_Vibe_Full_HQ.mp3',
    'piano-shorts/Piano_Short_15_Mystery_Night_Full_HQ.mp3', 'piano-shorts/Piano_Short_16_Morning_Dew_Full_HQ.mp3',
    'piano-shorts/Piano_Short_17_Rainy_Window_Full_HQ.mp3', 'piano-shorts/Piano_Short_18_Soulful_Touch_Full_HQ.mp3',
    'piano-shorts/Piano_Short_19_Wedding_Grace_Full_HQ.mp3', 'piano-shorts/Piano_Short_20_Grand_Power_Full_HQ.mp3'
];

export function initAudio(app) {
    if (!window.audioManager) return;

    window.audioManager.audio.onended = () => nextBGM(app);
    nextBGM(app, false);
}

export function nextBGM(app, autoPlay = true) {
    if (!window.audioManager) return;

    const randomTrack = BGM_TRACKS[Math.floor(Math.random() * BGM_TRACKS.length)];
    app.currentTrackName = randomTrack.split('/').pop().replace('.mp3', '').replace(/_/g, ' ');

    const url = BGM_BASE_PATH + randomTrack;
    if (autoPlay) {
        window.audioManager.play(url, { forceSwitch: true });
    } else {
        window.audioManager.currentTrack = url;
        window.audioManager.audio.src = url;
    }
}

export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
