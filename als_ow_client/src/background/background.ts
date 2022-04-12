import {
    OWGameListener,
    OWWindow
} from '@overwolf/overwolf-api-ts';

import AppLaunchTriggeredEvent = overwolf.extensions.AppLaunchTriggeredEvent;

class BackgroundController {
    private static _instance: BackgroundController
    private _gameListener: OWGameListener
    private _desktopWindow: OWWindow
    private _inGameWindow: OWWindow

    private constructor() {
        // When a supported game is started or is ended, toggle the app's windows
        this._desktopWindow = new OWWindow('desktop');
        this._inGameWindow = new OWWindow('in_game');

        // When supported game is started or is ended, toggle the app's windows
        this._gameListener = new OWGameListener({
            onGameStarted: this.onGameStarted.bind(this),
            onGameEnded: BackgroundController.onGameEnded.bind(this)
        });
        overwolf.extensions.onAppLaunchTriggered.addListener(
            e => BackgroundController.onAppLaunchTriggered(e)
        );
    };

    // Implementing the Singleton design pattern
    public static instance(): BackgroundController {
        if (!BackgroundController._instance) {
            BackgroundController._instance = new BackgroundController();
        }

        return BackgroundController._instance;
    }

    /***
     * When running the app, start listening to games' status and decide which window should
     * be launched first, based on whether a supported game is currently running
     */
    public async run() {
        this._gameListener.start();
        this._desktopWindow.restore()
    }

    /**
     * When the game starts, go ahead and launch the in_game listener window
     *
     * @param game
     * @private
     */
    private onGameStarted(game) {
        // this._inGameWindow = new OWWindow('in_game')
        this._inGameWindow.restore()
    }

    /**
     * Shut down when the game ends
     *
     * @param game
     * @private
     */
    private static onGameEnded(game) {
        overwolf.windows.getMainWindow().close()
    }

    private static async onAppLaunchTriggered(e: AppLaunchTriggeredEvent) {
        console.log('onAppLaunchTriggered():', e);
        if (!e || e.origin.includes('gamelaunchevent')) {
            return;
        }
    }
}

BackgroundController.instance().run().then();
