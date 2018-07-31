"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _electron = require("electron");

var _loglevel = require("loglevel");

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Frontend {
  constructor() {
    const server = this.server = (0, _express.default)();
    server.use(_express.default.static('./front/dist')); // server.use('/fs/', express.static('/'));
    // Necessary for transparency

    _electron.app.disableHardwareAcceleration();

    server.listen(_config.default.serverPort, () => {
      (0, _loglevel.info)(`Frontend running on port ${_config.default.serverPort}`);

      _electron.app.on('ready', () => {
        let bounds = _electron.screen.getAllDisplays()[_config.default.monitor].bounds;

        _electron.protocol.unregisterProtocol('', () => {
          this.win = new _electron.BrowserWindow({
            x: bounds.width - _config.default.width,
            y: bounds.height - _config.default.height,
            width: _config.default.width,
            height: _config.default.height,
            frame: false,
            transparent: true,
            focusable: false,
            resizable: false,
            webPreferences: {
              // Allow loading of local resources
              webSecurity: false
            }
          });
          this.win.loadURL(`http://localhost:${_config.default.devServer ? '8080' : _config.default.serverPort}/`); // Uncomment this to open frontend dev tools

          if (_config.default.devtools) this.win.openDevTools();

          _electron.ipcMain.on('close', (sender, id) => this._close(id));

          _electron.ipcMain.on('action', (sender, id, action) => this._action(id, action)); // There is no notification on startup.
          // The frontend will show the window when there is one.


          this.win.hide();
        });
      });
    });
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

exports.default = Frontend;