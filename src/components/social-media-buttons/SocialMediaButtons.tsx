import { SocialIcon } from "react-social-icons";
import "./SocialMediaButtons.css"

function SocialMediaButtons() {
    const linkedinUrl = 'https://www.linkedin.com/in/javier-maría-garcía-cuevas-91307713b'
    const email = "mailto:javiermariagarciacuevas@gmail.com"

    return (
    <div className="container">
        <SocialIcon 
            network='linkedin' 
            url={linkedinUrl}
            fgColor="transparent" 
            bgColor="#F9D371"/>
        <SocialIcon
            network='email' 
            url={email}
            fgColor="transparent" 
            bgColor="#F9D371"/>
    </div>);
}

export default SocialMediaButtons;