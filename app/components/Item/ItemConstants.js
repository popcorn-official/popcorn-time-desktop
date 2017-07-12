export const REDUCER_NAME = 'item'

export const INITIAL_STATE = {
  fetchingEpisodeTorrents: false,
  isLoading              : false,
  item                   : null,
  playerStatus           : null,
}

export const FETCH_ITEM   = `${REDUCER_NAME}.fetch.item`
export const FETCHED_ITEM = `${REDUCER_NAME}.fetched.item`

export const FETCH_EPISODE_TORRENTS   = `${REDUCER_NAME}.fetch.episode.torrents`
export const FETCHED_EPISODE_TORRENTS = `${REDUCER_NAME}.fetched.episode.torrents`
