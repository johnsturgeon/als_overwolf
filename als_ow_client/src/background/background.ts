import {
    OWGameListener,
    OWGamesEvents
} from '@overwolf/overwolf-api-ts';

import AppLaunchTriggeredEvent = overwolf.extensions.AppLaunchTriggeredEvent;
import {
    gameStateFromInfo,
    Match,
    matchEventFromEvent, matchEventFromInfo,
    sendMatchToServer
} from '../als'


class BackgroundController {
    private static _instance: BackgroundController
    private _gameListener: OWGameListener
    private _gameEventsListener: OWGamesEvents
    private _currentMatch: Match
    private _gameState = {
        matchState: null,
        playerName: null,
        gameMode: null
    }
    private _interestedFeatures = [
        // 'damage',
        // 'death',
        // 'inventory',
        'kill',
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

    private constructor() {
        // When a supported game is started or is ended, toggle the app's windows
        this._gameListener = new OWGameListener({
            onGameStarted: BackgroundController.onGameStarted.bind(this),
            onGameEnded: BackgroundController.onGameEnded.bind(this)
        });
        this._gameEventsListener = new OWGamesEvents({
                onInfoUpdates: this.onInfoUpdates.bind(this),
                onNewEvents: this.onNewEvents.bind(this)
            },
            this._interestedFeatures
        );
        overwolf.extensions.onAppLaunchTriggered.addListener(
            e => BackgroundController.onAppLaunchTriggered(e)
        );
    };

    // Implementing the Singleton design pattern
    public static instance(): BackgroundController {
        if (!BackgroundController._instance) {
            BackgroundController._instance = new BackgroundController();
        }

        return BackgroundController._instance;
    }

    // When running the app, start listening to games' status and decide which window should
    // be launched first, based on whether a supported game is currently running
    public async run() {
        this._gameListener.start();
        this._gameEventsListener.start();

    }

    private updateGameStateWithInfo(info) {
        let game_state = gameStateFromInfo(info)
        let didUpdate = false
        if(game_state) {
            switch (game_state.gamestate_type) {
                case 'name':
                    this._gameState.playerName = game_state.gamestate_value
                    didUpdate = true
                    break
                case 'match_state':
                    this._gameState.matchState = game_state.gamestate_value
                    didUpdate = true
                    break
                case 'game_mode':
                    this._gameState.gameMode = game_state.gamestate_value
                    break
            }
        }
        return didUpdate
    }
    private onInfoUpdates(info) {
        let didUpdate = this.updateGameStateWithInfo(info)
        if(didUpdate) {
            console.log("Updated Gamestate with info: " + JSON.stringify(info))
        } else {
            let match_event = matchEventFromInfo(info)
            if(match_event && this._currentMatch) {
                this._currentMatch.saveEvent(match_event)
            }
            console.log("New Info: " + JSON.stringify(info))
        }
    }

    private onNewEvents(event) {
        for(let i=0; i<event['events'].length; i++) {
            let match_event = matchEventFromEvent(event['events'][i])
            if (!match_event) {
                console.warn("Got unknown event: " + JSON.stringify(event))
                return // EARLY RETURN
            }
            if (match_event.event_value === 'match_start') {
                console.log("Creating new match with gamestate: " + JSON.stringify(this._gameState))
                this._currentMatch = new Match(this._gameState)
            }
            this._currentMatch.saveEvent(match_event)
            if (match_event.event_value === 'match_end') {
                this._currentMatch.endMatch()
                sendMatchToServer(this._currentMatch)
                console.log("Sent match to server: " + JSON.stringify(this._currentMatch))
                this._currentMatch = null
            }
            console.log("New Event: " + JSON.stringify(event))
        }
    }

    private static onGameStarted(game) {
        console.log("Game Start: " + JSON.stringify(game))
    }

    private static onGameEnded(game) {
        console.log("Game Ended: " + JSON.stringify(game))
        overwolf.windows.getMainWindow().close()
    }

    private static async onAppLaunchTriggered(e: AppLaunchTriggeredEvent) {
        console.log('onAppLaunchTriggered():', e);
        if (!e || e.origin.includes('gamelaunchevent')) {
            return;
        }
    }
}

BackgroundController.instance().run().then(r => r);
