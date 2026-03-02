'use client'

import { SeriesDetailContent } from '@/components/movie/SeriesDetailContent'

interface SeriesDetailClientProps {
  id: string
}

export function SeriesDetailClient({ id }: SeriesDetailClientProps) {
  return <SeriesDetailContent seriesId={id} />
}
