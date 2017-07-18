import debug from 'debug'

import type { ShowType } from 'api/Metadata/MetadataTypes'
import { TorrentProviderInterface } from './TorrentsProviderInterface'
import torrentProviders from './TorrentProviders'

const log = debug('api:torrents:adapter')

export class TorrentsAdapter implements TorrentProviderInterface {

  providers = torrentProviders()

  searchEpisode = (item: ShowType, season: string, episode: string) => {
    log(`Search episode ${episode} of season ${season} from the show ${item.title}`)

    return Promise.all(
      this.providers.map(provider => provider.searchEpisode(item, season, episode)),
    )
  }

  search = (search: string) => {
    log(`Search: ${search}`)

    return Promise.all(
      this.providers.map(provider => provider.search(search)),
    )
  }

}

export default TorrentsAdapter
