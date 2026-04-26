import { useRef, useState } from 'react'
import BoothScene from './components/BoothScene'
import BoothInterior from './components/BoothInterior'
import PhotoStrip from './components/PhotoStrip'
import { THEMES } from './lib/themes'
import { DEFAULT_LAYOUT, getMetrics } from './lib/layouts'
import appStyles from './App.module.css'

// phases: lobby → entering → inside → exiting → revealing → strip
export default function App() {
  const [phase, setPhase]               = useState('lobby')
  const [photos, setPhotos]             = useState([])
  const [theme, setTheme]               = useState('classic')
  const [layout, setLayout]             = useState(DEFAULT_LAYOUT)
  const [filter, setFilter]             = useState('natural')
  const [stripDataUrl, setStripDataUrl] = useState(null)

  const backingOut = useRef(false)

  function handleEnter()        { setPhase('entering') }
  function handleCurtainsOpen() { setPhase('inside') }

  function handleExitBooth() {
    backingOut.current = true
    setPhase('exiting')
  }

  function handlePhotosReady(imgs) {
    setPhotos(imgs)
    setPhase('exiting')
    setStripDataUrl(null)

    // Pre-render the strip offscreen during the curtain-close window (~1300ms)
    // so it's ready before the tray reveal animation starts.
    const themeObj = THEMES.find(t => t.id === theme) ?? THEMES[0]
    const { W, h } = getMetrics(layout)
    const canvas = document.createElement('canvas')
    canvas.width  = W
    canvas.height = h

    let loaded = 0
    const loadedImgs = new Array(imgs.length)
    imgs.forEach((src, i) => {
      const img = new Image()
      img.onload = () => {
        loadedImgs[i] = img
        if (++loaded === imgs.length) {
          themeObj.draw(canvas.getContext('2d'), loadedImgs, '', layout)
          setStripDataUrl(canvas.toDataURL('image/png'))
        }
      }
      img.src = src
    })
  }

  function handleCurtainsClosed() {
    if (backingOut.current) { backingOut.current = false; setPhase('lobby') }
    else                    { setPhase('revealing') }
  }
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
        <div key="inside" className={appStyles.phaseView}>
          <BoothInterior
            theme={theme}
            setTheme={setTheme}
            layout={layout}
            setLayout={setLayout}
            filter={filter}
            setFilter={setFilter}
            onPhotosReady={handlePhotosReady}
            onExit={handleExitBooth}
          />
        </div>
      )}
      {phase === 'strip' && (
        <div key="strip" className={appStyles.phaseView}>
          <PhotoStrip
            photos={photos}
            theme={theme}
            layout={layout}
            onRetake={handleRetake}
            onRestart={handleRestart}
          />
        </div>
      )}
    </>
  )
}
