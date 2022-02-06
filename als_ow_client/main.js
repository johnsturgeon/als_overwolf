let g_interestedInFeatures = [
    // 'damage',
    // 'death',
    // 'inventory',
    // 'kill',
    // 'kill_feed',
    'location',
    'match_info',
    'match_state',
    'match_summary',
    'me',
    // 'rank',
    // 'revive',
    // 'roster',
    // 'team',
    // 'victory'
];

let onErrorListener,onInfoUpdates2Listener,	onNewEventsListener;
let currentGame;
let gameState = {
    matchState: null,
    playerName: null,
    gameMode: null
}

function updateGameStateWithInfo(info) {
    let game_state = gameStateFromInfo(info)
    let didUpdate = false
    if(game_state) {
        switch (game_state.gamestate_type) {
            case 'name':
                gameState.playerName = game_state.gamestate_value
                didUpdate = true
                break
            case 'match_state':
                gameState.matchState = game_state.gamestate_value
                didUpdate = true
                break
            case 'game_mode':
                gameState.gameMode = game_state.gamestate_value
                break
            case 'ultimate_cooldown':
                didUpdate = true // TODO: ignore this for now
        }
    }
    return didUpdate
}

function registerEvents() {
    onErrorListener = function(info) {
        console.error("Error: " + JSON.stringify(info))
    }

    onInfoUpdates2Listener = function(info) {
        let match_event = matchEventFromInfo(info)
        let didUpdate = updateGameStateWithInfo(info)
        console.debug(match_event)
        if(match_event) {
            // update location in UI
            if (match_event.event_type === 'location') {
                let index_window = overwolf.windows.getMainWindow()
                let coordinate_id = index_window.document.getElementById('coordinates')
                let l = match_event.event_value
                coordinate_id.innerHTML = "x:" + l.x + " y:" + l.y + " z:" + l.z
            }
            if (currentGame && currentGame.isActive) {
                currentGame.saveEvent(match_event)
            }
        } else if(!didUpdate)  {
            console.warn("Getting an update to an unknown feature")
            console.warn("Feature is" + JSON.stringify(info))
        }
    }

    onNewEventsListener = function(event) {
        // events come in an array, so let's loop through them and add them
        for(let i=0; i<event['events'].length; i++) {
            let match_event = matchEventFromEvent(event['events'][i])
            if(!match_event) {
                console.warn("Got unknown event: " + JSON.stringify(event))
                return // EARLY RETURN
            }
            if (match_event.event_value === 'match_start') {
                currentGame = new Match(gameState)
            }
            currentGame.saveEvent(match_event)
            if (match_event.event_value === 'match_end') {
                currentGame.endMatch()
                sendEventToServer(currentGame)
                currentGame = null
            }
        }
    }
    // general events errors
    overwolf.games.events.onError.addListener(onErrorListener);
    // "static" data changed (total kills, username, steam-id)
    overwolf.games.events.onInfoUpdates2.addListener(onInfoUpdates2Listener);
    // an event triggered
    overwolf.games.events.onNewEvents.addListener(onNewEventsListener);
}

function unregisterEvents() {
    overwolf.games.events.onError.removeListener(onErrorListener);
    overwolf.games.events.onInfoUpdates2.removeListener(onInfoUpdates2Listener);
    overwolf.games.events.onNewEvents.removeListener(onNewEventsListener);
}

function gameLaunched(gameInfoResult) {
    if (!gameInfoResult) {
        return false;
    }

    if (!gameInfoResult.gameInfo) {
        return false;
    }

    if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
        return false;
    }

    if (!gameInfoResult.gameInfo.isRunning) {
        return false;
    }

    // NOTE: we divide by 10 to get the game class id without its sequence number
    return Math.floor(gameInfoResult.gameInfo.id / 10) === 21566;
}

function gameRunning(gameInfo) {
    if (!gameInfo) {
        return false;
    }
    if (!gameInfo.isRunning) {
        return false;
    }
    // NOTE: we divide by 10 to get the game class id without it's sequence number
    return Math.floor(gameInfo.id / 10) === 21566;
}

function setFeatures() {
    overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, function(info) {
        if (info.status === "error") {
            console.log("Could not set required features: " + info.reason);
            console.log("Trying in 2 seconds");
            window.setTimeout(setFeatures, 2000);
        }
    });
}


// Start here
overwolf.games.onGameInfoUpdated.addListener(function (res) {
    if (gameLaunched(res)) {
        registerEvents();
        unregisterEvents();
        setTimeout(setFeatures, 1000);
    }
});

overwolf.games.getRunningGameInfo(function (res) {
    if (gameRunning(res)) {
        registerEvents();
        setTimeout(setFeatures, 1000);
    }
});