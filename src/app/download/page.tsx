'use client'

import Link from 'next/link'
import { ArrowLeft, Download, Info } from 'lucide-react'
import { useAppStore } from '@/store'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { BottomNav } from '@/components/movie/BottomNav'

export default function DownloadPage() {
  const { allDownloadEnabled, setAllDownloadEnabled, primaryColor } = useAppStore()

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
          <h1 className="text-xl font-bold text-white">Download Settings</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {/* All Download Toggle */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">All Download</Label>
              <p className="text-gray-400 text-xs mt-1">
                Enable to show download links in movie/series posts
              </p>
            </div>
            <Switch 
              checked={allDownloadEnabled}
              onCheckedChange={setAllDownloadEnabled}
              style={{ backgroundColor: allDownloadEnabled ? primaryColor : undefined }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 text-sm font-medium">How it works</p>
              <p className="text-gray-400 text-xs mt-1">
                When enabled, download links will be visible in movie and series detail pages.
                When disabled, a warning message will be shown instead.
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 text-center">
          {allDownloadEnabled ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm">Download links are now visible in posts</p>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">Download links are hidden. Enable to access downloads.</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
