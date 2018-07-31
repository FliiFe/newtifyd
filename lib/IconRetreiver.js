"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findIcon = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _flatten = _interopRequireDefault(require("flatten"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Part of this file is taken from KELiON's cerebro-basic-apps plugin for cerebro.
const uniq = arr => arr.filter((v, i, a) => a.indexOf(v) === i);

const appDirs = [_path.default.join(process.env.HOME, '.local', 'share'), _path.default.join('/usr', 'share'), _path.default.join('/usr', 'share', 'ubuntu'), _path.default.join('/usr', 'share', 'gnome'), _path.default.join('/usr', 'local', 'share'), _path.default.join('/var', 'lib', 'snapd', 'desktop')]; // Icon resolutions in priority of checking

const iconResolutions = ['scalable', '1024x1024', '512x512', '256x256', '192x192', '128x128', '96x96', '72x72', '64x64', '48x48', '40x40', '36x36', '32x32', '24x24', '22x22', '20x20', '16x16']; // Directories when we are trying to find an icon

const iconDirs = uniq((0, _flatten.default)([...iconResolutions.map(resolution => appDirs.map(dir => _path.default.join(dir, 'icons', 'hicolor', resolution, 'apps'))), ...iconResolutions.map(resolution => appDirs.map(dir => _path.default.join(dir, 'icons', 'hicolor', resolution, 'status'))), ...iconResolutions.map(resolution => appDirs.map(dir => _path.default.join(dir, 'icons', 'hicolor', resolution, 'devices'))), ...iconResolutions.map(resolution => appDirs.map(dir => _path.default.join(dir, 'icons', 'hicolor', resolution, 'actions'))), _path.default.join('/usr', 'share', 'pixmaps'), _path.default.join('/usr', 'share', 'app-install', 'icons')])).filter(_fs.default.existsSync);
const iconExtension = ['svg', 'png'];

const findIcon = icon => {
  if (_path.default.isAbsolute(icon)) {
    return icon;
  }

  return (0, _flatten.default)(iconExtension.map(ext => iconDirs.map(dir => _path.default.join(dir, `${icon}.${ext}`)))).find(_fs.default.existsSync);
};

exports.findIcon = findIcon;