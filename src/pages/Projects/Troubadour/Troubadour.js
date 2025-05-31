import { useState } from 'react';
import './Troubadour.css';

import frameDrumSoundAsset from './sounds/instrument-0.wav'
import bellSoundAsset from './sounds/instrument-1.wav'
import oudSoundAsset from './sounds/instrument-2.wav'
import tamborineSoundAsset from './sounds/instrument-3.wav'
import castanetSoundAsset from './sounds/instrument-4.wav'

import logoBlack from './icons/logo_black.png'
import title from './icons/title.svg'
import playButtonIcon from './icons/play-button.svg'
import clearButtonIcon from './icons/clear-button.svg'
import stopButtonIcon from './icons/stop-button.svg'
import frameDrumIcon from './icons/instrument-0.svg'
import bellIcon from './icons/instrument-1.svg'
import oudIcon from './icons/instrument-2.svg'
import tamborineIcon from './icons/instrument-3.svg'
import castanetIcon from './icons/instrument-4.svg'

import Tooltip from '@mui/material/Tooltip';

const numberOfBeats = 8;
const numberOfInstruments = 5;
const beatList = [...Array(numberOfBeats).keys()];
const beatColumn = [...Array(numberOfInstruments).keys()];

const instrumentInfo = [
	{
		"icon": frameDrumIcon,
		"sound": frameDrumSoundAsset,
		"tooltip": 'Frame drum'
	},
	{
		"icon": bellIcon,
		"sound": bellSoundAsset,
		"tooltip": 'Bell'
	},
	{
		"icon": oudIcon,
		"sound": oudSoundAsset,
		"tooltip": 'Oud'
	},
	{
		"icon": tamborineIcon,
		"sound": tamborineSoundAsset,
		"tooltip": 'Tamborine'
	},
	{
		"icon": castanetIcon,
		"sound": castanetSoundAsset,
		"tooltip": 'Castanet'
	},
]

let isMusicPlaying = false;

const initialGridState = beatList.map((beatIndex) => {
	return (
		beatColumn.map((instrumentIndex) => {
			return (
				{
					id: instrumentIndex + '-' + beatIndex,
					isEnabled: false
				}
			);
		})
	);
})


function getInstrumentSound(id) {
	let instrumentIndex = id.split('-')[0];
	return new Audio(instrumentInfo[instrumentIndex].sound);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const Troubadour = () => {
	const [gridState, onChangeGridState] = useState(initialGridState);
	const [isPlayButtonPressed, onChangePlayButtonPressed] = useState(false);
	const [currentPlayedBeat, onChangeCurrentPlayedBeat] = useState(null)

	function handleCellClick(keyValue) {
		const nextGridState = gridState.map((beat) => {
			return beat.map((instrument) => {
				if (instrument.id === keyValue && !isMusicPlaying) {
					if (!instrument.isEnabled) {
						let sound = getInstrumentSound(instrument.id);
						try {
							sound.play();
						} catch (e) {
							console.log('Error in playing instrument')
						}
					}
					return ({ ...instrument, isEnabled: !instrument.isEnabled })
				}
				else {
					return instrument;
				}
			})
		})
		onChangeGridState(nextGridState);
	}

	function resetGrid() {
		if (!isMusicPlaying) {
			onChangeGridState(initialGridState);
		}
	}

	function playBeat(beat) {
		console.log('beat: ' + beat)
		for (let instrumentIndex = 0; instrumentIndex < numberOfInstruments; instrumentIndex++) {
			let gridCell = beat[instrumentIndex];

			if (gridCell.isEnabled) {
				let sound = getInstrumentSound(gridCell.id);
				sound.play();
			}
		}
	}

	async function playTrack() {
		for (let beatIndex = 0; isMusicPlaying; beatIndex++) {
			console.log(beatIndex % numberOfBeats);
			if (isMusicPlaying) {
				onChangeCurrentPlayedBeat(beatIndex % numberOfBeats)
				playBeat(gridState[beatIndex % numberOfBeats]);
				await sleep(500);
			} else {
				return;
			}

		}
	}

	const BeatColumn = ({ children, isPlayed }) => {
		return (
			<div className={isPlayed ? 'beat-column-played' : 'beat-column'} >
				{children}
			</div>
		);
	}

	return (
		<div id='app-background'>
			<div id='heading'>
				<div id='avatar'>
					<img src={logoBlack} alt='' id='avatar-logo' />
				</div>
				<div>
					<img src={title} alt='' id='title' />
				</div>
			</div>
			<div id='full-grid'>
				<BeatColumn key={'instruments'}>
					{
						beatColumn.map((instrumentIndex) => {
							let instrumentIconAsset = instrumentInfo[instrumentIndex].icon;
							return (
								<Tooltip title={instrumentInfo[instrumentIndex].tooltip} placement='left'>
									<div key={'instrument-' + instrumentIndex} className="instrument-cell">
										<img src={instrumentIconAsset} alt='' className='instrument-icon'></img>
									</div>
								</Tooltip>

							)
						})
					}
				</BeatColumn>

				<div className='divider' />

				<div id='beat-grid'>
					{
						gridState.map((beat, index) => (
							<BeatColumn key={'beat-' + index} isPlayed={currentPlayedBeat === index}>
								{
									beat.map((instrument) => {
										return <div
											key={instrument.id}
											className={instrument.isEnabled ? "cell-active" : "cell-inactive"}
											onClick={() => { handleCellClick(instrument.id) }} />
									})
								}
							</BeatColumn>
						))
					}
				</div>
			</div>

			<div className='button-column'>
				<Tooltip title={isPlayButtonPressed ? "Stop track" : "Play track"} placement='left'>
					<div className='action-button-background'>
						<button className={isPlayButtonPressed ? 'action-button-active' : 'action-button-inactive'} onClick={() => {
							onChangePlayButtonPressed(!isPlayButtonPressed);
							isMusicPlaying = !isMusicPlaying;
							if (isMusicPlaying) { playTrack(); }
							if (currentPlayedBeat != null) onChangeCurrentPlayedBeat(null)
						}
						}>
							<img src={isPlayButtonPressed ? stopButtonIcon : playButtonIcon} className='action-button-icon' alt=''></img>
						</button>
					</div>
				</Tooltip>

				<Tooltip title="Clear all" placement='left'>
					<div className='action-button-background'>
						<button className='action-button-inactive' onClick={resetGrid}>
							<img src={clearButtonIcon} className='action-button-icon' alt=''></img>
						</button>
					</div>
				</Tooltip>

			</div>

		</div>
	);
};