"use strict";

var _NotificationDaemon = _interopRequireDefault(require("./NotificationDaemon"));

var _NotificationStore = _interopRequireDefault(require("./NotificationStore"));

var _Frontend = _interopRequireDefault(require("./Frontend"));

var _loglevel = _interopRequireDefault(require("loglevel"));

var _loglevelPluginPrefix = _interopRequireDefault(require("loglevel-plugin-prefix"));

var _chalk = _interopRequireDefault(require("chalk"));

var _config = _interopRequireDefault(require("./config"));

var _os = require("os");

var _fs = require("mz/fs");

var _path = require("path");

var _datauri = _interopRequireDefault(require("datauri"));

var _fileType = _interopRequireDefault(require("file-type"));

var _IconRetreiver = require("./IconRetreiver");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const colors = {
  TRACE: _chalk.default.magenta,
  DEBUG: _chalk.default.cyan,
  INFO: _chalk.default.blue,
  WARN: _chalk.default.yellow,
  ERROR: _chalk.default.red
};

_loglevelPluginPrefix.default.reg(_loglevel.default);

_loglevel.default.enableAll();

_loglevel.default.setDefaultLevel(_config.default.loglevel);

_loglevelPluginPrefix.default.apply(_loglevel.default, {
  format(level, name, timestamp) {
    return `${_chalk.default.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)}`;
  }

});

const daemon = new _NotificationDaemon.default();
const store = new _NotificationStore.default();
const front = new _Frontend.default();

daemon.notify =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (notification) {
    _loglevel.default.debug(notification);

    notification.time = Date.now(); // Notification title and top text

    notification.title = notification.summary || notification.appname || '';
    notification.appname = notification.summary ? notification.appname.toLowerCase() : (0, _os.hostname)(); // Notification icon

    let imgpath = notification.hints['image-path'] || notification.hints['image_path'] || notification.app_icon;

    if (imgpath) {
      if ((0, _path.isAbsolute)(imgpath)) {
        imgpath = imgpath.replace('file://', '');
      } else {
        // Refers to a freedesktop icon. Unimplemented
        let path = (0, _IconRetreiver.findIcon)(imgpath);
        if (path) imgpath = path;
      } // We need to read it here, there is not enough time to wait for the frontend to do it


      let buff = yield (0, _fs.readFile)(imgpath).catch(e => _loglevel.default.error(e));

      if (buff) {
        let icon_ft = (0, _fileType.default)(buff);
        if (icon_ft.ext === 'xml') icon_ft.ext = 'svg';

        _loglevel.default.debug('Reading buffer as', icon_ft);

        let datauri = new _datauri.default();
        datauri.format('.' + icon_ft.ext, buff);
        notification.icon = datauri.content;
      }
    }

    if (notification.hints['image-data']) _loglevel.default.debug('Got image-data:', notification.hints.icon_data); // Register the notification in the store and get its id

    let id = store.add(notification);

    _loglevel.default.debug(`Assiging id ${id}`);

    return id;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

daemon.close = front.close = id => {
  _loglevel.default.debug('Closing notification', id);

  store.close(id);
};

front.action = (id, action) => {
  _loglevel.default.debug('Invoking action', action, 'on notification', id);

  daemon.invokeAction(id, action);
  store.close(id);
};

store.addUpdateListener(store => front.update(store));
process.on('unhandledRejection', r => _loglevel.default.error(r));