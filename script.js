let mediaRecorder;
let audioChunks = [];
let speaking = false;

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);

                const audio = new Audio(url);
                audio.controls = true;
                document.getElementById('speechArea').appendChild(audio);
            };

            mediaRecorder.start();
            document.getElementById('recordButton').disabled = true;
            document.getElementById('stopRecordButton').disabled = false;
        })
        .catch((error) => {
            console.error('Error accessing microphone:', error);
        });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('recordButton').disabled = false;
        document.getElementById('stopRecordButton').disabled = true;
    }
}

function speakText() {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = document.getElementById('inputText').value;

    const selectedVoice = document.getElementById('voiceSelect').options[document.getElementById('voiceSelect').selectedIndex].value;
    utterance.voice = speechSynthesis.getVoices().find((voice) => voice.name === selectedVoice);

    const selectedLang = document.getElementById('languageSelect').options[document.getElementById('languageSelect').selectedIndex].value;
    utterance.lang = selectedLang;

    document.getElementById('downloadButton').disabled = false;

    speechSynthesis.speak(utterance);
    speaking = true;
    updateButtons();
}

function stopSpeech() {
    speechSynthesis.cancel();
    speaking = false;
    updateButtons();
}

function toggleMute() {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
    } else {
        speechSynthesis.resume();
    }
    updateButtons();
}

function updateButtons() {
    document.getElementById('speakButton').disabled = speaking;
    document.getElementById('stopButton').disabled = !speaking;
    document.getElementById('downloadButton').disabled = speaking;
    document.getElementById('recordButton').disabled = speaking;
    document.getElementById('stopRecordButton').disabled = speaking;
}

// Function to populate voice and language options
function populateVoiceList() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    const languageSelect = document.getElementById('languageSelect');

    // Clear previous options
    voiceSelect.innerHTML = '';
    languageSelect.innerHTML = '';

    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;

        // Add voice option to the select element
        voiceSelect.appendChild(option);

        // Add language option to the select element
        if (!languageSelect.querySelector(`[value="${voice.lang}"]`)) {
            const langOption = document.createElement('option');
            langOption.value = voice.lang;
            langOption.textContent = voice.lang;
            languageSelect.appendChild(langOption);
        }
    });
}

// ... (existing code for text-to-speech and voice recording)


document.getElementById('speakButton').addEventListener('click', speakText);
document.getElementById('stopButton').addEventListener('click', stopSpeech);
document.getElementById('muteCheckbox').addEventListener('change', toggleMute);
document.getElementById('recordButton').addEventListener('click', startRecording);
document.getElementById('stopRecordButton').addEventListener('click', stopRecording);
speechSynthesis.addEventListener('voiceschanged', populateVoiceList);

