import { Setter, Show, createSignal } from "solid-js";
import { exts } from "../globals";
import styles from "../css/FileChoose.module.css";

interface FileChooseProps {
	onFileChoose: Setter<File | null>;
}

export default ({ onFileChoose: signal }: FileChooseProps) => {
	const [file, setFile] = createSignal<File | null>(null);
	let fileInput, fileDropArea: HTMLDivElement;

	function updateFile(files: File[] | null) {
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

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer?.items) {
			// Use DataTransferItemList interface to access the file(s)
			[...e.dataTransfer.items].forEach((item, i) => {
				// If dropped items aren't files, reject them
				if (item.kind !== "file") return;
				const file = item.getAsFile();
				if (!file) return;
				updateFile([file]);
			});
		} else {
			// Use DataTransfer interface to access the file(s)
			[...e.dataTransfer!.files].forEach((file, i) => {
				updateFile([file]);
			});
		}
	}
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDragEnter(e: DragEvent) {
		fileDropArea.classList.add(styles.dragActive);
	}

	function handleDragLeave(e: DragEvent) {
		fileDropArea.classList.remove(styles.dragActive);
	}
	return (
		<div
			class={styles.fileChoose}
			ondragover={handleDragOver}
			ondragenter={handleDragEnter}
			ondragstart={handleDragEnter}
			ondragleave={handleDragLeave}
			ondragend={handleDragLeave}
			ondrop={handleDrop}
			ref={fileDropArea}
		>
			<Show
				when={file()}
				fallback={
					<label
						ondragenter={(e) => e.stopPropagation()}
						class={styles.fileChooseButton}
						for="fileUpload"
					>
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
					updateFile(
						Array.from((e.target as HTMLInputElement).files as FileList),
					)
				}
				class={styles.nativeFileInput}
				ref={fileInput}
			></input>
		</div>
	);
};
