import React from 'react'
import classNames from 'classnames'

import * as PlayerStatuses from 'api/Player/PlayerStatuses'
import * as TorrentStatuses from 'api/Torrent/TorrentStatuses'

import type { State, Props } from './ShowTypes'
import itemClasses from '../Item.scss'
import classes from './Show.scss'
import Seasons from './Seasons'

export class Show extends React.Component {

  props: Props

  state: State = {
    selectedSeason : null,
    selectedEpisode: null,
  }

  playEpisode = (torrent) => {
    if (torrent !== null) {
      const { play } = this.props

      play('default', torrent)

    } else {
      const { item, searchEpisodeTorrents } = this.props
      const season                          = this.getSeason()
      const episode                         = this.getEpisode()

      if (!episode.searched) {
        searchEpisodeTorrents(item, season.number, episode.number)
      }
    }
  }

  shouldDisableActions = () => {
    const { torrentStatus, playerStatus } = this.props

    return torrentStatus === TorrentStatuses.BUFFERING
           || torrentStatus === TorrentStatuses.DOWNLOADING
           || torrentStatus === TorrentStatuses.CONNECTING
           || playerStatus === PlayerStatuses.PAUSED
           || playerStatus === PlayerStatuses.CONNECTING
           || playerStatus === PlayerStatuses.PLAYING
           || playerStatus === PlayerStatuses.BUFFERING
  }

  selectSeasonAndEpisode = (selectSeason, selectEpisode = null) => {
    let episodeToSelect = selectEpisode
    if (episodeToSelect === null) {
      const season                = this.getSeason(selectSeason)
      const firstUnwatchedEpisode = this.getFirstUnwatchedEpisode(season)

      if (firstUnwatchedEpisode) {
        episodeToSelect = firstUnwatchedEpisode.number
      } else {
        episodeToSelect = 1
      }
    }

    this.setState({
      selectedSeason : selectSeason,
      selectedEpisode: episodeToSelect,
    })
  }

  getSeason = (selectedSeason = this.state.selectedSeason) => {
    const { item } = this.props

    if (!item.seasons || !item.seasons.length) {
      return null
    }

    if (selectedSeason !== null) {
      return item.seasons.find(season => season.number === selectedSeason)
    }

    return item.seasons.find(season => season.episodes.find(episode => !episode.watched))
  }

  getEpisode = (selectedEpisode = this.state.selectedEpisode) => {
    const season = this.getSeason()

    if (!season || !season.episodes) {
      return null
    }

    if (selectedEpisode !== null) {
      return season.episodes.find(episode => episode.number === selectedEpisode)
    }

    return this.getFirstUnwatchedEpisode()
  }

  getFirstUnwatchedEpisode = (season = null) => {
    let searchInSeason = season

    if (searchInSeason === null) {
      searchInSeason = this.getSeason()
    }

    const firstUnwatchedEpisode = searchInSeason.episodes.find(episode => !episode.watched)
    if (firstUnwatchedEpisode) {
      if (firstUnwatchedEpisode.aired < new Date().getTime()) {
        return firstUnwatchedEpisode

      } else {
        return searchInSeason.episodes.find(
          episode => episode.number === (firstUnwatchedEpisode.number - 1),
        )
      }
    }
  }

  render() {
    const { item, toggleWatched }     = this.props
    const { fetchingEpisodeTorrents } = this.props
    const season                      = this.getSeason()
    const selectedEpisode             = this.getEpisode()
    const { torrents, searched }      = selectedEpisode

    return (
      <div>
        <div
          style={{ opacity: this.shouldDisableActions() ? 0 : 1 }}
          className={classNames(itemClasses['item__row--show'], classes.show__actions)}>

          {torrents && Object.keys(torrents).map(quality => (
            <button
              key={quality}
              onClick={() => !fetchingEpisodeTorrents && !this.shouldDisableActions()
                ? this.playEpisode(torrents[quality])
                : null}
              className={classNames(
                'pct-btn pct-btn-trans pct-btn-outline pct-btn-round',
                { 'pct-btn-available': torrents[quality] !== null },
                { 'pct-btn-no-hover': fetchingEpisodeTorrents },
                { 'pct-btn-no-hover': torrents[quality] === null && searched },
              )}>

              {torrents[quality] !== null && !fetchingEpisodeTorrents && (
                <div>Play in {quality}</div>
              )}

              {torrents[quality] === null && !fetchingEpisodeTorrents && (
                <div>{(searched ? 'Did not found ' : 'Search for ') + quality}</div>
              )}

              {fetchingEpisodeTorrents && (
                <div>Searching for {quality}...</div>
              )}
            </button>
          ))}

        </div>

        <div className={itemClasses['item__row--show']}>
          <Seasons {...{
            seasons               : item.seasons,
            selectedSeason        : season,
            selectedEpisode,
            selectSeasonAndEpisode: this.selectSeasonAndEpisode,
            toggleWatched,
          }} />

        </div>
      </div>
    )
  }
}

export default Show
