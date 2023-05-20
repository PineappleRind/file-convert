import {
  Component,
  Match,
  Show,
  Switch,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";

import ExtDropdown from "./components/ExtDropdown.jsx";
import FileChoose from "./components/FileChoose.jsx";
import Button from "./components/Button.jsx";
import styles from "./css/App.module.css";
import { mimeTypeToExt as map } from "./globals.js";

const fetchURL = "http://localhost:8000";
enum AppState {
  ChooseFile,
  ReadyToConvert,
  FinishedConverting,
}

const App: Component = () => {
  const [file, setFile] = createSignal<Blob | null>(null);
  const [targetExt, setTargetExt] = createSignal(null);
  const [appState, setAppState] = createSignal<AppState>(AppState.ChooseFile);
  let finishedFileURL = null;
  createEffect(() => {
    if (file() && appState() === AppState.ChooseFile)
      setAppState(AppState.ReadyToConvert);
  });

  async function submit() {
    if (!file() || !targetExt()) return alert("No file selected");
    const formData = new FormData();
    formData.append("file", file());
    finishedFileURL = createResource(async () => {
      let req = await fetch(
        `${fetchURL}/convert/${getExt(file().type)}/${targetExt()}`,
        {
          method: "POST",
          body: formData,
        }
      );
      return await req.json();
    })[0];

    setAppState(AppState.FinishedConverting);
  }
  let fileChooser = <FileChoose signal={setFile} />;
  return (
    <>
      <Switch>
        <Match when={appState() === AppState.ChooseFile}>{fileChooser}</Match>
        <Match when={appState() === AppState.ReadyToConvert && file()}>
          <div class={styles.convertContainer}>
            <p>Convert</p>
            {fileChooser}
            <p>to</p>
            <ExtDropdown
              selectedFile={file()}
              valueBroadcaster={setTargetExt}
            />
          </div>
          <Button fullWidth onClick={submit}>
            Go
          </Button>
        </Match>
        <Match
          when={appState() === AppState.FinishedConverting && finishedFileURL()}
        >
          <div class={styles.convertContainer} style={{ display: "block" }}>
            <p>Completed</p>
            <Button
              onClick={() =>
                (window.location.href = finishedFileURL().filename)
              }
            >
              Download
            </Button>
          </div>
        </Match>
      </Switch>
    </>
  );
};

function getExt(mimeType: string): string {
  const [_, ext] = mimeType.split("/");
  console.log(mimeType);
  return map[ext as keyof typeof map] ? map[ext as keyof typeof map] : ext;
}

export default App;
