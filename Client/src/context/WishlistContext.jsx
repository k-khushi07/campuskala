import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'ck_wishlist_v1'

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message })
    setTimeout(() => setToast(null), 1500)
  }, [])

  const addToWishlist = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) {
        showToast('Already in wishlist')
        return prev
      }
      const newItem = {
        ...product,
        addedAt: new Date(),
        wishlistId: `${product.id}_${Date.now()}`
      }
      showToast('Added to wishlist')
      return [...prev, newItem]
    })
  }, [showToast])

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId))
    showToast('Removed from wishlist')
  }, [showToast])

  const toggleWishlist = useCallback((product) => {
    const exists = items.find((p) => p.id === product.id)
    if (exists) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }, [items, addToWishlist, removeFromWishlist])

  const isInWishlist = useCallback((productId) => {
    return items.some((p) => p.id === productId)
  }, [items])

  const clearWishlist = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.length, [items])

  const value = useMemo(() => ({ 
    items, 
    addToWishlist, 
    removeFromWishlist, 
    toggleWishlist, 
    isInWishlist, 
    clearWishlist, 
    count 
  }), [items, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist, count])

  return (
    <WishlistContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg z-[1000]">
          {toast.message}
        </div>
      )}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
