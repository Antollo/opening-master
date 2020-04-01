const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const mal = require('mal-scraper')
const stream = require('./stream')

router.get('/anime-info/:title', [
    check('title').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('anime-info', req.params.title)
    try {
        res.status(200).json((await mal.getResultsFromSearch(req.params.title))
            .slice(0, 4)
            .map(el => {
                return {
                    id: el.id,
                    name: el.name
                }
            }))
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }

})

router.get('/anime-list/:user', [
    check('user').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('anime-list', req.params.user)
    let list = []
    let tempList
    let nextIndex = 0
    try {
        do {
            tempList = await mal.getWatchListFromUser(req.params.user, nextIndex, 'anime')
            list = list.concat(tempList)
            nextIndex += 300
        } while (tempList.length == 300)

        res.status(200).json(list
            .filter(el => (el.status == 1 || el.status == 2)
                && (el.animeMediaTypeString == 'TV' || el.animeMediaTypeString == 'Movie'))
            .map(el => {
                return {
                    id: el.animeId,
                    name: el.animeTitle
                }
            }))
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

router.get('/anime-opening/:name', [
    check('name').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })

    console.log('anime-name', req.params.name)
    try {
        (await stream(req.params.name)).pipe(res)
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})

module.exports = router