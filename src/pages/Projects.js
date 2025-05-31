import { Page } from './Page';
import { Link } from "react-router-dom";

export const Projects = () => {
  return (
    <Page>
      <h1>Projects</h1>
      <ul className="object__list">
        <Link to='/projects/cruciverbalist/builder'><li className="object__list-item">Cruciverbalist</li></Link>
        <Link to='/projects/troubadour'><li className="object__list-item">Troubadour</li></Link>
      </ul>
    </Page>
  );
}