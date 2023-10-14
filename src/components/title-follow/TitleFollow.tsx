import useMousePosition from "../../hooks/useMousePosition"
import "./TitleFollow.css"

function TitleFollow() {
    const mousePosition = useMousePosition();

    const name = "Javier\nGarcia\nCuevas"

    const x = (mousePosition.x-innerWidth/2)/window.innerWidth
    const y = (mousePosition.y-innerHeight/2)/window.innerHeight
    const transform1 = 
    `translate(${-50+x*100}%, 
    ${-50+y*100}%)`;
    const transform2 = 
    `translate(${-50+x*95}%, 
    ${-50+y*95}%)`;
    const transform3 = 
    `translate(${-50+x*90}%, 
    ${-50+y*90}%)`;
    const transform4 = 
    `translate(${-50+x*85}%, 
    ${-50+y*85}%)`;
    return (
        <>
          <h1 className='title title-color3' style={{
            transform: transform4
          }}>{name}</h1>
          <h1 className='title title-color2' style={{
            transform: transform3
          }}>{name}</h1>
          <h1 className='title title-color1' style={{
            transform: transform2
          }}>{name}</h1>
          <h1 className='title title-accent' style={{
            transform: transform1
          }}>{name}</h1>
        </>
      )
}

export default TitleFollow