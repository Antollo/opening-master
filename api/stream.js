const ytdl = require('ytdl-core')
const FFmpeg = require('fluent-ffmpeg')
const ytSearch = require('scrape-yt').search
const { EventEmitter } = require('events')
const pathToFfmpeg = require('ffmpeg-static')

FFmpeg.setFfmpegPath(pathToFfmpeg)
const eventEmitter = new EventEmitter()
eventEmitter.setMaxListeners(64)
let counter = 4

function ytStream(uri) {
    const video = ytdl(uri, {
        quality: 'lowest',
        highWaterMark: 134217728,
        filter: 'audioonly'
    })
    const ffmpeg = new FFmpeg(video)
    video.on('error', error => console.error(error))
    ffmpeg.on('error', error => console.error(error))
    return ffmpeg.format('mp3')
}

function filterSearchResults(results) {
    return results
        .filter(el => el.duration > 30 && el.duration < 600)
        .filter(el => el.title.toLowerCase().indexOf('trailer') == -1)
}

function transformName(name) {
    return encodeURIComponent(name
        .replace('××', ' xx')
        .replace('♭', ' season 2')
    )
}

async function search(name, errorDepth = 3) {
    try {
        const results = await ytSearch(`${transformName(name)} opening`, { limit: 4, type: 'video' })
        console.log(results)
        return `https://www.youtube.com/watch?v=${filterSearchResults(results)[0].id}`
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
    try {
        const searchResult = await search(name)
        console.log(searchResult)
        const streamResult = ytStream(searchResult)
        setTimeout(leave, 2000)
        return streamResult
    } catch (err) {
        setTimeout(leave, 2000)
        console.log(err)
        throw err
    }
}

module.exports = stream