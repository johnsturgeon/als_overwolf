# Overwolf Event API
[Back to README](../README.md)

### **POST** - /ow_event

#### Header Parameters

- **X-Api-Key**: `string` _valid api key_

#### Body

Contents of the body will always contain the `ow_event_type` JSON:
### `root`
* `ow_event_type`: String
* `ow_event_data`: JSON (different depending on event_type)

#### event types:
* [game_began](game_began.md)
* [game_ended](game_ended.md)

Example:
```json
{
  "ow_event_type": "game_began",
  "ow_event_data": {
    ...
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

