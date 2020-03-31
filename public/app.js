async function animeInfo(title) {
    let result = [{ name: 'empty', id: -1 }]
    spinnerControl.checked = true
    try {
        if (typeof title == 'string' && title.length)
            result = await fetch(`/api/anime-info/${encodeURIComponent(title)}`, {
                method: 'GET'
            }).then(res => res.json())
    }
    catch (err) {
        console.error(err);
    }
    spinnerControl.checked = false
    return result
}

async function animeList(user) {
    let result = []
    spinnerControl.checked = true
    try {
        if (typeof user == 'string' && user.length)
            result = await fetch(`/api/anime-list/${encodeURIComponent(user)}`, {
                method: 'GET'
            }).then(res => res.json())
    }
    catch (err) {
        console.error(err);
    }
    spinnerControl.checked = false
    return result
}

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
                name: el.getElementsByTagName('series_title')[0].textContent
            }
        })
        spinnerControl.checked = false
        startTest(titles)
    }
    reader.readAsText(event.target.files[0])
}

async function getDataUsingUsername(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const titles = await animeList(formData.get('username'))
    startTest(titles)
}

const fileInput = document.getElementById('fileInput')
const form = document.getElementById('form')
const spinnerControl = document.getElementById('spinnerControl')
const testCard = document.getElementById('testCard')
const testTitle = document.getElementById('testTitle')
const testSubmit = document.getElementById('testSubmit')
const testHeader = document.getElementById('testHeader')
const testContent = document.getElementById('testContent')
const testAudio = document.getElementById('testAudio')
const testHintText = document.getElementById('testHintText')
const testHintCheckbox = document.getElementById('testHintCheckbox')
const testHint = document.getElementById('testHint')
const testResult = document.getElementById('testResult')

async function submit() {
    await new Promise(resolve => {
        testSubmit.onclick = () => resolve()
        testTitle.onkeydown = ev => {
            if (ev.key == 'Enter')
                resolve()
        }
    })
}

async function startTest(titles) {
    titles = titles.map((a) => ({ sortKey: Math.random(), value: a }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map((a) => a.value)

    // I don't know the proof of Fisher–Yates shuffle algorithm
    // so I won't use it for now.
    /*for (let i = titles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [titles[i], titles[j]] = [titles[j], titles[i]]
    }*/
    let correct = 0;
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
        testAudio.src = `/api/anime-opening/${encodeURIComponent(titles[i].name)}`
        testContent.innerHTML = 'Good luck!<br>Click <code>Hint</code> to see first 2 letters.'
        testHint.style.display = 'block'
        await submit()
        const info = await animeInfo(testTitle.value)
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
        testTitle.value = ''
    }
    testCard.style.display = 'block'
    form.style.display = 'block'
    testSubmit.disabled = true
}

fileInput.onchange = getDataFromFileInput
form.onsubmit = getDataUsingUsername
testAudio.onplaying = () => spinnerControl.checked = false

if (!localStorage.getItem('visited')) {
    document.getElementById('modalControl').checked = true
    localStorage.setItem('visited', true)
}