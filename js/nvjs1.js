let currentUtterance = null;
        let isReading = false;
        let isPaused = false;
        let currentChapter = null;
        let selectedVoice = null;
        let currentPosition = 0;

        function preloadVoices() {
            return new Promise((resolve) => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length !== 0) {
                    selectedVoice = voices.find(voice => voice.name.includes('Google UK English Female') || voice.name.includes('Microsoft Zira'));
                    resolve();
                } else {
                    window.speechSynthesis.onvoiceschanged = () => {
                        const voices = window.speechSynthesis.getVoices();
                        selectedVoice = voices.find(voice => voice.name.includes('Google UK English Female') || voice.name.includes('Microsoft Zira'));
                        resolve();
                    };
                }
            });
        }

        function showPopup(message) {
            const popup = document.getElementById('popup');
            popup.textContent = message;
            popup.style.display = 'block';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 3000);
        }

        function toggleRead(chapterId) {
            if (isReading) {
                window.speechSynthesis.cancel();
                isReading = false;
                document.getElementById('pauseResumeButton').style.display = 'none';
                return;
            }

            showPopup("Loading voice...");
            preloadVoices().then(() => {
                showPopup("Voice loaded");
                isReading = true;
                isPaused = false;
                currentChapter = chapterId;
                currentPosition = 0;
                document.getElementById('pauseResumeButton').style.display = 'block';
                readNextLine();
            });
        }

        function readNextLine() {
            if (!currentChapter || isPaused) return;

            const chapterElement = document.getElementById(currentChapter);
            const sentences = chapterElement.querySelector('h4').textContent.match(/[^\.!\?]+[\.!\?]+/g);
            if (!sentences || currentPosition >= sentences.length) {
                const nextChapter = document.getElementById(`chapter-${parseInt(currentChapter.split('-')[1]) + 1}`);
                if (nextChapter) {
                    currentChapter = nextChapter.id;
                    currentPosition = 0;
                    readNextLine();
                } else {
                    isReading = false;
                    document.getElementById('pauseResumeButton').style.display = 'none';
                }
                return;
            }

            const line = sentences[currentPosition];
            currentUtterance = new SpeechSynthesisUtterance(line);

            if (selectedVoice) {
                currentUtterance.voice = selectedVoice;
            }

            currentUtterance.onend = () => {
                if (!isPaused) {
                    currentPosition++;
                    if (isReading) {
                        readNextLine();
                    }
                }
            };

            currentUtterance.onerror = () => {
                console.error("Speech synthesis error");
                isReading = false;
                document.getElementById('pauseResumeButton').style.display = 'none';
            };

            window.speechSynthesis.speak(currentUtterance);
        }

        function togglePauseResume() {
            if (isPaused) {
                isPaused = false;
                document.getElementById('pauseResumeButton').textContent = "Pause";
                readNextLine(); // Resume reading
            } else {
                isPaused = true;
                document.getElementById('pauseResumeButton').textContent = "Resume";
                window.speechSynthesis.cancel(); // Pause reading
            }
        }

        preloadVoices();