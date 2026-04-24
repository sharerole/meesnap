import logoSrc from '../assets/meeopp-logo.png'

export default function MeeOppLogo({ height = 28, style = {} }) {
  return (
    <img
      src={logoSrc}
      alt="MeeOpp"
      height={height}
      style={{ display: 'block', objectFit: 'contain', ...style }}
    />
  )
}
