import express from 'express'
import {app, BrowserWindow, shell, ipcMain, screen, protocol} from 'electron'
import log from './Logger'
import config from './config'

export default class Frontend {
    constructor() {
        const server = (this.server = express())

        server.use(express.static('./front/dist'))
        server.use('/localfs', express.static('/', {dotfiles: 'allow'}))
        // server.use('/fs/', express.static('/'));

        // Necessary for transparency
        // app.disableHardwareAcceleration()
        app.commandLine.appendSwitch('enable-transparent-visuals')
        // TODO: find out how to grab pictures from fs
        protocol.registerSchemesAsPrivileged([{
            scheme: 'file',
            privileges: {
                standard: true,
                secure: true,
                corsEnabled: true,
                bypassCSP: true
            }
        }])

        server.listen(config.serverPort, () => {
            log.info(`Frontend running on port ${config.serverPort}`)

            app.on('ready', () => setTimeout(() => {
                let {bounds} = screen.getAllDisplays()[config.monitor]
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
                        nodeIntegration: true,
                    },
                })
                this.win.webContents.on('will-navigate', (ev, url) => {
                    ev.preventDefault()
                    shell.openExternal(url)
                })
                this.win.loadURL(`http://localhost:${config.devServer ? '8080' : config.serverPort}/`)
                // Uncomment this to open frontend dev tools
                if (config.devtools) this.win.openDevTools()
                ipcMain.on('close', (_, id) => this._close(id))
                ipcMain.on('action', (_, action, id) => this._action(id, action))

                // There is no notification on startup.
                // The frontend will show the window when there is one.
                this.win.hide()
            }, 500))
        })
    }
    update(store) {
        if (!this.win || !this.win.webContents) return
        this.win.webContents.send('update', store)
        if (Object.keys(store).length) this.win.show()
        else setTimeout(() => this.win.hide(), 600)
        this.win.webContents.send('config', config)
    }
    set close(fun) {
        this._close = fun
    }
    set action(fun) {
        this._action = fun
    }
}
