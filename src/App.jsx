import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function App() {
  const [models, setModels] = useState([])
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')

  useEffect(() => {
    const fetchModels = async () => {
      try {
        if (!BACKEND_URL) return
        const params = new URLSearchParams()
        if (query) params.append('q', query)
        if (activeTag) params.append('tag', activeTag)
        const res = await fetch(`${BACKEND_URL}/models?${params.toString()}`)
        const data = await res.json()
        setModels(data)
      } catch (e) {
        console.error('Failed to load models', e)
      }
    }
    fetchModels()
  }, [query, activeTag])

  const tags = ['stylized','fantasy','sci-fi','mech','game-ready','PBR']

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero with Spline cover */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/atN3lqky4IzF-KEP/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-slate-900/0 pointer-events-none" />
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-lg">3D Character Shop</h1>
          <p className="mt-3 text-slate-200 max-w-2xl">Gaming-ready, rigged and stylized characters. Download in FBX/GLB/OBJ formats.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search characters..."
              className="w-full sm:w-80 rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-3 outline-none focus:ring-2 focus:ring-fuchsia-400/60"
            />
            <div className="flex gap-2 overflow-x-auto">
              {tags.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTag(activeTag === t ? '' : t)}
                  className={`px-4 py-2 rounded-full border ${activeTag === t ? 'bg-fuchsia-500 text-white border-fuchsia-400' : 'bg-white/10 border-white/20 text-slate-100'} hover:bg-white/20 transition`}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Characters</h2>
        {models.length === 0 ? (
          <div className="text-slate-300">No models to display yet. Connect backend or seed data.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((m) => (
              <article key={m.id || m._id || m.name} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-fuchsia-400/40 transition">
                <div className="aspect-video overflow-hidden">
                  <img src={m.thumbnail_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold">{m.name}</h3>
                    <span className="text-fuchsia-300 font-semibold">${'{'}m.price{'}'}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300 line-clamp-2">{m.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(m.formats || []).map((f) => (
                      <span key={f} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">{f}</span>
                    ))}
                    {m.rigged && <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">Rigged</span>}
                    {m.animated && <span className="text-xs px-2 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200">Animated</span>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {m.preview_url && <a href={m.preview_url} target="_blank" className="px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition">Preview</a>}
                    <button className="px-3 py-2 text-sm rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 transition">Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-slate-400">
        © {new Date().getFullYear()} 3D Character Shop • Built for creators
      </footer>
    </div>
  )
}

export default App
