import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'ck_cart_v1'

export const CartProvider = ({ children }) => {
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

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id)
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    showToast('Added to cart')
  }, [showToast])

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(0, quantity) } : p)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.reduce((sum, i) => sum + (i.quantity || 1), 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0), [items])

  const value = useMemo(() => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, count, subtotal }), [items, addToCart, removeFromCart, updateQuantity, clearCart, count, subtotal])

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg z-[1000]">
          {toast.message}
        </div>
      )}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


