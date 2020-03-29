const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const mal = require('mal-scraper')
const search = require('youtube-search')
const stream = require('youtube-audio-stream')

router.get('/anime-info/:title', [
    check('title').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('anime-info', req.params.title)
    const result = (await mal.getResultsFromSearch(req.params.title))[0]
    return res.status(200).json({
        id: result.id,
        name: result.name
    })
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
        const searchResult = await new Promise((resolve, reject) => {
            search(`${req.params.name} opening`, {
                key: process.env.KEY,
                maxResults: 1,
                type: 'video',
                topicId: '/m/04rlf'
            }, (err, results) => {
                if (err)
                    reject(err)
                resolve(results[0])
            })
        })
        console.log(searchResult.link)
        stream(searchResult.link).pipe(res)
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})


module.exports = router