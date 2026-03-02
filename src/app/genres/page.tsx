'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Grid } from 'lucide-react'
import { useAppStore, Movie } from '@/store'
import { MovieCard } from '@/components/movie/MovieCard'
import { SeriesCard } from '@/components/movie/SeriesCard'
import { BottomNav } from '@/components/movie/BottomNav'
import { Badge } from '@/components/ui/badge'

const SAMPLE_MOVIES: Movie[] = [
  { id: '1', title: 'The Dark Knight', overview: '', posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdropUrl: '', rating: 9.0, year: 2008, duration: 152, genre: 'Action, Crime, Drama', language: 'en', isSeries: false, isFeatured: false, isTrending: true, isIconic: true, cast: [], downloadLinks: [] },
  { id: '2', title: 'Inception', overview: '', posterUrl: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep9B1QDKYHz.jpg', backdropUrl: '', rating: 8.8, year: 2010, duration: 148, genre: 'Action, Science Fiction, Adventure', language: 'en', isSeries: false, isFeatured: false, isTrending: true, isIconic: true, cast: [], downloadLinks: [] },
  { id: '3', title: 'Interstellar', overview: '', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdropUrl: '', rating: 8.7, year: 2014, duration: 169, genre: 'Adventure, Drama, Science Fiction', language: 'en', isSeries: false, isFeatured: false, isTrending: false, isIconic: true, cast: [], downloadLinks: [] },
  { id: '4', title: 'Breaking Bad', overview: '', posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', backdropUrl: '', rating: 9.0, year: 2008, duration: 47, genre: 'Drama, Crime', language: 'en', isSeries: true, isFeatured: false, isTrending: true, isIconic: true, cast: [], downloadLinks: [], series: { id: 's1', status: 'Ended', seasons: [] } },
  { id: '5', title: 'Game of Thrones', overview: '', posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', backdropUrl: '', rating: 8.5, year: 2011, duration: 60, genre: 'Drama, Fantasy, Action', language: 'en', isSeries: true, isFeatured: false, isTrending: true, isIconic: false, cast: [], downloadLinks: [], series: { id: 's2', status: 'Ended', seasons: [] } },
]

export default function GenresPage() {
  const { primaryColor } = useAppStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('/api/movies', { cache: 'no-store' })
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setMovies(data.data)
        } else {
          setMovies(SAMPLE_MOVIES)
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error)
        setMovies(SAMPLE_MOVIES)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Get all genres
  const allGenres = useMemo(() => {
    return [...new Set(movies.flatMap(m => m.genre.split(', ')))].filter(Boolean).sort()
  }, [movies])

  // Filter movies by selected genre
  const filteredMovies = useMemo(() => {
    if (!selectedGenre) return []
    return movies.filter(m => m.genre.includes(selectedGenre))
  }, [movies, selectedGenre])

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-4">
          <Link 
            href="/"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-white">Genres</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 py-4">
              {allGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                  className="px-3 py-1.5 rounded-full text-sm transition-all"
                  style={{
                    backgroundColor: selectedGenre === genre ? primaryColor : 'rgb(55, 65, 81)',
                    color: selectedGenre === genre ? 'black' : 'white',
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Selected Genre Results */}
            {selectedGenre && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-white mb-3">
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'result' : 'results'} for &quot;{selectedGenre}&quot;
                </h2>
                
                {filteredMovies.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {filteredMovies.map(movie => (
                      movie.isSeries ? (
                        <SeriesCard key={movie.id} series={movie} showGenre />
                      ) : (
                        <MovieCard key={movie.id} movie={movie} showGenre />
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Grid className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No movies found</p>
                  </div>
                )}
              </div>
            )}

            {/* No Genre Selected */}
            {!selectedGenre && (
              <div className="text-center py-12">
                <Grid className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a genre to browse</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
