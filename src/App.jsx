import { useState } from 'react'
import BoothScene from './components/BoothScene'
import BoothInterior from './components/BoothInterior'
import PhotoStrip from './components/PhotoStrip'
import { THEMES, STRIP_W, stripTotalHeight } from './lib/themes'

// phases: lobby → entering → inside → exiting → revealing → strip
export default function App() {
  const [phase, setPhase]               = useState('lobby')
  const [photos, setPhotos]             = useState([])
  const [theme, setTheme]               = useState('classic')
  const [shotCount, setShotCount]       = useState(4)
  const [filter, setFilter]             = useState('natural')
  const [stripDataUrl, setStripDataUrl] = useState(null)

  function handleEnter()        { setPhase('entering') }
  function handleCurtainsOpen() { setPhase('inside') }

  function handlePhotosReady(imgs) {
    setPhotos(imgs)
    setPhase('exiting')
    setStripDataUrl(null)

    // Pre-render the strip offscreen during the curtain-close window (~1300ms)
    // so it's ready before the tray reveal animation starts.
    const themeObj = THEMES.find(t => t.id === theme) ?? THEMES[0]
    const h = stripTotalHeight(imgs.length)
    const canvas = document.createElement('canvas')
    canvas.width  = STRIP_W
    canvas.height = h

    let loaded = 0
    const loadedImgs = new Array(imgs.length)
    imgs.forEach((src, i) => {
      const img = new Image()
      img.onload = () => {
        loadedImgs[i] = img
        if (++loaded === imgs.length) {
          themeObj.draw(canvas.getContext('2d'), loadedImgs, '')
          setStripDataUrl(canvas.toDataURL('image/png'))
        }
      }
      img.src = src
    })
  }

  function handleCurtainsClosed() { setPhase('revealing') }
  function handlePickUp()         { setPhase('strip') }
  function handleRetake()         { setPhotos([]); setStripDataUrl(null); setPhase('lobby') }
  function handleRestart()        { setPhotos([]); setStripDataUrl(null); setPhase('lobby') }

  const showBooth = ['lobby', 'entering', 'exiting', 'revealing'].includes(phase)

  return (
    <>
      {showBooth && (
        <BoothScene
          phase={phase}
          stripDataUrl={stripDataUrl}
          onEnter={handleEnter}
          onCurtainsOpen={handleCurtainsOpen}
          onCurtainsClosed={handleCurtainsClosed}
          onPickUp={handlePickUp}
        />
      )}
      {phase === 'inside' && (
        <BoothInterior
          theme={theme}
          setTheme={setTheme}
          shotCount={shotCount}
          setShotCount={setShotCount}
          filter={filter}
          setFilter={setFilter}
          onPhotosReady={handlePhotosReady}
        />
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
