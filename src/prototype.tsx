import React from 'react'
import { createRoot } from 'react-dom/client'
import AppPrototype from './AppPrototype'
import './styles/globals.css'

// Renderizar prototipo para UX testing
createRoot(document.getElementById('root')!).render(
  <AppPrototype />
)