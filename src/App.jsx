import { useState } from 'react'
import Lobby from './components/Lobby'
import Booth from './components/Booth'
import PhotoStrip from './components/PhotoStrip'

export default function App() {
  const [screen, setScreen] = useState('lobby')
  const [photos, setPhotos] = useState([])
  const [theme, setTheme] = useState('classic')

  function handlePhotosReady(shots) {
    setPhotos(shots)
    setScreen('strip')
  }

  return (
    <>
      {screen === 'lobby' && <Lobby onEnter={() => setScreen('booth')} />}
      {screen === 'booth' && (
        <Booth
          onPhotosReady={handlePhotosReady}
          theme={theme}
          setTheme={setTheme}
          onBack={() => setScreen('lobby')}
        />
      )}
      {screen === 'strip' && (
        <PhotoStrip
          photos={photos}
          theme={theme}
          onRetake={() => { setPhotos([]); setScreen('booth') }}
          onRestart={() => { setPhotos([]); setScreen('lobby') }}
        />
      )}
    </>
  )
}
