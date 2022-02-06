# ALS <--> Overwolf

First bit here, I'm just going to start to publish the schemas that we will use to communicate back and forth

## Match JSON
The Match JSON will be sent upon the completion of the match, it will have the match level data:
### `root`
* `player_name`: String - [CLUB]OriginPlayerName
* `game_mode`: String - Possible Values:
  * "#PL_FIRINGRANGE"
  * "#PL_TRAINING"
  * "#PL_DUO"
  * "#PL_TRIO"
  * "#PL_Ranked_Leagues"
  * "#SHADOWROYALE_MODE"
* `match_start_timestamp`: Unix Timestamp - Start of match
* `match_end_timestamp`: Unix Timestamp - End of match
* `match_events`: Array - all match events in order

Example:
```json
{
  "player_name": "[DADS]GoshDarnedHero",
  "game_mode": "#PL_FIRINGRANGE",
  "match_start_timestamp": 1644110359,
  "match_end_timestamp": 1644110387,
  "match_events": []
}
```

### `match_events` Array
This is an array of events that happened in chronological order.  The basic struction will be:
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
