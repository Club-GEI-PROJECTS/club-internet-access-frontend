/**
 * Utilitaire de log pour Club Internet Access
 * Préfixe [ClubIA] pour filtrer facilement dans la console
 */

const PREFIX = '[ClubIA]'

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.info(`${PREFIX} [INFO]`, message, ...args)
  },
  log: (message: string, ...args: unknown[]) => {
    console.log(`${PREFIX}`, message, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${PREFIX} [WARN]`, message, ...args)
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`${PREFIX} [ERROR]`, message, ...args)
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${PREFIX} [DEBUG]`, message, ...args)
    }
  },
}
