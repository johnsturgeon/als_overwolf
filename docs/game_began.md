# Game Started API
[Back to README](../README.md)

### **POST** - /ow_game_started

#### Header Parameters

- **X-Api-Key**: `string` _valid api key_

#### Body

The Match JSON will be sent upon the beginning of a match:
### `root`
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
  "player_name": "[DADS]GoshDarnedHero",
  "game_mode": "#PL_FIRINGRANGE",
  "match_start_timestamp": 1644110359
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

