import './code-editor.css';
import './syntax.css';
import { useRef } from 'react';
import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import codeShift from 'jscodeshift';
import Highlighter from 'monaco-jsx-highlighter';

interface CodeEditorProps {
	initalValue: string;
	onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initalValue }) => {
	const editorRef = useRef<any>();

	const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
		editorRef.current = monacoEditor;

		monacoEditor.onDidChangeModelContent(() => {
			onChange(getValue());
		});

		const highlighter = new Highlighter(
			// @ts-ignore
			window.monaco,
			codeShift,
			monacoEditor
		);

		// weird empty functions won't have this thing trying to log error messages every key stroke
		highlighter.highLightOnDidChangeModelContent(
			() => {},
			() => {},
			undefined,
			() => {}
		);
	};

	const onFormatClick = () => {
		// get current value from editor
		const unformatted = editorRef.current.getModel().getValue();

		// format that value
		const formatted = prettier
			.format(unformatted, {
				parser: 'babel',
				plugins: [parser],
				useTabs: true,
				semi: true,
				singleQuote: true,
			})
			.replace(/\n$/, ''); // removes extra newline from prettier

		// set formatted value back in editor
		editorRef.current.setValue(formatted);
	};

	return (
		<div className="editor-wrapper">
			<button
				className="button button-format is-primary is-small"
				onClick={onFormatClick}
			>
				Format
			</button>
			<MonacoEditor
				value={initalValue}
				editorDidMount={onEditorDidMount}
				theme="dark"
				language="javascript"
				height="100%"
				options={{
					wordWrap: 'on',
					minimap: { enabled: false },
					showUnused: false,
					folding: false,
					lineNumbersMinChars: 3,
					fontSize: 16,
					scrollBeyondLastLine: false,
					automaticLayout: true,
				}}
			/>
		</div>
	);
};

export default CodeEditor;
