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
  ChevronDown,
  Clock,
  X,
} from 'lucide-react'
import { SeriesEditModal } from './SeriesEditModal'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, Movie } from '@/store'
import { toast } from 'sonner'
import { BottomNav } from '@/components/movie/BottomNav'

interface SeriesDetailContentProps {
  seriesId: string
}

interface Episode {
  id: string
  episodeNumber: number
  title: string
  thumbnailUrl?: string | null
  duration?: number | null
  overview?: string | null
  downloadLinks: { id: string; quality: string; url: string; source: string }[]
}

interface Season {
  id: string
  seasonNumber: number
  episodes: Episode[]
}

export function SeriesDetailContent({ seriesId }: SeriesDetailContentProps) {
  const router = useRouter()
  const {
    primaryColor,
    allDownloadEnabled,
    user,
    isBookmarked,
    addBookmark,
    removeBookmark,
  } = useAppStore()

  const [series, setSeries] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'synopsis' | 'cast'>('synopsis')
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null)

  const fetchSeries = useCallback(async () => {
    try {
      const res = await fetch(`/api/movies/${seriesId}`)
      const data = await res.json()
      if (data.success && data.data.isSeries) {
        setSeries(data.data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching series:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [seriesId, router])

  useEffect(() => {
    fetchSeries()
  }, [fetchSeries])

  const handleBack = () => {
    router.back()
  }

  const handleToggleBookmark = () => {
    if (!series) return
    
    if (isBookmarked(series.id)) {
      removeBookmark(series.id)
      toast.success('Removed from bookmarks')
    } else {
      addBookmark(series.id)
      toast.success('Added to bookmarks')
    }
  }

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(selectedEpisode?.id === episode.id ? null : episode)
  }

  const handleWatchEpisode = (episode: Episode) => {
    setPlayingEpisode(episode)
    setShowVideoPlayer(true)
  }

  const handleDelete = async () => {
    if (!series || !user?.isAdmin) return
    if (!confirm('Are you sure you want to delete this?')) return
    
    try {
      await fetch(`/api/movies/${series.id}`, { method: 'DELETE' })
      toast.success('Deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // Quality badge color mapping
  const getQualityColor = (quality: string) => {
    const q = quality.toLowerCase()
    if (q.includes('4k')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    if (q.includes('1080')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    if (q.includes('720')) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (q.includes('480')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Series not found</p>
      </div>
    )
  }

  const bookmarked = isBookmarked(series.id)
  const genres = series.genre ? series.genre.split(', ').filter(Boolean) : []
  const seasons: Season[] = series.series?.seasons || []
  const currentSeason = seasons.find(s => s.seasonNumber === selectedSeason) || seasons[0]

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Video Player Modal */}
      {showVideoPlayer && playingEpisode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Player Header */}
          <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowVideoPlayer(false)
                  setPlayingEpisode(null)
                }}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div>
                <p className="text-white font-semibold">Episode {playingEpisode.episodeNumber}</p>
                <p className="text-gray-400 text-sm">{playingEpisode.title || `Episode ${playingEpisode.episodeNumber}`}</p>
              </div>
            </div>
          </div>
          
          {/* Video Player Container */}
          <div className="flex-1 flex items-center justify-center bg-black">
            <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
              {/* Thumbnail Background */}
              {playingEpisode.thumbnailUrl && (
                <Image
                  src={playingEpisode.thumbnailUrl}
                  alt={playingEpisode.title || `Episode ${playingEpisode.episodeNumber}`}
                  fill
                  className="object-cover opacity-30"
                  unoptimized
                />
              )}
              
              {/* Play Button */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <Play className="w-10 h-10 text-black fill-black ml-1" />
                </div>
                <p className="text-white text-lg font-semibold">Ready to Play</p>
                <p className="text-gray-400 text-sm">Select a download server to watch</p>
              </div>
              
              {/* Duration Badge */}
              {playingEpisode.duration && (
                <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1.5 rounded-lg">
                  <span className="text-white text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {playingEpisode.duration} min
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Download Servers */}
          {allDownloadEnabled && playingEpisode.downloadLinks?.length > 0 && (
            <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
              <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">Select Server</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {playingEpisode.downloadLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <span className="text-white font-medium text-sm">{link.source || 'Server'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getQualityColor(link.quality)}`}>
                      {link.quality}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop Header */}
      <div className="relative w-full h-56">
        {series.backdropUrl ? (
          <Image
            src={series.backdropUrl}
            alt={series.title}
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
              {series.posterUrl ? (
                <Image
                  src={series.posterUrl}
                  alt={series.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Tv className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 pt-32 min-w-0">
            <h1 className="text-2xl font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">{series.title}</h1>
            
            <div className="flex items-center gap-3 mt-3">
              {/* Rating Badge */}
              <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2.5 py-1 rounded-lg border border-yellow-500/30">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-500 font-bold text-sm">{series.rating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>{series.year}</span>
                {seasons.length > 0 && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span>{seasons.length} Season{seasons.length > 1 ? 's' : ''}</span>
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
              {series.series?.status && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ 
                    borderColor: primaryColor, 
                    color: primaryColor,
                    backgroundColor: `${primaryColor}15`
                  }}
                >
                  {series.series.status}
                </span>
              )}
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
              activeTab === 'synopsis' ? 'text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            style={{ backgroundColor: activeTab === 'synopsis' ? primaryColor : undefined }}
          >
            Synopsis
          </button>
          <button
            onClick={() => setActiveTab('cast')}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'cast' ? 'text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            style={{ backgroundColor: activeTab === 'cast' ? primaryColor : undefined }}
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
              {series.overview || 'No synopsis available.'}
            </p>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
            {series.cast && series.cast.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {series.cast.map(c => (
                  <div key={c.id} className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-800 ring-2 ring-white/10 aspect-square">
                      {c.profileUrl ? (
                        <Image
                          src={c.profileUrl}
                          alt={c.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-xs mt-2 font-medium truncate">{c.name}</p>
                    <p className="text-gray-500 text-[11px] truncate">{c.character}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No cast information</p>
            )}
          </div>
        )}
      </div>

      {/* Episodes Section */}
      {seasons.length > 0 && (
        <div className="px-4 mt-8">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
            <Tv className="w-5 h-5" />
            EPISODES
          </h3>
          
          {/* Season Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            {seasons.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSeason(s.seasonNumber)
                  setSelectedEpisode(null)
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedSeason === s.seasonNumber
                    ? 'text-black shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }`}
                style={{
                  backgroundColor: selectedSeason === s.seasonNumber ? primaryColor : undefined
                }}
              >
                Season {s.seasonNumber}
              </button>
            ))}
          </div>

          {/* Episode List */}
          <div className="mt-3 space-y-2">
            {currentSeason?.episodes?.map(ep => (
              <div key={ep.id}>
                {/* Episode Card */}
                <button
                  onClick={() => handleEpisodeClick(ep)}
                  className={`w-full flex gap-3 p-3 rounded-xl transition-all ${
                    selectedEpisode?.id === ep.id 
                      ? 'bg-gray-800 ring-2 ring-white/20' 
                      : 'bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800/50'
                  }`}
                >
                  {/* Thumbnail with Play Overlay */}
                  <div className="w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 relative">
                    {ep.thumbnailUrl ? (
                      <Image
                        src={ep.thumbnailUrl}
                        alt={ep.title || `Episode ${ep.episodeNumber}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <Tv className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWatchEpisode(ep)
                        }}
                      >
                        <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                      </div>
                    </div>
                    {/* Episode Number Badge */}
                    <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                      {ep.episodeNumber}
                    </div>
                  </div>
                  
                  {/* Episode Info */}
                  <div className="flex-1 text-left min-w-0 py-0.5">
                    <p className="text-white text-sm font-semibold truncate">
                      {ep.title || `Episode ${ep.episodeNumber}`}
                    </p>
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                      {ep.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.duration} min
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Download Indicator */}
                  {allDownloadEnabled && ep.downloadLinks?.length > 0 && (
                    <div className="flex items-center px-1">
                      <Download className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                  )}
                </button>

                {/* Download Links (Expanded) */}
                {selectedEpisode?.id === ep.id && allDownloadEnabled && ep.downloadLinks?.length > 0 && (
                  <div className="mt-2 ml-2 bg-gray-900 rounded-xl overflow-hidden border border-gray-800/50">
                    {/* Watch Button */}
                    <button
                      onClick={() => handleWatchEpisode(ep)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-black font-semibold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Watch Episode {ep.episodeNumber}
                    </button>
                    
                    {/* Download Servers */}
                    <div className="p-3 space-y-2">
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Download Servers</p>
                      {ep.downloadLinks.map((link, idx) => (
                        <div 
                          key={link.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            idx % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-white text-sm font-medium">{link.source || `Server ${idx + 1}`}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getQualityColor(link.quality)}`}>
                              {link.quality}
                            </span>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black transition-transform hover:scale-105 active:scale-95"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
      <SeriesEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        series={series}
        onUpdate={fetchSeries}
      />

      <BottomNav />
    </div>
  )
}
