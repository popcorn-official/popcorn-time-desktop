/**
 * Torrents controller, responsible for playing, stoping, etc
 * @flow
 */
import os from 'os'
import WebTorrent from 'webtorrent'
import debug from 'debug'

import Events from 'api/Events'
import * as TorrentEvents from './TorrentEvents'
import * as TorrentStatuses from './TorrentStatuses'

const log  = debug('api:torrent')
const port = 9091

export class Torrent {

  status: string = TorrentStatuses.NONE

  cacheLocation: string

  inProgress: boolean = false

  checkBufferInterval: number
  checkDownloadInterval: number

  engine: WebTorrent

  server: {
    close: () => void,
    listen: (port: number) => void
  }

  constructor() {
    this.engine        = new WebTorrent({ maxConns: 20 })
    this.cacheLocation = os.tmpdir()
  }

  start(magnetURI: string, metadata: MetadataType, supportedFormats: Array<string>) {
    if (this.inProgress) {
      throw new Error('Torrent already in progress')
    }

    this.inProgress = true

    this.updateStatus(TorrentStatuses.CONNECTING)

    log(`Using ${this.cacheLocation} to save the file!`)
    this.engine.add(magnetURI, { path: this.cacheLocation }, (torrent) => {
      if (!this.server) {
        const server = torrent.createServer()
        server.listen(port)
        this.server = server
      }

      const { files } = torrent

      const { file, torrentIndex } = files.reduce((previous, current, index) => {
          const formatIsSupported = !!supportedFormats.find(format => current.name.includes(format))

          if (formatIsSupported) {
            if (previous !== 'undefined' && current.length > previous.file.length) {
              previous.file.deselect()
            }

            return {
              file        : current,
              torrentIndex: index,
            }
          } else {
            return previous
          }
        },
        { file: files[0], torrentIndex: 0 },
      )

      if (typeof torrentIndex !== 'number') {
        console.warn('File List', torrent.files.map(_file => _file.name))
        throw new Error(`No torrent could be selected. Torrent Index: ${torrentIndex}`)
      }

      file.select()

      this.checkBufferInterval = this.bufferInterval({ torrent, torrentIndex, metadata })
    })
  }

  clearIntervals = () => {
    if (this.checkBufferInterval) {
      clearInterval(this.checkBufferInterval)
    }

    if (this.checkDownloadInterval) {
      clearInterval(this.checkDownloadInterval)
    }
  }

  bufferInterval = ({ torrent, torrentIndex, metadata }) => setInterval(() => {
    const toBuffer = (1024 * 1024) * 50

    if (torrent.downloaded > toBuffer) {
      this.updateStatus(TorrentStatuses.BUFFERED, {
        metadata,
        uri: `http://localhost:${port}/${torrentIndex}`,
      })

      this.clearIntervals()
      this.checkBufferInterval = this.downloadInterval({ torrent, torrentIndex, metadata })

    } else {
      this.updateStatus(TorrentStatuses.BUFFERING)

      Events.emit(TorrentEvents.BUFFERING, {
        downloaded   : torrent.downloaded,
        toDownload   : toBuffer,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed  : torrent.uploadSpeed,
        peers        : torrent.numPeers,
        ratio        : torrent.ratio,
      })
    }

  }, 1000)

  downloadInterval = ({ torrent, torrentIndex, metadata }) => setInterval(() => {
    if (torrent.downloaded >= torrent.length) {
      log('Download complete...')

      this.updateStatus(TorrentStatuses.DOWNLOADED, {
        metadata,
        uri: `http://localhost:${port}/${torrentIndex}`,
      })
      this.clearIntervals()

    } else {
      this.updateStatus(TorrentStatuses.DOWNLOADING)

      Events.emit(TorrentEvents.DOWNLOADING, {
        downloaded   : torrent.downloaded,
        toDownload   : torrent.length,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed  : torrent.uploadSpeed,
        peers        : torrent.numPeers,
        ratio        : torrent.ratio,
      })
    }
  }, 1000)

  updateStatus = (newStatus, data = {}) => {
    if (this.status !== newStatus) {
      log(`Update status to ${newStatus}`)

      Events.emit(TorrentEvents.STATUS_CHANGE, {
        oldStatus: this.status,
        newStatus,
        ...data
      })

      this.status = newStatus
    }
  }

  destroy() {
    if (this.inProgress) {
      console.log('Destroyed Torrent...')

      if (this.server && typeof this.server.close === 'function') {
        this.server.close()
        this.server = {}
      }

      this.clearIntervals()

      this.inProgress = false
    }
  }
}

export const instance = new Torrent()

export default instance
