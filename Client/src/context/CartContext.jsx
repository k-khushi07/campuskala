import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

const CartContext = createContext({})

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload }
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        }
      }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    
    case 'CLEAR_CART':
      return { ...state, items: [] }
    
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [cartState, dispatch] = useReducer(cartReducer, { items: [] })

  // Sync cart with Firebase when user is logged in
  useEffect(() => {
    if (currentUser) {
      const cartRef = doc(db, 'carts', currentUser.uid)
      
      const unsubscribe = onSnapshot(cartRef, (doc) => {
        if (doc.exists()) {
          const cartData = doc.data()
          dispatch({ type: 'SET_CART', payload: cartData.items || [] })
        }
      })

      return () => unsubscribe()
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [currentUser])

  // Save cart to Firebase whenever it changes (for logged-in users)
  useEffect(() => {
    if (currentUser && cartState.items.length >= 0) {
      const cartRef = doc(db, 'carts', currentUser.uid)
      setDoc(cartRef, {
        items: cartState.items,
        updatedAt: new Date()
      }, { merge: true })
    }
  }, [currentUser, cartState.items])

  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      dispatch({ 
        type: 'UPDATE_QUANTITY', 
        payload: { id: productId, quantity } 
      })
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getCartTotal = () => {
    return cartState.items.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return cartState.items.reduce((count, item) => {
      return count + item.quantity
    }, 0)
  }

  const value = {
    cartItems: cartState.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
