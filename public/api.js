export async function animeInfo(title) {
    let result = [{ name: 'empty', id: -1 }]
    spinnerControl.checked = true
    try {
        if (typeof title == 'string' && title.length)
            result = await fetch(`/api/anime-info/${encodeURIComponent(title)}`, {
                method: 'GET'
            }).then(res => res.json())
    }
    catch (err) {
        console.error(err)
        result[0].name = 'server error'
    }
    spinnerControl.checked = false
    return result
}

export async function characterInfo(name) {
    let result = [{ name: 'empty', id: -1 }]
    spinnerControl.checked = true
    try {
        if (typeof name == 'string' && name.length)
            result = await fetch(`/api/character-info/${encodeURIComponent(name)}`, {
                method: 'GET'
            }).then(res => res.json())
    }
    catch (err) {
        console.error(err)
        result[0].name = 'server error'
    }
    spinnerControl.checked = false
    return result
}

export async function animeList(user) {
    let result = []
    spinnerControl.checked = true
    try {
        if (typeof user == 'string' && user.length)
            result = await fetch(`/api/anime-list/${encodeURIComponent(user)}`, {
                method: 'GET'
            }).then(res => res.json())
    }
    catch (err) {
        console.error(err)
    }
    spinnerControl.checked = false
    return result
}

export async function animeCharacters(id) {
    let result = []
    spinnerControl.checked = true
    try {
        if ((typeof id == 'string' && id.length) || (typeof id == 'number' && id))
            result = await fetch(`/api/anime-characters/${encodeURIComponent(id)}`, {
                method: 'GET'
            }).then(res => res.json())
    }
    catch (err) {
        console.error(err)
    }
    spinnerControl.checked = false
    return result
}

/*export async function searchImages(query) {
    let result = []
    spinnerControl.checked = true
    try {
        if (typeof query == 'string' && query.length)
            result = await fetch(`/api/search-images/${encodeURIComponent(query)}`, {
                method: 'GET'
            }).then(res => res.json())
    }
    catch (err) {
        console.error(err)
    }
    spinnerControl.checked = false
    return result
}*/