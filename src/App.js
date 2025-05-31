import './App.css';
import { Page } from './pages/Page';
import { About } from './pages/About';
import { Projects } from './pages/Projects';
import { Troubadour } from './pages/Projects/Troubadour/Troubadour';
import { Cruciverbalist } from './pages/Projects/Cruciverbalist/Cruciverbalist';
import { GameComponent } from './pages/Projects/Cruciverbalist/GameView';
import { Tutorials } from './pages/Tutorials';
import { TutPLGPart1 } from './pages/Tutorials/TutPLGPart1/TutPLGPart1';
import { TutPLGPart2 } from './pages/Tutorials/TutPLGPart2/TutPLGPart2';
import { PlayingWithTilesets } from './pages/Tutorials/Tilesets/PlayingWithTilesets';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Page />} />
      <Route path='/about' element={<About />} />
      <Route path='/projects' element={<Projects />} />
      <Route path='/projects/troubadour' element={<Troubadour />} />
      <Route path='/projects/cruciverbalist/builder' element={<Cruciverbalist />} />
      <Route path='/projects/cruciverbalist/play/:id' element={<GameComponent />} />
      <Route path='/tutorials' element={<Tutorials />} />
      <Route path='/tutorials/ProceduralLevelGenerationPart1' element={<TutPLGPart1 />} />
      <Route path='/tutorials/ProceduralLevelGenerationPart2' element={<TutPLGPart2 />} />
      <Route path='/tutorials/PlayingWithTilesets' element={<PlayingWithTilesets />} />
    </Routes>
  );
}

export default App;
