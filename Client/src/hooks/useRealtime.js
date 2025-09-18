import { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  where, 
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '../services/firebase'

// Sample data fallback for when Firebase has no data
const sampleProducts = [
  {
    id: 'sample-1',
    title: 'Hand-painted Canvas Art',
    price: 1200,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    creator: { 
      id: 1, 
      name: 'Priya Sharma', 
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d5bac8?w=100',
      isVerified: true,
      campusYear: '3rd Year'
    },
    rating: 4.8,
    reviewCount: 24,
    category: 'art',
    tags: ['art', 'painting', 'handmade', 'canvas', 'creative'],
    inStock: true,
    isHandmade: true,
    isEcoFriendly: true,
    createdAt: new Date()
  },
  {
    id: 'sample-2',
    title: 'Custom T-shirt Design',
    price: 450,
    originalPrice: 600,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    creator: { 
      id: 2, 
      name: 'Raj Patel', 
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      isVerified: true,
      campusYear: '2nd Year'
    },
    rating: 4.6,
    reviewCount: 18,
    category: 'fashion',
    tags: ['fashion', 'tshirt', 'custom', 'design', 'clothing'],
    inStock: true,
    isHandmade: true,
    createdAt: new Date()
  }
]

const sampleServices = [
  {
    id: 'service-1',
    title: 'Portrait Photography Session',
    priceRange: '₹1500-3000',
    minPrice: 1500,
    maxPrice: 3000,
    image: 'https://images.unsplash.com/photo-1554048612-b6ebae896fb5?w=400',
    creator: { 
      id: 1, 
      name: 'Aditi Mehta', 
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      isVerified: true,
      campusYear: '4th Year'
    },
    rating: 4.9,
    reviewCount: 28,
    category: 'photography',
    duration: '2-3 hours',
    location: 'Campus & Nearby',
    locationType: 'hybrid',
    availability: 'available',
    createdAt: new Date()
  }
]

// Real-time products hook
export const useRealtimeProducts = (filters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      let q = collection(db, 'products')
      
      // Apply sorting
      if (filters.sortBy === 'newest') {
        q = query(q, orderBy('createdAt', 'desc'))
      } else if (filters.sortBy === 'price-low') {
        q = query(q, orderBy('price', 'asc'))
      } else if (filters.sortBy === 'price-high') {
        q = query(q, orderBy('price', 'desc'))
      } else {
        q = query(q, orderBy('rating', 'desc'))
      }
      
      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          // If no products in Firebase, use sample data
          if (productsData.length === 0) {
            setProducts(sampleProducts)
          } else {
            setProducts(productsData)
          }
          
          setLoading(false)
          setError(null)
        },
        (error) => {
          console.error('Products subscription error:', error)
          // Fallback to sample data on error
          setProducts(sampleProducts)
          setError(error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('Products hook error:', error)
      setProducts(sampleProducts)
      setError(error)
      setLoading(false)
    }
  }, [filters])

  return { products, loading, error }
}

// Real-time services hook
export const useRealtimeServices = (filters = {}) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      let q = query(collection(db, 'services'), orderBy('rating', 'desc'))
      
      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const servicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          // If no services in Firebase, use sample data
          if (servicesData.length === 0) {
            setServices(sampleServices)
          } else {
            setServices(servicesData)
          }
          
          setLoading(false)
          setError(null)
        },
        (error) => {
          console.error('Services subscription error:', error)
          // Fallback to sample data on error
          setServices(sampleServices)
          setError(error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('Services hook error:', error)
      setServices(sampleServices)
      setError(error)
      setLoading(false)
    }
  }, [filters])

  return { services, loading, error }
}

// Real-time orders hook
export const useRealtimeOrders = (userId, userType = 'buyer') => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const field = userType === 'seller' ? 'sellerId' : 'buyerId'
    const q = query(
      collection(db, 'orders'),
      where(field, '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by createdAt in descending order (newest first)
      ordersData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
        return bTime - aTime
      })
      setOrders(ordersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId, userType])

  return { orders, loading }
}

// CRUD operations hook
export const useFirestore = (collectionName) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addDocument = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setLoading(false)
      return docRef
    } catch (error) {
      console.error('Add document error:', error)
      setError(error)
      setLoading(false)
      throw error
    }
  }

  const updateDocument = async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: new Date()
      })
      setLoading(false)
    } catch (error) {
      console.error('Update document error:', error)
      setError(error)
      setLoading(false)
      throw error
    }
  }

  const deleteDocument = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, collectionName, id))
      setLoading(false)
    } catch (error) {
      console.error('Delete document error:', error)
      setError(error)
      setLoading(false)
      throw error
    }
  }

  return { 
    addDocument, 
    updateDocument, 
    deleteDocument, 
    loading, 
    error 
  }
}
