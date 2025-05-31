import { Page } from "./Page";
import { Link } from "react-router-dom";

export const Tutorials = () => {
  return (
    <Page>
      <h1>Tutorials</h1>
      <ul className="object__list">
        <Link to='/tutorials/ProceduralLevelGenerationPart1'><li className="object__list-item">Procedural generation in GMS: Part 1</li></Link>
        <Link to='/tutorials/ProceduralLevelGenerationPart2'><li className="object__list-item">Procedural generation in GMS: Part 2</li></Link>
        <Link to='/tutorials/PlayingWithTilesets'><li className="object__list-item">Playing with Tilesets</li></Link>
      </ul>
    </Page>
  );
}