import './App.css'
import SocialMediaButtons from './components/social-media-buttons/SocialMediaButtons'
import TitleFade from './components/title-fade/TitleFade'
import TitleFollow from './components/title-follow/TitleFollow'

function App() {
  return (
    <>
      {window.matchMedia('(pointer:fine)').matches ? <TitleFollow></TitleFollow> : <TitleFade></TitleFade>}
      <SocialMediaButtons></SocialMediaButtons>
    </>
  )
}

export default App
