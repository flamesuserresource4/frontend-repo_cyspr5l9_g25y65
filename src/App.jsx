import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function App() {
  const [models, setModels] = useState([])
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState(null)
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

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

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart))
    } catch {}
  }, [cart])

  const tags = ['stylized','fantasy','sci-fi','mech','game-ready','PBR']

  const addToCart = (item) => {
    setCart((prev) => {
      const id = item.id || item._id || item.name
      const exist = prev.find((p) => (p.id || p._id || p.name) === id)
      if (exist) {
        return prev.map((p) => ((p.id || p._id || p.name) === id ? { ...p, qty: (p.qty || 1) + 1 } : p))
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => (p.id || p._id || p.name) !== id))
  }

  const updateQty = (id, qty) => {
    setCart((prev) => prev.map((p) => ( (p.id || p._id || p.name) === id ? { ...p, qty: Math.max(1, qty) } : p )))
  }

  const clearCart = () => setCart([])

  const subtotal = useMemo(() => cart.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0), [cart])

  const handleCheckout = async () => {
    if (!BACKEND_URL) {
      alert('Backend not configured')
      return
    }
    if (cart.length === 0) return
    setCheckingOut(true)
    try {
      const items = cart.map((it) => ({ id: (it.id || it._id || it.name), qty: it.qty || 1 }))
      const res = await fetch(`${BACKEND_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      if (!res.ok) throw new Error(`Checkout failed: ${res.status}`)
      const data = await res.json()
      setCheckoutResult(data)
      clearCart()
      setCartOpen(false)
    } catch (e) {
      console.error(e)
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  const cartCount = cart.reduce((n, it) => n + (it.qty || 1), 0)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 grid place-items-center text-fuchsia-300 font-bold">3D</span>
            <span className="font-semibold">Character Shop</span>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative px-4 py-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition">
            Cart
            {cartCount > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-fuchsia-600">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Hero with Spline cover */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/atN3lqky4IzF-KEP/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-slate-900/0 pointer-events-none" />
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-10 pt-20">
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
            {models.map((m) => {
              const price = Number(m.price || 0).toFixed(2)
              const id = m.id || m._id || m.name
              return (
                <article key={id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-fuchsia-400/40 transition">
                  <div className="aspect-video overflow-hidden">
                    <img src={m.thumbnail_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold">{m.name}</h3>
                      <span className="text-fuchsia-300 font-semibold">${price}</span>
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
                      <button onClick={() => addToCart(m)} className="px-3 py-2 text-sm rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 transition">Add to cart</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-40 ${cartOpen ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div onClick={() => setCartOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${cartOpen ? 'opacity-100' : 'opacity-0'}`} />
        {/* Panel */}
        <aside className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-slate-900 shadow-xl border-l border-white/10 transform transition-transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <h3 className="text-lg font-semibold">Your Cart</h3>
            <button onClick={() => setCartOpen(false)} className="text-slate-300 hover:text-white">Close</button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
            {cart.length === 0 ? (
              <p className="text-slate-400">Your cart is empty.</p>
            ) : (
              cart.map((it) => {
                const id = it.id || it._id || it.name
                const price = Number(it.price || 0)
                return (
                  <div key={id} className="flex gap-3">
                    <img src={it.thumbnail_url} alt={it.name} className="h-16 w-24 object-cover rounded-md border border-white/10" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{it.name}</p>
                          <p className="text-sm text-slate-400">${price.toFixed(2)}</p>
                        </div>
                        <button onClick={() => removeFromCart(id)} className="text-xs text-slate-400 hover:text-red-300">Remove</button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-400">Qty</span>
                        <input type="number" min="1" value={it.qty || 1} onChange={(e) => updateQty(id, parseInt(e.target.value || '1', 10))} className="w-16 bg-white/10 border border-white/10 rounded px-2 py-1 text-sm" />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between text-slate-200">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} disabled={cart.length === 0 || checkingOut} className="mt-4 w-full px-4 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {checkingOut ? 'Processing...' : 'Checkout'}
            </button>
            <button onClick={clearCart} disabled={cart.length === 0 || checkingOut} className="mt-2 w-full px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50">Clear cart</button>
          </div>
        </aside>
      </div>

      {/* Checkout confirmation modal */}
      {checkoutResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setCheckoutResult(null)} />
          <div className="relative z-10 w-[95%] sm:w-[560px] max-h-[80vh] overflow-auto bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold">Order Confirmed</h3>
            <p className="mt-1 text-slate-300">{checkoutResult.message}</p>
            <p className="mt-1 text-xs text-slate-400">Order ID: {checkoutResult.order_id}</p>
            <div className="mt-4 space-y-3">
              {(checkoutResult.items || []).map((li) => (
                <div key={li.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="font-medium">{li.name}</p>
                    <p className="text-xs text-slate-400">Qty {li.qty} • ${Number(li.price).toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${Number(li.line_total).toFixed(2)}</p>
                    {(li.download_links || []).map((link, idx) => link ? (
                      <a key={idx} href={link} target="_blank" className="block text-xs text-fuchsia-300 hover:text-fuchsia-200 underline mt-1">Download {idx + 1}</a>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-slate-300">Subtotal</span>
              <span className="font-semibold">${Number(checkoutResult.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setCheckoutResult(null)} className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-slate-400">
        © {new Date().getFullYear()} 3D Character Shop • Built for creators
      </footer>
    </div>
  )
}

export default App
