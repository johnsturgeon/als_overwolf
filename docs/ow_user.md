# User retrieval API

[Back to README](../README.md)

### **GET** - /ow_user

#### CURL

```sh
curl -X GET "https://apexlegendsstatus.com/systems/overwolf/ow_user" \
    -H "X-Api-Key: tPz7qGm!BFQN9Ah6SgKzr2RA"
```

#### Header Parameters

- **X-Api-Key**: `string` _valid api key_

Example:
```
  "X-Api-Key": "tPz7qGm!BFQN9Ah6SgKzr2RA"
```

## Returns
### API Key found

```
200 (OK)
{"name":"GoshDarnedHero"}
```

### API Key not found
```
401 (Unauthorized)
{"message": "ERROR: Unauthorized"}
```
