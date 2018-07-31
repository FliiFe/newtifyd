// Part of this file is taken from KELiON's cerebro-basic-apps plugin for cerebro.

import fs from 'fs';
import path from 'path';
import flatten from 'flatten';

const uniq = arr => arr.filter((v, i, a) => a.indexOf(v) === i); 

const appDirs = [
  path.join(process.env.HOME, '.local', 'share'),
  path.join('/usr', 'share'),
  path.join('/usr', 'share', 'ubuntu'),
  path.join('/usr', 'share', 'gnome'),
  path.join('/usr', 'local', 'share'),
  path.join('/var', 'lib', 'snapd', 'desktop')
]

// Icon resolutions in priority of checking
const iconResolutions = [
  'scalable',
  '1024x1024',
  '512x512',
  '256x256',
  '192x192',
  '128x128',
  '96x96',
  '72x72',
  '64x64',
  '48x48',
  '40x40',
  '36x36',
  '32x32',
  '24x24',
  '22x22',
  '20x20',
  '16x16'
]

// Directories when we are trying to find an icon
const iconDirs = uniq(flatten([
  ...iconResolutions.map(resolution => (
    appDirs.map(dir => path.join(dir, 'icons', 'hicolor', resolution, 'apps'))
  )),
  ...iconResolutions.map(resolution => (
    appDirs.map(dir => path.join(dir, 'icons', 'hicolor', resolution, 'status'))
  )),
  ...iconResolutions.map(resolution => (
    appDirs.map(dir => path.join(dir, 'icons', 'hicolor', resolution, 'devices'))
  )),
  ...iconResolutions.map(resolution => (
    appDirs.map(dir => path.join(dir, 'icons', 'hicolor', resolution, 'actions'))
  )),
  path.join('/usr', 'share', 'pixmaps'),
  path.join('/usr', 'share', 'app-install', 'icons')
])).filter(fs.existsSync)

const iconExtension = [
  'svg',
  'png'
]

export const findIcon = (icon) => {
  if (path.isAbsolute(icon)) {
    return icon
  }
  return flatten(iconExtension.map(ext =>
    iconDirs.map(dir => path.join(dir, `${icon}.${ext}`))
  )).find(fs.existsSync)
}
