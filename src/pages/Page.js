import { Link } from "react-router-dom";
import '../App.css';

import logo from '../media/logo.png';
import barcode from '../media/barcode.gif';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

export const AppHeader = () => {

    const ListItem = ({ route, child }) => {
        return (
            <li className='header__list-item'>
                <Link to={route} className='header__list-item-decoration'><h2>{child}</h2></Link>
            </li>
        );
    }

    return (
        <header>
            <img src={logo} className='header__logo' alt='' />
            <ul className='header__list'>
                <ListItem route='/' child='home'></ListItem>
                <ListItem route='/about' child='about'></ListItem>
                <ListItem route='/projects' child='projects'></ListItem>
                <ListItem route='/tutorials' child='tutorials'></ListItem>
            </ul>
        </header>
    );
}

export const AppFooter = () => {
    return (
        <footer>
            <img src={barcode} className='footer__image' alt='' />
            <div className='footer__icon-row'>
                <Link to='https://www.linkedin.com/in/vaishnav-sivaprasad-8bb43017b/' className='footer__icon' target='_blank' ><FaLinkedin /></Link>
                <Link to='https://github.com/padth4i' className='footer__icon' target='_blank' ><FaGithub /></Link>
            </div>
        </footer>
    );
}

export const Page = ({ children }) => {
    return (
        <div className='app'>
            <div className='body'>
                <AppHeader />
                <div className='body__content'>
                    {children}
                </div>
            </div>
            {/* <AppFooter /> */}
        </div>
    );
}