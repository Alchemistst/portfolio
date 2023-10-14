import "./TitleFade.css"

function TitleFade() {

    const name = "Javier\nGarcia\nCuevas"

    return (
    <>
          <h1 className='title title-color3 fade-out3'>{name}</h1>
          <h1 className='title title-color2 fade-out2'>{name}</h1>
          <h1 className='title title-color1 fade-out1'>{name}</h1>
          <h1 className='title title-accent'>{name}</h1>
        </>
    );
}

export default TitleFade;