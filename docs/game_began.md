# Game Began JSON
[Back to OW Event](ow_event.md)

The Match Start JSON that will be sent upon the beginning of a match:
* `ow_event_type: game_began`
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

Example:
```json
{
  "ow_event_type": "game_began",
  "ow_event_data": {
    "player_name": "[DADS]GoshDarnedHero",
    "game_mode": "#PL_FIRINGRANGE",
    "match_start_timestamp": 1644110359
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

