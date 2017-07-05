/**
 * A list of thumbnail poster images of items that are rendered on the home page
 * @flow
 */
import React from 'react'
import Card from './Card'
import Loader from '../loader/Loader'
import type { contentType } from '../../api/metadata/MetadataProviderInterface'

type Props = {
  title?: string,
  limit?: number,
  items: Array<contentType>,
  isLoading?: boolean,
  isFinished?: boolean
}

export default function CardList(props: Props) {
  const { items, isLoading, isFinished, title, limit } = props

  return (
    <div className="row">
      <div className="col-sm-12">
        {title && (
          <h4 className="CardList--header">
            {title}
          </h4>
        )}

        <div className="CardList">
          {(limit ? items.filter((e, i) => i < limit) : items).map(item =>
            <Card image={item.images.poster}
                  title={item.title}
                  id={item.id}
                  key={item.id}
                  year={item.year}
                  type={item.type}
                  rating={item.rating}
                  genres={item.genres} />
          )}
        </div>
      </div>

      <div className="col-sm-12">
        <Loader {...{ isLoading, isFinished }} />
      </div>
    </div>
  )
}

CardList.defaultProps = {
  title     : '',
  limit     : null,
  items     : [],
  isLoading : false,
  isFinished: false,
  starColor : '#848484',
}