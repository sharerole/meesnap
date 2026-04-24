import { useState } from 'react'
import BoothScene from './components/BoothScene'
import BoothInterior from './components/BoothInterior'
import PhotoStrip from './components/PhotoStrip'

// phases: lobby → entering → inside → exiting → revealing → strip
export default function App() {
  const [phase, setPhase] = useState('lobby')
  const [photos, setPhotos] = useState([])
  const [theme, setTheme] = useState('classic')

  function handleEnter()           { setPhase('entering') }
  function handleCurtainsOpen()    { setPhase('inside') }
  function handlePhotosReady(imgs) { setPhotos(imgs); setPhase('exiting') }
  function handleCurtainsClosed()  { setPhase('revealing') }
  function handlePickUp()          { setPhase('strip') }
  function handleRetake()          { setPhotos([]); setPhase('lobby') }
  function handleRestart()         { setPhotos([]); setPhase('lobby') }

  const showBooth = ['lobby', 'entering', 'exiting', 'revealing'].includes(phase)

  return (
    <>
      {showBooth && (
        <BoothScene
          phase={phase}
          theme={theme}
          setTheme={setTheme}
          onEnter={handleEnter}
          onCurtainsOpen={handleCurtainsOpen}
          onCurtainsClosed={handleCurtainsClosed}
          onPickUp={handlePickUp}
        />
      )}
      {phase === 'inside' && (
        <BoothInterior onPhotosReady={handlePhotosReady} />
      )}
      {phase === 'strip' && (
        <PhotoStrip
          photos={photos}
          theme={theme}
          onRetake={handleRetake}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
