# Game Ended JSON
[Back to OW Event](ow_event.md)

The Match JSON will be sent upon the completion of the match, it will have the match level data:
* `ow_event_type: game_ended`
* `ow_event_data:`
  * `player_name`: String - [CLUB]OriginPlayerName
  * `game_mode`: String - Possible Values:
      * "#PL_FIRINGRANGE"
      * "#PL_TRAINING"
      * "#PL_DUO"
      * "#PL_TRIO"
      * "#PL_Ranked_Leagues"
      * "#SHADOWROYALE_MODE"
      * "#CONTROL_NAME"
  * `match_start_timestamp`: Unix Timestamp - Start of match
  * `match_end_timestamp`: Unix Timestamp - End of match
  * `match_events`: Array - all match events in order

Example:
```json
{
  "ow_event_type": "game_began",
  "ow_event_data": {
    "player_name": "[DADS]GoshDarnedHero",
    "game_mode": "#PL_FIRINGRANGE",
    "match_start_timestamp": 1644110359,
    "match_end_timestamp": 1644110387,
    "match_events": []
  }
}
```

### `match_events` Array
This is an array of events that happened in chronological order:
* `event_timestamp`: Unix Timestamp of event
* `event_type`: String - [Event Types](#event-types)
* `event_value`: String or Object (each event type has its own value)

### Event Types
Here are all the different event types and their values
* `match_state_event`: When a match begins or ends, event value:
    * `match_start`
      ```json
      {
        "event_timestamp": 1644104907,
        "event_type": "match_state_event",
        "event_value": "match_start"
      }
      ```
    * `match_end`
      ```json
      {
        "event_timestamp": 1644105224,
        "event_type": "match_state_event",
        "event_value": "match_end"
      }
* `kill`: Player kill
    * `victim_name`: String - victim gamertag
        ```json
        {
           "event_timestamp": 1644877157,
           "event_type": "kill",
           "event_value": {
              "victim_name": "[BRUH]HeyImLifeline"
           }
        }
        ```   
* `knockdown`: Player knockdown
    * `victim_name`: String - victim gamertag
        ```json
        {
           "event_timestamp": 1644877157,
           "event_type": "knockdown",
           "event_value": {
              "victim_name": "[BRUH]HeyImLifeline"
           }
        }
        ```   
* `assist`: Player assist
    * `victim_name`: String - victim gamertag
    * `type`: String - [`knockdown` / `elimination`]
        ```json
        {
           "event_timestamp": 1644877157,
           "event_type": "assist",
           "event_value": {
              "victim_name": "[BRUH]HeyImLifeline",
              "type": "knockdown"
           }
        }
        ```   
        ```json
        {
           "event_timestamp": 1644877171,
           "event_type": "assist",
           "event_value": {
              "victim_name": "[BRUH]HeyImLifeline",
              "type": "elimination"
           }
        }
        ```   
* `location`: Any time the player moves, these come fast and furious, event value:
    * `x`,`y`,`z`: Coordinates
        ```json
        {
            "event_timestamp": 1644110359,
            "event_type": "location",
            "event_value": {
                "x": 266,
                "y": -62,
                "z": -275
            }
        }
        ```
* `tabs`: Any time the 'tabs' across the game update, great way to track current place in match
    * `kills`, `assists`, `spectators`, `teams`, `players`,`damage`,`cash`
      ```json
      {
          "event_timestamp": 1644110359,
          "event_type": "tabs",
          "event_value": {
              "kills": 0,
              "assists": 0,
              "spectators": 0,
              "teams": 20,
              "players": 45,
              "damage": 459,
              "cash": 0
          }
      }
      ```

## Returns
### API Key found

```
200 (OK)
{}
```

### API Key not found
```
401 (Unauthorized)
{"message": "ERROR: Unauthorized"}
```

