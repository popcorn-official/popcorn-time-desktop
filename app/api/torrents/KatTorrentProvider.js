import { determineQuality } from './BaseTorrentProvider';
import kat from 'kat-api';


export default class KatTorrentProvider {

  static fetch(imdbId) {
    return kat.search({
      query: 'mp4',
      sort_by: 'seeders',
      order: 'desc',
      imdb: imdbId,
      verified: 1,
      language: 'en'
    })
    .then(data => data.results)
    .catch(error => {
      console.log(error);
      return [];
    });
  }

  static formatMovie(movie) {
    return {
      quality: determineQuality(movie.magnet),
      magnet: movie.magnet,
      seeders: movie.seeds,
      leechers: movie.leechs
    };
  }

  static provide(imdbId) {
    return this.fetch(imdbId)
      .then(
        results => results.splice(0, 10).map(this.formatMovie)
      )
      .catch(error => {
        console.log(error);
      });
  }
}