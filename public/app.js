import { animeInfo, characterInfo, animeList, animeCharacters } from './api.js'

function getDataFromFileInput(event) {
    spinnerControl.checked = true
    const reader = new FileReader()
    reader.onload = event => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(event.target.result, 'application/xml')
        const titles = Array.from(doc.getElementsByTagName('anime')).filter(el => {
            return (el.getElementsByTagName('my_status')[0].textContent == 'Completed'
                || el.getElementsByTagName('my_status')[0].textContent == 'Watching')
                && (el.getElementsByTagName('series_type')[0].textContent == 'TV'
                    || el.getElementsByTagName('series_type')[0].textContent == 'Movie')
        }).map(el => {
            return {
                id: Number.parseInt(el.getElementsByTagName('series_animedb_id')[0].textContent),
                name: el.getElementsByTagName('series_title')[0].textContent,
                mediaType: el.getElementsByTagName('series_type')[0].textContent
            }
        })
        spinnerControl.checked = false
        startTest(titles)
    }
    reader.readAsText(event.target.files[0])
}

async function getDataUsingUsername(event) {
    event.preventDefault()
    const titles = await animeList(form.username.value)
    startTest(titles)
}

function startTest(titles) {
    if (form.testType.value == 'openings-test')
        startOpeningsTest(titles)
    else
        startCharactersTest(titles)
}

const fileInput = document.getElementById('fileInput')
const form = document.getElementById('form')
const spinnerControl = document.getElementById('spinnerControl')
const testCard = document.getElementById('testCard')
const testInput = document.getElementById('testInput')
const testInputLabel = document.getElementById('testInputLabel')
const testSubmit = document.getElementById('testSubmit')
const testHeader = document.getElementById('testHeader')
const testContent = document.getElementById('testContent')
const testAudio = document.getElementById('testAudio')
const testHintText = document.getElementById('testHintText')
const testHintCheckbox = document.getElementById('testHintCheckbox')
const testHint = document.getElementById('testHint')
const testResult = document.getElementById('testResult')
const audioHolder = document.getElementById('audioHolder')
const imageHolder = document.getElementById('imageHolder')
const image = document.getElementById('image')

async function submit() {
    await new Promise(resolve => {
        testSubmit.onclick = () => resolve()
        testInput.onkeydown = ev => {
            if (ev.key == 'Enter')
                resolve()
        }
    })
}

async function startOpeningsTest(titles) {
    titles = titles
        .filter(a => a.mediaType == 'TV')
        .map((a) => ({ sortKey: Math.random(), value: a }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(a => a.value)

    let correct = 0;
    testInput.placeholder = 'Title'
    testInputLabel.textContent = 'Anime title'
    audioHolder.style.display = 'display: flex; flex-grow: 1;'
    imageHolder.style.display = 'none'
    testResult.textContent = `Done: ${0}, Correct: ${correct}, Total: ${titles.length}`
    form.style.display = 'none'
    testSubmit.disabled = false
    testCard.style.display = 'block'
    for (let i = 0; i < titles.length; i++) {
        testHeader.textContent = `Question ${i + 1}`
        testSubmit.textContent = 'Submit'
        testHintCheckbox.checked = false
        testHintText.textContent = `${titles[i].name.substr(0, 2)}...`
        spinnerControl.checked = true
        testContent.innerHTML = 'Good luck!<br>Click <code>Hint</code> to see first 2 letters.'
        testHint.style.display = 'block'

        const err = await new Promise(resolve => {
            testAudio.onplaying = () => {
                resolve(false)
            }
            testAudio.onerror = () => {
                resolve(true)
            }
            setTimeout(() => {
                resolve(true)
            }, 10000)
            testAudio.src = `/api/anime-opening/${encodeURIComponent(titles[i].name)}`
        })
        spinnerControl.checked = false

        if (err)
            continue;

        await submit()
        const info = await animeInfo(testInput.value)
        testHint.style.display = 'none'
        const result = info.find(el => el.id == titles[i].id)
        if (result)
            testContent.innerHTML = `<mark class="tertiary">OK</mark><br>Full title is <code>${titles[i].name}</code>.`, correct++
        else
            testContent.innerHTML = `<mark class="secondary">NOT OK</mark><br>Your answear was <code>${info[0].name}</code>,
                correct title is <code>${titles[i].name}</code>.`
        testSubmit.textContent = 'Next'
        testResult.textContent = `Done: ${i + 1}, Correct: ${correct}, Total: ${titles.length}`
        await submit()
        testInput.value = ''
    }
    testCard.style.display = 'block'
    form.style.display = 'block'
    testSubmit.disabled = true
}

async function startCharactersTest(titles) {
    titles = titles
        .map((a) => ({ sortKey: Math.random(), value: a }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(a => a.value)

    let correct = 0;
    let characters = [''];
    testInput.placeholder = 'Name'
    testInputLabel.textContent = 'Character name'
    audioHolder.style.display = 'none'
    imageHolder.style.display = 'block'
    testResult.textContent = `Done: ${0}, Correct: ${correct}`
    form.style.display = 'none'
    testSubmit.disabled = false
    testCard.style.display = 'block'
    for (let i = 0; i < characters.length; i++) {
        if (characters[0] == '')
            characters.shift()
        if (i < titles.length) {
            const newCharacters = await animeCharacters(titles[i].id);
            characters = characters
                .concat(newCharacters)
                .map((a, idx) => ({ sortKey: idx <= i ? idx : i + Math.random(), value: a }))
                .sort((a, b) => a.sortKey - b.sortKey)
                .map(a => a.value)
        }

        testHeader.textContent = `Question ${i + 1}`
        testSubmit.textContent = 'Submit'
        testHintCheckbox.checked = false
        testHintText.textContent = `${characters[i].name.substr(0, 2)}...`
        spinnerControl.checked = true
        testContent.innerHTML = 'Good luck!<br>Click <code>Hint</code> to see first 2 letters.'
        testHint.style.display = 'block'

        //const images = await searchImages(characters[i].name.match(/^(\w+)$/) ? `${characters[i].name} ${characters[i].title}` : characters[i].name);
        const err = await new Promise(resolve => {
            image.onload = () => {
                resolve(false)
            }
            testAudio.onerror = () => {
                resolve(true)
            }
            setTimeout(() => {
                resolve(true)
            }, 6000)
            image.src = characters[i].imageUrl
        })
        spinnerControl.checked = false

        if (err)
            continue;

        await submit()
        const info = await characterInfo(testInput.value)
        testHint.style.display = 'none'
        const result = info.find(el => el.id == characters[i].id)
        if (result)
            testContent.innerHTML = `<mark class="tertiary">OK</mark><br>Full name is <code>${characters[i].name}</code>.`, correct++
        else
            testContent.innerHTML = `<mark class="secondary">NOT OK</mark><br>Your answear was <code>${info[0].name}</code>,
                correct answer is <code>${characters[i].name}</code>.`
        testSubmit.textContent = 'Next'
        testResult.textContent = `Done: ${i + 1}, Correct: ${correct}`
        await submit()
        testInput.value = ''
    }
    testCard.style.display = 'block'
    form.style.display = 'block'
    testSubmit.disabled = true
}

fileInput.onchange = getDataFromFileInput
form.onsubmit = getDataUsingUsername

if (!localStorage.getItem('visited')) {
    document.getElementById('modalControl').checked = true
    localStorage.setItem('visited', true)
}