// Environment variables check utility
export const checkEnvironment = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID'
  ]

  const optionalVars = [
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ]

  const missing = []
  const warnings = []

  // Check required variables
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName)
    }
  })

  // Check optional variables
  optionalVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      warnings.push(varName)
    }
  })

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing)
    return { isValid: false, missing, warnings }
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Missing optional environment variables:', warnings)
  }

  console.log('✅ Environment variables check passed')
  return { isValid: true, missing: [], warnings }
}

// Check environment on import
export const envStatus = checkEnvironment()
