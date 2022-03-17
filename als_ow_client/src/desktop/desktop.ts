import { AppWindow } from "../AppWindow";
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
            this.saveAPIKey((document.getElementById('api_key') as HTMLInputElement).value)
            this.showHideAPIKey()
        });

        this.showHideAPIKey()
    }

    public static instance() {
        if (!this._instance) {
            this._instance = new Desktop()
        }
        return this._instance
    }

    public saveAPIKey(key) {
        localStorage.setItem( "apiKey", key )
    }

    public getAPIKey() {
        return localStorage.getItem( "apiKey" )
    }

    private showHideAPIKey() {
        let apiKey = this.getAPIKey()
        if(apiKey) {
            document.getElementById('api_key_entry').style.display = 'none'
            let api_key_info = document.getElementById('api_key_info')
            api_key_info.innerHTML = "blah: " + apiKey
        } else {
            document.getElementById('api_key_info').style.display = 'none'
        }
    }

    public async run() {
        console.log("JHS: Running")
    }
}

Desktop.instance().run()