import { Setter, Show, createSignal } from "solid-js";
import { exts } from "../globals";
import styles from "../css/FileChoose.module.css";

interface FileChooseProps {
	onFileChoose: Setter<File | null>;
}

export default ({ onFileChoose: signal }: FileChooseProps) => {
	const [file, setFile] = createSignal<File | null>(null);
	let fileInput;

	function updateFile(files: FileList | null) {
		const file = files && files[0];
		if (file && !validateFile(file))
			return alert("This file type is not accepted");
		signal(file);
		// after 400ms so that the transition works properly
		setTimeout(() => {
			setFile(file);
		}, 400);
	}

	function validateFile(file: File) {
		const [type] = file.type.split("/");
		return !!exts[type];
	}

	return (
		<div class={styles.fileChoose}>
			<Show
				when={file()}
				fallback={
					<label class={styles.fileChooseButton} for="fileUpload">
						Choose a file...
					</label>
				}
			>
				<p class={styles.fileType}>{file()!.type}</p>
				<div style={{ display: "flex", "align-items": "center" }}>
					<p class={styles.fileName}>{file()!.name}</p>
					<div onClick={() => updateFile(null)} class={styles.removeFile}>
						&times;
					</div>
				</div>
			</Show>
			<input
				type="file"
				id="fileUpload"
				onInput={(e: InputEvent) =>
					updateFile((e.target as HTMLInputElement).files)
				}
				class={styles.nativeFileInput}
				ref={fileInput}
			></input>
		</div>
	);
};
