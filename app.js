const query = document.querySelector('#query');
const search = document.querySelector('#search');
const resultContainer = document.querySelector('.result-container');
const audio = document.getElementById('audio');

const api = 'https://api.dictionaryapi.dev/api/v2/entries/en/'; 
// Thanks @meetDeveloper for their free dictionary API

search.addEventListener('click', () => fetchDefinitions());
query.addEventListener('keydown', (e) => {
    if (e.key === "Enter") fetchDefinitions();
})

// fetch definitions from API
async function fetchDefinitions() {
    const word = query.value.toLowerCase();
    if (!word) return;

    const loader = displayLoader();

    let result;
    try {
        const response = await fetch(`${api}${word}`);
        if (response.status > 400) throw Error(response.status); 

        const words = await response.json();

        result = getDefinitionCards(words);
    } catch (err) {
        result = getErrorMessage(err);
    } finally {
        resultContainer.innerHTML = result; // display results
        query.value = ""; // clear the input field
        loader.remove(); // remove loader
    }
}

// get definition cards 
const getDefinitionCards = (words) => 
    words.map(wordObj => 
        wordObj.meanings.map(meaning => 
        `<section class="card">
            <section class="word-audio-container">
                <section class="word-container">
                    <h4 class="word">${wordObj.word}</h4>
                    <p class="part-of-speech">${meaning.partOfSpeech}</p>
                </section>
                ${wordObj.phonetics.reduce((result, phonetic) => {
                    if (phonetic.audio && phonetic.text && !result) {
                        result = `<button class="play-audio" data-soundtrack="${phonetic.audio}" onclick="playAudio(this.dataset.soundtrack)"><i class="fa-solid fa-volume-high"></i></button>`;
                    }
                    return result;
                }, '')}
            </section>
            
            <section class="phonetic-container">
                ${wordObj.phonetics.map(phonetic => phonetic.audio && phonetic.text
                    ? `<button data-soundtrack="${phonetic.audio}" class="phonetic" onclick="playAudio(this.dataset.soundtrack)">${phonetic.text} <i class="fa-solid fa-volume-high"></i></button>` : '').join('')}
            </section>

            <section class="definition-container">
                <ol>
                    ${meaning.definitions.map(definitionObj => definitionObj.example
                        ? `<li>
                            <p class="definition">${definitionObj.definition}</p>
                            <p class="example">${definitionObj.example}</p>
                        </li>`
                        : `<li>
                            <p class="definition">${definitionObj.definition}</p>
                        </li>`).join('\n')}
                </ol>
            </section>
        </section>`).join('\n')
        ).join('\n');

// display loader while waiting the response from server
const displayLoader = () => {
    const loaderContainer = document.createElement('section');
    loaderContainer.classList.add('loader-container', 'flex-column');
    loaderContainer.innerHTML = `
        <i class="fa-solid fa-spinner icon"></i>
        <p class="description">Loading...</p>
    `;
    document.body.appendChild(loaderContainer);
    return loaderContainer;
}

const getErrorMessage = (err) => 
    `<section class="error-container flex-column">
        <i class="fa-solid fa-face-frown icon"></i>
        ${Number(err.toString().match(/\d{3}$/)) === 404
            ? `<h4 class="reason">Sorry, I couldn't find it.</h4>
                <p class="suggestion">Please check your spelling or try again later.</p>` 
            : `<h4 class="reason">${err}</h4>
                <p class="suggestion">Please create a new issue on <a href="https://github.com/ThuHtooSan/dictionary-app/issues">GitHub</a>.</p>` }
    </section>`;

// play pronunciation audio files
const playAudio = (url) => {
    audio.setAttribute('src', url);
    audio.play();
}