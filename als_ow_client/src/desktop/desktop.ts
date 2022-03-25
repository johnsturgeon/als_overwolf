import {AppWindow} from "../AppWindow";
import {isValidAPIKey} from "../als";
// The desktop window is the window displayed while game is not running.

class Desktop extends AppWindow {
    private static _instance: Desktop
    private _lastError: string
    private _fatalError: string


    private constructor() {
        super('desktop')

        const checkApiKeyButton = document.getElementById('check_api_key')
        const apiKeyInput = document.getElementById('api_key_input') as HTMLInputElement
        apiKeyInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
                const apiKey = apiKeyInput.value;
                this.saveAPIKeyIfValid(apiKey)
                this.redrawView()
            }
        })
        checkApiKeyButton.addEventListener('click', () => {
            const apiKey = apiKeyInput.value;
            this.saveAPIKeyIfValid(apiKey)
            this.redrawView()
        });
        const deleteApiKeyButton = document.getElementById('delete_api_key')
        deleteApiKeyButton.addEventListener('click', () => {
            Desktop.deleteAPIKey()
            this.redrawView()
        })
        this.redrawView()
    }

    public static instance() {
        if (!this._instance) {
            this._instance = new Desktop()
        }
        return this._instance
    }

    /**
     * Saves an API Key to local storage.
     *
     * @param apiKey - string: api key to save in local storage
     */
    private saveAPIKeyIfValid(apiKey: string) {
        function is_valid(data) {
            console.log("JHS: Updating Storage with key" + JSON.stringify(data))
            localStorage.setItem("apiKey", apiKey)
            Desktop.instance().redrawView()
        }
        function is_not_valid(data) {
            console.log("JHS: Key not valid" + JSON.stringify(data))
            Desktop.instance()._lastError = "Incorrect Key entered"
            Desktop.instance().redrawView()
        }
        function is_error(error) {
            console.error(error)
            Desktop.instance()._fatalError = "Error communicating to Apex Legends Server"
            Desktop.instance().redrawView()
        }
        isValidAPIKey(apiKey, is_valid, is_not_valid, is_error)
    }

    /**
     * Returns the saved api key from local storage
     *
     * @return api key from local storage
     */
    public getAPIKey(): string {
        return localStorage.getItem("apiKey")
    }


    /**
     * Called after every change to the state.
     *
     * This method will refresh all the elements in the view displaying the relevant information
     *
     * @private
     */
    private redrawView() {
        // hide all 'dynamic' elements
        const dynamicElements = document.getElementsByClassName('dynamicElement')
        for (let i=0; i < dynamicElements.length; i++) {
            const dynEle = dynamicElements[i] as HTMLElement;
            dynEle.style.display = 'none'
        }
        // First, either show the API key entry box, or the known API key
        let apiKey = this.getAPIKey()
        if (apiKey) {
            document.getElementById('app_body').style.display = 'block'
            let api_key_span = document.getElementById('api_key_span')
            api_key_span.innerHTML = apiKey
        } else {
            document.getElementById('app_api_key_entry').style.display = 'block'
        }
        // display the last error once
        if (this._lastError) {
            const errDiv = document.getElementById('error_message') as HTMLDivElement
            errDiv.innerHTML = this._lastError
            errDiv.style.display = 'block'
            this._lastError = ""
        }
    }

    private static deleteAPIKey() {
        localStorage.removeItem('apiKey')
    }

    public async run() {
        console.log("JHS: Running")
    }
}

Desktop.instance().run().then()