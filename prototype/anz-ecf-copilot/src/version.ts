import versionData from './version.json'

export const APP_NAME = 'ANZ ECF Union Prototype'
export const APP_VERSION = versionData.version

// version.json's timestamp is only updated by scripts/build-share.mjs when the version
// count is bumped — it does not change on every build, only on a version change.
const versionDate = new Date(versionData.timestamp)
const pad = (n: number) => String(n).padStart(2, '0')
export const VERSION_TIMESTAMP_LABEL = `${pad(versionDate.getDate())}/${pad(versionDate.getMonth() + 1)}/${versionDate.getFullYear()} ${pad(versionDate.getHours())}:${pad(versionDate.getMinutes())}`

export const VERSION_LABEL = `${APP_NAME} - Version ${APP_VERSION} - as at ${VERSION_TIMESTAMP_LABEL}`
