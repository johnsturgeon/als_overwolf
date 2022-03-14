import { AppWindow } from "../AppWindow";
// The desktop window is the window displayed while game is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.
new AppWindow('desktop');

class Desktop extends AppWindow {
    private static _instance: Desktop;

    public saveAPIKey(key) {
        localStorage.setItem( "apiKey", key );
    }

    public getAPIKey() {
        return localStorage.getItem( "firstname" )
    }

    public async run() {
        console.log("JHS: Running")
    }
}

