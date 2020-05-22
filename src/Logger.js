import log from 'loglevel'
import prefix from 'loglevel-plugin-prefix'
import chalk from 'chalk'

const colors = {
    TRACE: chalk.magenta,
    DEBUG: chalk.cyan,
    INFO: chalk.blue,
    WARN: chalk.yellow,
    ERROR: chalk.red
}

prefix.reg(log)
log.enableAll()

prefix.apply(log, {
    format(level, name, timestamp) {
        return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](
            level
        )}`
    }
})
export default log
