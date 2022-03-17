# API Key

[Back to README](../README.md)

I'm assuming that we will want to prevent DOS attacks etc against all the endpoints, so the best way to prevent that would be an API key in the header.

All messages from the Overwolf app to the ALS server must have a valid API Key.
Header is in the form of:
```http request
X-Api-Key: <api key>
```
The only way a user can get a valid is to log in to their account: https://apexlegendsstatus.com/account/overview and request one.

This is *NOT* the same as the API Key used for the Apex Legends Status API.

