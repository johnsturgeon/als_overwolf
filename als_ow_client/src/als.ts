export class Match {
    player_name: string
    game_mode: string
    match_start_timestamp: number
    match_end_timestamp: number
    match_events: any[]

    constructor(game_state) {
        this.player_name = game_state.playerName
        this.game_mode = game_state.gameMode
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
        event_value: null
    }
}

export function matchEventFromEvent(event) {
    let return_event = emptyMatchEvent()
    switch(event['name']) {
        case 'match_start':
        case 'match_end':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_state
            // {"name":"match_start","data":""}
            return_event.event_type = 'match_state_event'
            return_event.event_value = event['name']
            break
        case 'kill':
        case 'knockdown':
        case 'assist':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#kill
            // {"name":"kill","data":"{  "victimName": "`1[LuL] Jim #limbo"}"}
            // {"name":"knockdown","data":"{  "victimName": "`1 Omar"}"}
            // {"name":"assist","data":"{  "victimName": "Leila.qwerty",  "type": "elimination"}"}
            // type == `elimination`, `knockdown`
            return_event.event_type = event['name']
            return_event.event_value = jsonOrString(event['data'])
            break
        default:
            return_event = null
    }
    return return_event
}

export function gameStateFromInfo(info) {
    let game_state = emptyGameState()
    console.log("JHS: Getting gameStateFromInfo: " + JSON.stringify(info))
    let initial_key = Object.keys(info)[0]
    switch(initial_key) {
        case 'game_info':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_state
            // {"game_info":{"match_state":"active"}}
            // {"game_info":{"match_state":"inactive"}}
            game_state.gamestate_type = 'match_state'
            game_state.gamestate_value = jsonOrString(info[initial_key]['match_state'])
            break
        case 'match_info':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_info
            // {"match_info":{"game_mode":"#PL_CAN_TRIO"}}
            let match_info = info['match_info']
            if ('game_mode' in match_info) {
                game_state.gamestate_type = 'game_mode'
                game_state.gamestate_value = match_info['game_mode']
            }
            break
        case 'me':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#me
            // {"me":{"name":"GoshDarnedHero"}}
            let me_info = info['me']
            if('name' in me_info) {
                game_state.gamestate_type = 'name'
                game_state.gamestate_value = jsonOrString(me_info['name'])
            }
            // {"me":{"ultimate_cooldown":"{"ultimate_cooldown":"20"}"}}
            // ignore ultimate cooldown for now
            break
        default:
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
        default:
            return_event = null
    }
    return return_event
}

export function sendMatchToServer(match) {
    let url = "http://192.168.1.219:8822/event";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(match))
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
