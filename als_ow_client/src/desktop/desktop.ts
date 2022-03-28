import {AppWindow} from "../AppWindow";
import {isServiceUp, isValidAPIKey} from "../als";
import {serverStatusPingIntervalSeconds} from "../consts";

/**
 * Desktop window is the main app window
 */
class Desktop extends AppWindow {
    private static _instance: Desktop
    private _lastError: string
    private _fatalError: string
    private _isServiceAvailable: boolean = false

    private constructor() {
        super('desktop')

        const checkApiKeyButton = document.getElementById('check_api_key')
        const apiKeyInput = document.getElementById('api_key_input') as HTMLInputElement
        apiKeyInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
                const apiKey = apiKeyInput.value;
                this.saveAPIKeyIfValid(apiKey)
            }
        })
        checkApiKeyButton.addEventListener('click', () => {
            const apiKey = apiKeyInput.value;
            this.saveAPIKeyIfValid(apiKey)
        });
        const deleteApiKeyButton = document.getElementById('delete_api_key')
        deleteApiKeyButton.addEventListener('click', () => {
            this.apiKey = null
        })

        this.redrawAllElements()
        // check to see if the service is running
        setInterval(() => {
            this.checkServiceStatus()
        }, 1000 * serverStatusPingIntervalSeconds)
    }

    /**
     * Sets the apiKey on the local storage
     * @param apiKey
     * @private
     */
    private set apiKey(apiKey: string) {
        const currentKey = localStorage.getItem("apiKey")
        if (apiKey !== currentKey) {
            if (apiKey == null) {
                localStorage.removeItem('apiKey')
            } else {
                localStorage.setItem('apiKey', apiKey)
            }
            this.redrawApiKey()
        }
    }

    private get apiKey() {
        return localStorage.getItem("apiKey")
    }

    private set isServiceAvailable(serviceAvailable: boolean) {
        if (serviceAvailable != this._isServiceAvailable) {
            this._isServiceAvailable = serviceAvailable
            this.redrawServiceStatus()
        }
    }

    private get isServiceAvailable() {
        return this._isServiceAvailable
    }

    public static instance() {
        if (!this._instance) {
            this._instance = new Desktop()
        }
        return this._instance
    }

    /**
     * Validates the API Key, and saves it if it's valid
     *
     * @param apiKey - string: api key to save in local storage
     */
    private saveAPIKeyIfValid(apiKey: string) {
        function is_valid(data) {
            console.log("JHS: Updating Storage with key" + JSON.stringify(data))
            Desktop.instance().apiKey = apiKey
        }
        function is_not_valid(data) {
            console.log("JHS: Key not valid" + JSON.stringify(data))
            Desktop.instance()._lastError = "Incorrect Key entered"
        }
        function is_error(error) {
            console.error(error)
            Desktop.instance()._fatalError = "Error communicating to Apex Legends Server"
        }
        isValidAPIKey(apiKey, is_valid, is_not_valid, is_error)
    }

    private checkServiceStatus() {
        function success() {
            Desktop.instance().isServiceAvailable = true
        }
        function failure() {
            Desktop.instance().isServiceAvailable = false
        }
        // For now, we just call this API, either valid or invalid are considered 'success'
        isServiceUp(success, failure)
    }
    /**
     * Called after every change to the apiKey.
     *
     * This method will refresh all the elements in the view displaying the relevant information
     *
     * @private
     */
    private redrawApiKey() {
        // app_body and app_first_run are mutually exclusive
        let apiKey = this.apiKey
        if (!apiKey) {
            // hide the app body until we have an apiKey
            document.getElementById('app_body').style.display = 'none'
            document.getElementById('app_first_run').style.display = 'grid'
        } else {
            document.getElementById('app_first_run').style.display = 'none'
            document.getElementById('app_body').style.display = 'grid'
            let api_key_span = document.getElementById('api_key_span')
            api_key_span.innerHTML = apiKey
        }
    }

    private redrawErrorMessage() {
        // display the last error once
        const errDiv = document.getElementById('error_message') as HTMLDivElement
        if (this._lastError) {
            errDiv.innerHTML = this._lastError
            errDiv.style.display = 'block'
            this._lastError = ""
        } else {
            errDiv.style.display = 'none'
        }
    }

    private redrawServiceStatus() {
        let status_text_span = document.getElementById('status_text') as HTMLSpanElement
        if (this.isServiceAvailable) {
            status_text_span.className = "online"
            status_text_span.innerHTML = "online"
        } else {
            status_text_span.className = "offline"
            status_text_span.innerHTML = "offline"
        }
    }

    private redrawAllElements() {
        console.log("JHS: RedrawAllElements")
        this.redrawApiKey()
        this.redrawErrorMessage()
        this.redrawServiceStatus()
    }

    public async run() {
        console.log("JHS: Running")
    }
}

Desktop.instance().run().then()