'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Play,
  Download,
  Star,
  Bookmark,
  BookmarkCheck,
  User,
  Tv,
  Clock,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { MovieEditModal } from './MovieEditModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, Movie } from '@/store'
import { toast } from 'sonner'
import { BottomNav } from '@/components/movie/BottomNav'

interface MovieDetailContentProps {
  movieId: string
  type: 'movie' | 'series'
}

// Download link type
interface DownloadLink {
  id: string
  quality: string
  url: string
  source: string
}

export function MovieDetailContent({ movieId, type }: MovieDetailContentProps) {
  const router = useRouter()
  const {
    primaryColor,
    allDownloadEnabled,
    user,
    isBookmarked,
    addBookmark,
    removeBookmark,
  } = useAppStore()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'synopsis' | 'cast'>('synopsis')
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchMovie = useCallback(async () => {
    try {
      const res = await fetch(`/api/movies/${movieId}`)
      const data = await res.json()
      if (data.success) {
        setMovie(data.data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching movie:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [movieId, router])

  useEffect(() => {
    fetchMovie()
  }, [fetchMovie])

  const handleBack = () => {
    router.back()
  }

  const handleToggleBookmark = () => {
    if (!movie) return
    
    if (isBookmarked(movie.id)) {
      removeBookmark(movie.id)
      toast.success('Removed from bookmarks')
    } else {
      addBookmark(movie.id)
      toast.success('Added to bookmarks')
    }
  }

  const handleDelete = async () => {
    if (!movie || !user?.isAdmin) return
    if (!confirm('Are you sure you want to delete this?')) return
    
    try {
      await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' })
      toast.success('Deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // Quality badge color mapping
  const getQualityColor = (quality: string) => {
    const q = quality.toLowerCase()
    if (q.includes('4k')) return 'bg-purple-500/20 text-purple-400'
    if (q.includes('1080')) return 'bg-blue-500/20 text-blue-400'
    if (q.includes('720')) return 'bg-green-500/20 text-green-400'
    if (q.includes('480')) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Content not found</p>
      </div>
    )
  }

  const bookmarked = isBookmarked(movie.id)
  const genres = movie.genre ? movie.genre.split(', ').filter(Boolean) : []
  const downloadLinks: DownloadLink[] = movie.downloadLinks || []

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-56">
        {movie.backdropUrl ? (
          <Image
            src={movie.backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm z-10 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        {/* Bookmark Button */}
        <button
          onClick={handleToggleBookmark}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm z-10 border border-white/10"
        >
          {bookmarked ? (
            <BookmarkCheck className="w-5 h-5" style={{ color: primaryColor }} />
          ) : (
            <Bookmark className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Poster & Info Section */}
      <div className="relative px-4 -mt-28">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="w-[140px] flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/10">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  {movie.isSeries ? (
                    <Tv className="w-12 h-12 text-gray-600" />
                  ) : (
                    <User className="w-12 h-12 text-gray-600" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 pt-32 min-w-0">
            <h1 className="text-2xl font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">{movie.title}</h1>
            
            <div className="flex items-center gap-3 mt-3">
              {/* Rating Badge */}
              <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2.5 py-1 rounded-lg border border-yellow-500/30">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-500 font-bold text-sm">{movie.rating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>{movie.year}</span>
                {movie.duration && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {movie.duration} min
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {genres.map(g => (
                <span
                  key={g}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mt-8">
        <div className="flex bg-gray-900/80 rounded-xl p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('synopsis')}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'synopsis'
                ? 'text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            style={{
              backgroundColor: activeTab === 'synopsis' ? primaryColor : undefined
            }}
          >
            Synopsis
          </button>
          <button
            onClick={() => setActiveTab('cast')}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'cast'
                ? 'text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            style={{
              backgroundColor: activeTab === 'cast' ? primaryColor : undefined
            }}
          >
            Cast List
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-5">
        {activeTab === 'synopsis' ? (
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
            <p className="text-gray-300 text-sm leading-relaxed">
              {movie.overview || 'No synopsis available.'}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
            {movie.cast && movie.cast.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {movie.cast.map(c => (
                  <div key={c.id} className="text-center">
                    <div className="w-18 h-18 mx-auto rounded-full overflow-hidden bg-gray-800 ring-2 ring-white/10 aspect-square">
                      {c.profileUrl ? (
                        <Image
                          src={c.profileUrl}
                          alt={c.name}
                          width={72}
                          height={72}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-7 h-7 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-xs mt-2 font-medium truncate">{c.name}</p>
                    <p className="text-gray-500 text-[11px] truncate">{c.character}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No cast information available</p>
            )}
          </div>
        )}
      </div>

      {/* Download Warning */}
      {!allDownloadEnabled && (
        <div className="px-4 mt-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-xs font-medium">
              ⚠️ Enable &quot;All Download&quot; in Menu → Download to access download links
            </p>
          </div>
        </div>
      )}

      {/* Download Section */}
      {allDownloadEnabled && downloadLinks.length > 0 && (
        <div className="px-4 mt-8">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
            <Download className="w-5 h-5" />
            DOWNLOAD
          </h3>
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800/50">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_auto_auto] bg-gray-800/80 text-xs font-semibold text-gray-300">
              <div className="px-4 py-3">Server</div>
              <div className="px-4 py-3 text-center">Quality</div>
              <div className="px-4 py-3 text-center">Action</div>
            </div>
            {/* Table Rows */}
            {downloadLinks.map((link, index) => (
              <div 
                key={link.id} 
                className={`grid grid-cols-[1fr_auto_auto] text-sm items-center transition-colors hover:bg-gray-800/50 ${
                  index % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-900/30'
                }`}
              >
                <div className="px-4 py-3.5 text-white font-medium">{link.source || `Server ${index + 1}`}</div>
                <div className="px-4 py-3.5 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getQualityColor(link.quality)}`}>
                    {link.quality}
                  </span>
                </div>
                <div className="px-4 py-3.5 text-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {user?.isAdmin && (
        <div className="px-4 mt-8 flex gap-3">
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-white text-sm font-semibold border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/30 hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <MovieEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        movie={movie}
        onUpdate={fetchMovie}
      />

      <BottomNav />
    </div>
  )
}
