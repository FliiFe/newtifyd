import {levels as l} from 'loglevel'
import fs from 'fs'
import log from './Logger'

let customconfig = {}
try {
    if (fs.existsSync(`${process.env.HOME}/.config/newtifyd/config.json`))
        customconfig = JSON.parse(fs.readFileSync(`${process.env.HOME}/.config/newtifyd/config.json`))
} catch (e) {
    log.error('User configuration file (~/.config/newtifyd/config.json) is not valid json')
}

export default Object.assign({
    height: 300,
    width: 370,
    monitor: 0,
    locale: 'en',
    devtools: false,
    serverPort: 3113,
    maxtimeout: 0,
    devServer: false,
    loglevel: l.WARN,
    closeonclick: false,
    allowlocalfiles: false,
}, customconfig)
