import { Component, Match, Switch, createEffect, createSignal } from "solid-js";

import ExtDropdown from "./components/ExtDropdown.jsx";
import FileChoose from "./components/FileChoose.jsx";
import Button from "./components/Button.jsx";
import styles from "./css/App.module.css";
import { mimeTypeToExt as map } from "./globals.js";

const fetchURL = "http://localhost:8000";

enum AppState {
	ChooseFile,
	ReadyToConvert,
	Converting,
	FinishedConverting,
}

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
		[conversionStatus, setConversionStatus] = createSignal({ percent: 0 });

	async function submit() {
		if (!chosenFile() || !targetExt()) return alert("No file selected");
		const formData = new FormData();
		formData.append("file", chosenFile() || "");
		let req = await fetch(
			`${fetchURL}/convert/${getExt(chosenFile().type)}/${targetExt()}`,
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
		// setAppState(AppState.FinishedConverting);
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
		<div ref={transitionContainer} class={styles.transitionContainer}>
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
				<Match when={appState() === AppState.Converting}>
					<div class={styles.convertContainer} style={{ display: "block" }}>
						<label for="conversionProgress">
							Converting... <code>{conversionStatus().percent}%</code>
						</label>
						<br></br>
						<progress
							id="conversionProgress"
							max="100"
							value={conversionStatus().percent}
						></progress>
					</div>
				</Match>
				<Match
					when={
						appState() === AppState.FinishedConverting &&
						conversionStatus() &&
						conversionStatus().completed
					}
				>
					<div class={styles.convertContainer} style={{ display: "block" }}>
						<h3>
							Completed{" "}
							<span style={{ opacity: 0.4 }}>
								in {((Date.now() - startTime) / 1000).toFixed(1)}s
							</span>
						</h3>
						<Button
							fullWidth
							onClick={() =>
								(window.location.href = conversionStatus().filename)
							}
						>
							Download
						</Button>
					</div>
				</Match>
			</Switch>
		</div>
	);
};

function getExt(mimeType: string): string {
	const [_, ext] = mimeType.split("/");
	console.log(mimeType);
	return map[ext as keyof typeof map] ? map[ext as keyof typeof map] : ext;
}

export default App;
