import { AppWindow } from "../AppWindow";
import {kUrls} from "../consts";
// The desktop window is the window displayed while game is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.

class Desktop extends AppWindow {
    private static _instance: Desktop
    private _api_key: string

    private constructor() {
        super('desktop')

        let checkApiKeyButton = document.getElementById('check_api_key')
        checkApiKeyButton.addEventListener('click', () => {
            const apiKey = (document.getElementById('api_key') as HTMLInputElement).value;
            this.saveAPIKey(apiKey)
        });
        let deleteApiKeyButton = document.getElementById('delete_api_key')
        deleteApiKeyButton.addEventListener('click', () => {
            Desktop.deleteAPIKey()
            this.showHideAPIKey()
        })
        this.showHideAPIKey()
    }

    public static instance() {
        if (!this._instance) {
            this._instance = new Desktop()
        }
        return this._instance
    }

    public saveAPIKey(apiKey: string) {
        function success(response: object) {
            console.log("JHS: Updating Storage with key" + JSON.stringify(response))
            localStorage.setItem( "apiKey", apiKey )
        }
        this.isValidAPIKey(apiKey, success)

    }

    public getAPIKey() {
        return localStorage.getItem( "apiKey" )
    }

    public isValidAPIKey(apiKey: string, on_success: Function) {
        let url = kUrls.als_ow_user
        let xhr = new XMLHttpRequest()
        xhr.onreadystatechange = (e) => {
            if(xhr.status == 200) {
                console.log("JHS: Request sent, response OK")
                console.log("JHS: " + xhr.responseText)
                on_success(xhr)
            } else {
                console.warn("JHS: Request sent, failed")
                console.log("JHS: " + xhr.responseText)
            }
        }
        xhr.open("GET", url)
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.setRequestHeader('X-Api-Key', apiKey)
        xhr.send("{}")
    }

    private showHideAPIKey() {
        console.log("JHS: showHideAPI Key")
        let apiKey = this.getAPIKey()
        if(apiKey) {
            console.log("JHS: Got API Key")
            document.getElementById('api_key_entry').style.display = 'none'
            document.getElementById('api_key_info').style.display = 'block'
            let api_key_span = document.getElementById('api_key_span')
            api_key_span.innerHTML = apiKey
        } else {
            console.log("JHS: Did not get API Key")
            document.getElementById('api_key_info').style.display = 'none'
            document.getElementById('api_key_entry').style.display = 'block'
        }
    }

    private static deleteAPIKey() {
        localStorage.removeItem('apiKey')
    }

    public async run() {
        console.log("JHS: Running")
    }
}

Desktop.instance().run()