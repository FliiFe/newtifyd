import express from 'express';
import { app, BrowserWindow, protocol, ipcMain, screen } from 'electron';
import { info, debug } from 'loglevel';
import config from './config';

export default class Frontend {
    constructor() {
        const server = (this.server = express());

        server.use(express.static('./front/dist'));
        // server.use('/fs/', express.static('/'));

        // Necessary for transparency
        app.disableHardwareAcceleration();

        server.listen(config.serverPort, () => {
            info(`Frontend running on port ${config.serverPort}`);

            app.on('ready', () => {
                let {bounds} = screen.getAllDisplays()[config.monitor];
                protocol.unregisterProtocol('', () => {
                    this.win = new BrowserWindow({
                        x: bounds.width - config.width,
                        y: bounds.height - config.height,
                        width: config.width,
                        height: config.height,
                        frame: false,
                        transparent: true,
                        focusable: false,
                        resizable: false,
                        webPreferences: {
                            // Allow loading of local resources
                            webSecurity: false,
                        },
                    });
                    this.win.loadURL(`http://localhost:${config.devServer ? '8080' : config.serverPort}/`);
                    // Uncomment this to open frontend dev tools
                    if (config.devtools) this.win.openDevTools();
                    ipcMain.on('close', (sender, id) => this._close(id));
                    ipcMain.on('action', (sender, id, action) => this._action(id, action));

                    // There is no notification on startup.
                    // The frontend will show the window when there is one.
                    this.win.hide();
                });
            });
        })
    }
    update(store) {
        this.win.webContents.send('update', store);
    }
    set close(fun) {
        this._close = fun;
    }
    set action(fun) {
        this._action = fun;
    }
}
