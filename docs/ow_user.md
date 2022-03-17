# User retrieval API

[Back to README](../README.md)

### **GET** - /ow_user

#### CURL

```sh
curl -X GET "https://apexlegendsstatus.com/ow_user" \
    -H "X-Api-Key: tPz7qGm!BFQN9Ah6SgKzr2RA"
```

#### Header Parameters

- **X-Api-Key** should be **string**

Example:
```
  "X-Api-Key": "tPz7qGm!BFQN9Ah6SgKzr2RA"
```

## Returns
### User found

```
200 (OK)
{"name":"GoshDarnedHero"}
```

### User not found
```
401 (Unauthorized)
{"message": "ERROR: Unauthorized"}
```
