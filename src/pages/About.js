import { Link } from "react-router-dom";
import { Page } from './Page';

export const About = () => {
    return (
        <Page>
            <>
                <h1>About</h1>
                <p>Vaishnav is a front-end developer based out of Bengaluru, KA.</p>
                <p>I currently work as a Wi-Fi test engineer. I've previously worked with startups on building mobile apps with Flutter.</p>
                <p>Recently I've picked up React.js and have made a few projects which you can find <Link to='/projects'>here</Link>.</p>
                <p>A few of my projects can be found on my <Link to="https://github.com/padth4i" target="_blank">Github</Link>.</p>
                <p>You can email me <Link to="mailto:vaishnavs4201@gmail.com">here</Link> or message me on <Link to="https://www.linkedin.com/in/vaishnav-sivaprasad-8bb43017b/">Linkedin</Link>.</p>
            </>
        </Page>
    );
}