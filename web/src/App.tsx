import {
	Component,
	Match,
	Signal,
	Switch,
	createEffect,
	createSignal,
} from "solid-js";

import ExtDropdown from "./components/ExtDropdown.jsx";
import FileChoose from "./components/FileChoose.jsx";
import Button from "./components/Button.jsx";
import styles from "./css/App.module.css";
import { mimeTypeToExt } from "./globals.js";

const fetchURL = "http://localhost:8000";

enum AppState {
	ChooseFile,
	ReadyToConvert,
	Converting,
	FinishedConverting,
}

type ConversionState = {
	percent: number;
	filename: string;
	completed?: boolean;
	target: string;
};

const App: Component = () => {
	const [chosenFile, setChosenFile] = createSignal<Blob | null>(null);
	const [targetExt, setTargetExt] = createSignal(null);
	const [appState, _setAppState] = createSignal<AppState>(AppState.ChooseFile);

	createEffect(() => {
		if (chosenFile() && appState() === AppState.ChooseFile)
			setAppState(AppState.ReadyToConvert);
		else if (!chosenFile() && appState() === AppState.ReadyToConvert)
			setAppState(AppState.ChooseFile);
	});

	let transitionContainer: HTMLDivElement,
		startTime: number = 0;

	function setAppState(newAppState: AppState) {
		transitionContainer.classList.add(styles.transitioning);
		setTimeout(() => {
			_setAppState(newAppState);
			transitionContainer.classList.remove(styles.transitioning);
		}, 400);
	}

	let fileID: string | null = null,
		[conversionStatus, setConversionStatus]: Signal<ConversionState | null> =
			createSignal(null);

	async function submit() {
		if (!chosenFile() || !targetExt()) return alert("No file selected");
		const formData = new FormData();
		formData.append("file", chosenFile() || "");
		let req = await fetch(
			`${fetchURL}/convert/${getExt(chosenFile()!.type)}/${targetExt()}`,
			{
				method: "POST",
				body: formData,
			},
		);
		let json = await req.json();
		fileID = json.id;
		startTime = Date.now();
		setAppState(AppState.Converting);
		pollStatus();
	}

	async function pollStatus() {
		let req = await fetch(`${fetchURL}/status/${fileID}`);
		let json = await req.json();
		setConversionStatus(json);
		if (json.completed) return setAppState(AppState.FinishedConverting);
		setTimeout(() => pollStatus(), 1000);
	}
	let fileChooser = <FileChoose onFileChoose={setChosenFile} />;
	return (
		<div ref={transitionContainer!} class={styles.transitionContainer}>
			<Switch>
				<Match when={appState() === AppState.ChooseFile}>{fileChooser}</Match>
				<Match when={appState() === AppState.ReadyToConvert && chosenFile()}>
					<div class={styles.convertContainer}>
						<p>Convert</p>
						{fileChooser}
						<p>to</p>
						<ExtDropdown
							selectedFile={chosenFile()}
							valueBroadcaster={setTargetExt}
						/>
					</div>
					<Button fullWidth onClick={submit}>
						Go
					</Button>
				</Match>
				<Match when={appState() === AppState.Converting && conversionStatus()}>
					<div class={styles.convertContainer} style={{ display: "block" }}>
						Converting
						<h3>
							<label for="conversionProgress">
								{conversionStatus()?.percent?.toPrecision(3)}%
							</label>
						</h3>
						<br />
						<div
							class={styles.conversionProgress}
							style={{
								"--progress": (conversionStatus()?.percent || 0) / 100 || 0,
							}}
						></div>
					</div>
				</Match>
				<Match
					when={
						appState() === AppState.FinishedConverting &&
						conversionStatus() &&
						conversionStatus()!.completed
					}
				>
					<div class={styles.convertContainer} style={{ display: "block" }}>
						<h3>Success</h3>
						<span style={{ opacity: 0.4 }}>
							Converted in {((Date.now() - startTime) / 1000).toFixed(1)}s
						</span>
					</div>
					<Button
						fullWidth
						onClick={() =>
							(window.location.href = conversionStatus()!.filename)
						}
					>
						Download
					</Button>
				</Match>
			</Switch>
		</div>
	);
};

function getExt(mimeType: string): string {
	const [_, ext] = mimeType.split("/");
	console.log(mimeType);
	return mimeTypeToExt(ext);
}

export default App;
