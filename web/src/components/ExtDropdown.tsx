import { For, Setter, Show, createComputed, createSignal } from "solid-js";
import styles from "../css/ExtDropdown.module.css";
import { conversions, mimeTypeToExt } from "../globals";

const { extensions } = conversions;
interface ExtDropdownProps {
	valueBroadcaster: Setter<string>;
	selectedFile: Blob | null;
}

export default (props: ExtDropdownProps) => {
	let [selectedFile, setSelectedFile] = createSignal<Blob | null>();
	let selectedFileType = mimeTypeToKeyword(selectedFile()?.type || "");

	createComputed(() => {
		setSelectedFile(props.selectedFile);
		selectedFileType = mimeTypeToKeyword(selectedFile()?.type || "");
	});

	function handler(e: InputEvent) {
		let ext = (e.target as HTMLInputElement).value;
		props.valueBroadcaster(ext);
	}

	function extensionLookup() {
		const type = mimeTypeToExt(selectedFile()?.type.split("/")[1] || "");
		return extensions[selectedFileType].filter((ext) => ext !== type);
	}

	props.valueBroadcaster((extensions[selectedFileType] || [])[0]);

	return (
		<div class={styles.extDropdown}>
			<select onInput={handler}>
				<Show
					when={selectedFile()}
					fallback={
						<option value="" selected>
							no file
						</option>
					}
				>
					{/* I am aware this will show nothing with an invalid type */}
					<For each={extensionLookup()}>
						{(ext) => <option value={ext}>{ext.toUpperCase()}</option>}
					</For>
				</Show>
			</select>
		</div>
	);
};

function mimeTypeToKeyword(mimeType: string) {
	return mimeType.split("/")[0];
}
