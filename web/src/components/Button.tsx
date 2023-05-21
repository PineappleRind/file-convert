import { ComponentProps } from "solid-js";
import styles from "../css/Button.module.css";

type ButtonProps = {
	fullWidth?: boolean;
	children: string;
} & ComponentProps<"button">;

export default ({ children, fullWidth, ...props }: ButtonProps) => (
	<button
		{...props}
		class={`${styles.button}${fullWidth ? " " + styles.fullWidth : ""}`}
	>
		{children}
	</button>
);
