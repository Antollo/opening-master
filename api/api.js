const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const mal = require('mal-scraper')
const stream = require('youtube-audio-stream')
const search = require('youtube-search')
const search2 = require("scrape-youtube").search
let searchNotWorkingFallbackToSearch2 = false

function searchPromisify(name) {
    return new Promise((resolve, reject) => {
        try {
            search(`${name} opening`, {
                key: process.env.KEY,
                maxResults: 1,
                type: 'video',
                topicId: '/m/04rlf'
            }, (err, results) => {
                if (err)
                    reject(err)
                if (results && results.length && results[0].url)
                    resolve(results[0].url)
                reject(results)
            })
        } catch (err) {
            reject(err)
        }
    })
}

async function search2Promisify(name) {
    try {
        return (await search2(`${name} opening`, { limit: 1, type: "video" }))[0].link
    } catch (err) {
        try {
            return (await search2(`${name} opening`, { limit: 1, type: "video" }))[0].link
        } catch (err) {
            try {
                return (await search2(`${name} opening`, { limit: 1, type: "video" }))[0].link
            } catch (err) {
                return err
            }
        }
    }
}

router.get('/anime-info/:title', [
    check('title').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('anime-info', req.params.title)
    return res.status(200).json((await mal.getResultsFromSearch(req.params.title))
        .slice(0, 3)
        .map(el => {
            return {
                id: el.id,
                name: el.name
            }
        }))
})

router.get('/anime-list/:user', [
    check('user').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('anime-list', req.params.user)
    return res.status(200).json((await mal.getWatchListFromUser(req.params.user, 0, 'anime'))
        .filter(el => el.status == 2)
        .map(el => {
            return {
                id: el.animeId,
                name: el.animeTitle
            }
        }))
})

router.get('/anime-opening/:name', [
    check('name').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('anime-name', req.params.name)
    try {
        let searchResult;
        if (searchNotWorkingFallbackToSearch2) {
            searchResult = await search2Promisify(req.params.name)
        } else {
            try {
                searchResult = await searchPromisify(req.params.name)
            } catch (err) {
                searchNotWorkingFallbackToSearch2 = true
                searchResult = await search2Promisify(req.params.name)
            }
        }
        console.log(searchResult)
        stream(searchResult).pipe(res)
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})


module.exports = router