import { kUrls } from "./consts";

export class Match {
    player_name: string
    game_mode: string
    pseudo_match_id: string
    match_start_timestamp: number
    match_end_timestamp: number
    match_events: any[]

    constructor(game_state, pseudo_match_id) {
        this.player_name = game_state.playerName
        this.game_mode = game_state.gameMode
        this.pseudo_match_id = pseudo_match_id
        this.match_start_timestamp = Math.floor(Date.now() / 1000)
        this.match_end_timestamp = null
        this.match_events = []
    }

    public saveEvent(event): void {
        this.match_events.push(event)
    }

    public endMatch() {
        this.match_end_timestamp = Math.floor(Date.now() / 1000)
    }

    public isActive(): boolean {
        return this.match_start_timestamp && !this.match_end_timestamp
    }
}

function emptyGameState() {
    return {
        gamestate_type: null,
        gamestate_value: null
    }
}

function emptyMatchEvent() {
    return {
        event_timestamp: Math.floor(Date.now() / 1000),
        event_type: null,
        event_value: null,
        event_match_id: null
    }
}

export function matchEventFromEvent(match_id, event) {
    let return_event = emptyMatchEvent()
    return_event.event_match_id = match_id
    switch(event['name']) {
        // {"events":[{"name":"action_points","data":"Shot On Goal"}]}
        // {"events":[{"name":"action_points","data":"Goal"}]}
        // {"events":[{"name":"action_points","data":"First Touch"}]}
        // {"events":[{"name":"action_points","data":"Center Ball"}]}
        // {"events":[{"name":"action_points","data":"Pool Shot"}]}
        // {"events":[{"name":"action_points","data":"Assist"}]}
        // {"events":[{"name":"action_points","data":"Clear Goal"}]}
        // {"events":[{"name":"action_points","data":"Demolish"}]}
        // {"events":[{"name":"action_points","data":"Save"}]}
        // {"events":[{"name":"action_points","data":"Epic Save"}]}
        case 'action_points':
        case 'playerJoined':
        case 'playerLeft':
        case 'rosterChange':
        case 'score':
        case 'matchEnd':
        case 'teamGoal':
        case 'goal':
        case 'opposingTeamGoal':
        case 'victory':
        case 'defeat':
        case 'death':
            return_event.event_type = event['name']
            return_event.event_value = jsonOrString(event['data'])
            break
        default:
            return_event = null
    }
    return return_event
}

function safeStateFromValue(key: string, value) {
    let game_state = emptyGameState()
    if(key in value) {
        game_state.gamestate_type = key
        game_state.gamestate_value = jsonOrString(value[key])
    }
    return game_state
}

export function gameStateFromInfo(info_key, info_value) {
    let game_state = null
    console.log("JHS: Getting gameStateFromInfo: " + JSON.stringify(info_key))
    switch(info_key) {
        case 'game_info':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_state
            // value: {"match_state":"active"}
            // value: {"match_state":"inactive"}
            game_state = safeStateFromValue('match_state', info_value)
            break
        case 'match_info':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_info
            // value: {"game_mode":"#PL_CAN_TRIO"}
            game_state = safeStateFromValue('game_mode', info_value)
            break
        case 'me':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#me
            // {"me":{"name":"GoshDarnedHero"}}
            game_state = safeStateFromValue('name', info_value)
            // {"me":{"ultimate_cooldown":"{"ultimate_cooldown":"20"}"}}
            // ignore ultimate cooldown for now
            break
        default:
            console.log("JHS: Ignoring info with key" + info_key)
            game_state = null

    }
    return game_state
}

export function matchEventFromInfo(info) {
    let return_event = emptyMatchEvent()
    if(!info.hasOwnProperty('match_info')) {
        return // EARLY RETURN
    }
    let match_info = info['match_info']
    let initial_key = Object.keys(match_info)[0]
    switch (initial_key) {
        case 'location':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#location
            // {"match_info":{"location":"{"x":"93","y":"305","z":"49"}"}}
            return_event.event_type = 'location'
            return_event.event_value = jsonOrString(match_info['location'])
            break
        case 'tabs':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_info
            // {"match_info":{"tabs":"{"kills":1,"spectators":0,"teams":11,"players":30,"damage":394,"cash":0}"}}
            return_event.event_type = 'tabs'
            return_event.event_value = jsonOrString(match_info['tabs'])
            break
        case 'match_summary':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_summary
            // {"match_info":{"match_summary":"{"rank":"12","teams":"20","squadKills":"5"}"}}
            return_event.event_type = 'match_summary'
            return_event.event_value = jsonOrString(match_info['match_summary'])
            break
        case 'pseudo_match_id':
            return_event.event_type = 'pseudo_match_id'
            return_event.event_value = jsonOrString(match_info['pseudo_match_id'])
            break
        default:
            return_event = null
    }
    return return_event
}

export function sendEventToServer(match_event) {
    let url = kUrls.rl_event
    let header = new Headers({
        'Content-Type': 'application/json'
    })
    let initObject = {
        method: 'POST', headers: header, body: JSON.stringify(match_event)
    }
    fetch(url, initObject)
        .then(r => r)
        .catch(error => {
            console.error(error)
        })
}

/**
 * Checks to see if the given key is valid
 *
 * @param apiKey - the api key to check
 * @param on_valid - function to call if the api key is valid
 * @param on_not_valid - function to call if the api key is not valid
 * @param on_error - function to call if there is an error communicating with the server
 */
export function isValidAPIKey(apiKey: string, on_valid: Function, on_not_valid: Function, on_error: Function) {
    let url = kUrls.als_ow_user
    let header = new Headers({
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
    })
    let initObject = {
        method: 'GET', headers: header
    }
    fetch(url, initObject)
        .then(response => {
            if (response.ok) {
                response.json().then(data => {
                    on_valid(data)
                })
            } else if (response.status == 401) {
                response.json().then(data => {
                    on_not_valid(data)
                })
            }
        })
        .catch(error => {
            on_error(error)
        })
}


export function isServiceUp(on_success: Function, on_failure: Function) {
    let url = kUrls.als_ow_ping
    fetch(url)
        .then(response => {
            if (response.ok) {
                on_success()
            } else{
                on_failure()
            }
        })
        .catch(error => {
            on_failure()
        })
}

const changeCaseOfKey = key => {
    return key
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join("_");
}

const isObject = o => {
    return o === Object(o) && !Array.isArray(o) && typeof o !== "function"
}

const changeCase = entity => {
    if (entity === null) return entity

    if (isObject(entity)) {
        const changedObject = {}
        Object.keys(entity).forEach(originalKey => {
            const newKey = changeCaseOfKey(originalKey)
            changedObject[newKey] = changeCase(entity[originalKey])
        });
        return changedObject
    } else if (Array.isArray(entity)) {
        return entity.map(element => {
            return changeCase(element)
        })
    }

    return entity
}

function jsonOrString(str) {
    let return_value;
    try {
        return_value = JSON.parse(str, function (key, value) {
            if (isNaN(value)) {
                return value
            } else {
                return parseInt(value)
            }
        })
    } catch (e) {
        return_value = str
    }
    if(typeof return_value === 'object') {
        return_value = changeCase(return_value)
    }
    return return_value
}
