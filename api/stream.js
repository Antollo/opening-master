const ytStream = require('youtube-audio-stream')
const ytSearch = require('scrape-youtube').search
const events = require('events')
const eventEmitter = new events.EventEmitter()
eventEmitter.setMaxListeners(64)
let counter = 4

function filterSearchResults(results) {
    return results
        .filter(el => el.duration > 30 && el.duration < 600)
        .filter(el => el.title.toLowerCase().indexOf('trailer') == -1)
}

async function search(name, errorDepth = 3) {
    try {
        const results = await ytSearch(`${encodeURIComponent(name)} opening`, { limit: 4, type: 'video' })
        return filterSearchResults(results)[0].link
    } catch (err) {
        if (errorDepth == 0)
            throw err
        return search(name, errorDepth - 1)
    }
}

async function enter() {
    if (counter > 0) {
        counter--
        return
    }
    while (true) {
        await new Promise(resolve => eventEmitter.once('end', resolve))
        if (counter > 0) {
            counter--
            return
        } else {
            console.log('waiting')
        }
    }
}

async function leave() {
    counter++
    eventEmitter.emit('end')
}

async function stream(name) {
    await enter()
    const searchResult = await search(name)
    console.log(searchResult)
    const streamResult = ytStream(searchResult)
    setTimeout(leave, 2000)
    return streamResult
}

module.exports = stream