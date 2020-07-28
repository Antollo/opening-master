const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const mal = require('mal-scraper')
const axios = require('axios')
const stream = require('./stream')
/*const GoogleImages = require('google-images');
const googleImages = new GoogleImages();*/

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
                    name: el.animeTitle,
                    mediaType: el.animeMediaTypeString
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

router.get('/anime-characters/:id', [
    check('id').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })

    console.log('anime-characters', req.params.id)
    try {
        res.status(200).json(
            (await mal.getInfoFromURL(`https://myanimelist.net/anime/${req.params.id}`)).characters
                .filter(el => (el.role && el.role == 'Main'))
                .map(el => {
                    /*let temp = el.name.match(/^(\w+), (\w+)$/)
                    if (temp && temp.length == 3)
                        el.name = `${temp[2]} ${temp[1]}`*/
                    return {
                        id: el.link.match(/\/([0-9]+)\//)[1],
                        imageUrl: el.picture,
                        name: el.name
                    }
                })
        )
    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
})

router.get('/character-info/:name', [
    check('name').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('character-info', req.params.name)
    try {
        res.status(200).json((await mal.getCharactersFromSearch(req.params.name))
            .slice(0, 5)
            .map(el => {
                /*let temp = el.name.match(/^(\w+), (\w+)$/)
                    if (temp && temp.length == 3)
                        el.name = `${temp[2]} ${temp[1]}`*/
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

/*router.get('/search-images/:query', [
    check('query').isString().not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() })
    console.log('search-image', req.params.query)
    try {
        res.status(200).json((await googleImages.search(req.params.query))
            //.filter(image => image.type == 'image/jpeg')
            //.sort((a, b) => -(a.height * a.width - b.height * b.width))
        )
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }

})*/

mal.getCharactersFromSearch = keyword => {
    return new Promise((resolve, reject) => {
        if (!keyword) {
            reject(new Error('[Mal-Scraper]: Received no keyword to search.'))
            return
        }
        axios.get('https://myanimelist.net/search/prefix.json', {
            params: {
                type: 'character',
                keyword: keyword
            }
        }).then(({ data }) => {
            const items = []
            data.categories.forEach(elem => {
                elem.items.forEach(item => items.push(item))
            })
            resolve(items)
        }).catch(err => reject(err))
    })
}

module.exports = router