import { AppWindow } from "../AppWindow";
const kWindowNames = {
    inGame: 'in_game',
    desktop: 'desktop'
}
// The desktop window is the window displayed while game is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.
new AppWindow(kWindowNames.desktop);
