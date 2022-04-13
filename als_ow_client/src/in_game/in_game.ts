import {OWGamesEvents} from "@overwolf/overwolf-api-ts/dist";
import {
  gameStateFromInfo,
  Match,
  matchEventFromEvent,
  matchEventFromInfo,
  sendEventToServer
} from "../als";

class InGame {
  private static _instance: InGame
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
    console.log("JHS: Making a new InGame Window")
    this._gameEventsListener = new OWGamesEvents({
          onInfoUpdates: this.onInfoUpdates.bind(this),
          onNewEvents: this.onNewEvents.bind(this)
        },
        this._interestedFeatures
    );

  };

  // Implementing the Singleton design pattern
  public static instance(): InGame {
    if (!InGame._instance) {
      InGame._instance = new InGame()
    }

    return InGame._instance;
  }

  private updateGameStateWithInfo(info: any) {
    let didUpdate = false
    const infoKeys = Object.keys(info)
    infoKeys.forEach((key, index) => {
      let game_state = gameStateFromInfo(key, info[key])
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
    });
    return didUpdate
  }

  private onInfoUpdates(info) {
    console.log("New Info: " + JSON.stringify(info))
    let didUpdate = this.updateGameStateWithInfo(info)
    if(didUpdate) {
      console.log("Updated Game state with info: " + JSON.stringify(info))
      return // EARLY RETURN
    }
    let match_event = matchEventFromInfo(info)
    if (!match_event) {
      return // EARLY RETURN
    }
    // got a pseudo match id, must be a new game
    if (match_event.event_type == 'pseudo_match_id') {
      if (match_event.event_value) {
        const pseudo_match_id = match_event.event_value
        console.log("Creating new match with game state: " + JSON.stringify(this._gameState))
        this._currentMatch = new Match(this._gameState, pseudo_match_id)
      } else {
        this._currentMatch.endMatch()
        sendEventToServer("game_ended", this._currentMatch)
        console.log("Sent match to server: " + JSON.stringify(this._currentMatch))
        this._currentMatch = null
      }
    }
    if(this._currentMatch) {
      this._currentMatch.saveEvent(match_event)
    }
  }

  private onNewEvents(event) {
    for(let i=0; i<event['events'].length; i++) {
      let match_event = matchEventFromEvent(event['events'][i])
      if (!match_event) {
        console.warn("Got unknown event: " + JSON.stringify(event))
        return // EARLY RETURN
      }
      if(this._currentMatch) {
        this._currentMatch.saveEvent(match_event)
        console.log("New Event: " + JSON.stringify(event))
      } else {
        console.log("JHS: Didn't save event (no _currentMatch)" + JSON.stringify(event))
      }
    }
  }

  public async run() {
    console.log("JHS: Now RUNNING the InGame Controller")
    await this._gameEventsListener.start();
  }
}

InGame.instance().run().then();
