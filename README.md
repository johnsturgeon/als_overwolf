# als_overwolf

First bit here, I'm just going to start to publish the schemas that we will use to communicate back and forth

## Match JSON
The Match JSON will be sent upon the completion of the match, it will have the match level data:
```json
{
  "player_name": "[DADS]GoshDarnedHero",
  "player_uid": 2533274947905327,
  "match_start_timestamp": 1644104907,
  "match_end_timestamp": 1644104942,
  "match_events": []
}
```

### Match Events
This is an array of events that happened in chronological order.  The basic struction will be:
```json
{
  "event_timestamp": 1644104907,
  "event_type": "match_state_event",
  "event_value": "match_start"
}
```
Each `event_type` will have a specific format

### Match Event Types
#### `match_state_event` valid values
`event_value` is a string, either `match_start` or `match_end`
```json
{
  "event_timestamp": 1644104907,
  "event_type": "match_state_event",
  "event_value": "match_start"
}
```
```json
{
  "event_timestamp": 1644104907,
  "event_type": "match_state_event",
  "event_value": "match_end"
}
