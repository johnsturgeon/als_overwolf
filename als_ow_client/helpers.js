class Match {
    constructor(game_state) {
        this.player_name = game_state.playerName
        this.game_mode = game_state.gameMode
        this.match_start_timestamp = Math.floor(Date.now() / 1000)
        this.match_end_timestamp = null
        this.match_events = []
    }
    saveEvent(event) {
        this.match_events.push(event)
    }
    endMatch() {
        this.match_end_timestamp = Math.floor(Date.now() / 1000)
    }
    get isActive() {
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

function matchEventFromEvent(event) {
    // {"name":"match_start","data":""}
    let return_event = emptyMatchEvent()
    switch(event['name']) {
        case 'match_start':
        case 'match_end':
        // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_state
            return_event.event_type = 'match_state_event'
            return_event.event_value = event['name']
            break
        default:
            return_event = null
    }
    return return_event
}

function gameStateFromInfo(info) {
    let game_state = emptyGameState()
    console.log(info)
    switch(info['feature']) {
        case 'match_state':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_state
            // {"info":{"game_info":{"match_state":"active"}},"feature":"match_state"}
            // {"info":{"game_info":{"match_state":"inactive"}},"feature":"match_state"}
            game_state.gamestate_type = 'match_state'
            game_state.gamestate_value = jsonOrString(info['info']['game_info']['match_state'])
            break
        case 'match_info':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_info
            // {"info":{"match_info":{"game_mode":"#PL_CAN_TRIO"}},"feature":"match_info"}
            let match_info = info['info']['match_info']
            if('game_mode' in match_info) {
                game_state.gamestate_type = 'game_mode'
                game_state.gamestate_value = match_info['game_mode']
            }
            break
        case 'me':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#me
            // {"info":{"me":{"name":"GoshDarnedHero"}},"feature":"me"}
            // {"info":{"me":{"ultimate_cooldown":"{"ultimate_cooldown":"20"}"}},"feature":"me"}
            let me_info = info['info']['me']
            let me_types = ['name', 'ultimate_cooldown']
            for(let i = 0; i < me_types.length; i++) {
                if (me_types[i] in me_info) {
                    game_state.gamestate_type = me_types[i]
                    game_state.gamestate_value = jsonOrString(me_info[me_types[i]])
                    break
                }
            }
            break
        default:
            game_state = null
    }
    return game_state
}

function matchEventFromInfo(info) {
    let return_event = emptyMatchEvent()
    switch (info['feature']) {
        case 'location':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#location
            // {"info":{"match_info":{"location":"{"x":"93","y":"305","z":"49"}"}},"feature":"location"}
            return_event.event_type = 'location'
            return_event.event_value = jsonOrString(info['info']['match_info']['location'])

            break
        case 'match_info':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_info
            // {"info":{"match_info":{"tabs":"{"kills":1,"spectators":0,"teams":11,"players":30,"damage":394,"cash":0}"}},"feature":"match_info"}
            let match_info = info['info']['match_info']
            if('tabs' in match_info) {
                return_event.event_type = 'tabs'
                return_event.event_value = jsonOrString(match_info['tabs'])
            }
            break
        case 'match_summary':
            // https://overwolf.github.io/docs/api/overwolf-games-events-apex-legends#match_summary
            // {"info":{"match_info":{"match_summary":"{"rank":"12","teams":"20","squadKills":"5"}"}},"feature":"match_summary"}
            return_event.event_type = 'match_summary'
            return_event.event_value = jsonOrString(info['info']['match_info']['match_summary'])
            break
        default:
            return_event = null
    }
    return return_event
}

function sendEventToServer(obj) {
    let url = "http://192.168.1.175:8822/event";
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(obj))
}

function jsonOrString(str) {
    let return_value;
    try {
        return_value = JSON.parse(str, function(key, value) {
            if(isNaN(value)) {
                return value
            } else {
                return parseInt(value)
            }
        })
    } catch (e) {
        return_value = str
    }
    return return_value
}