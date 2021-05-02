import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';

interface CodeEditorProps {
	initalValue: string;
	onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initalValue }) => {
	const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
		monacoEditor.onDidChangeModelContent(() => {
			onChange(getValue());
		});
	};

	return (
		<MonacoEditor
			value={initalValue}
			editorDidMount={onEditorDidMount}
			theme="dark"
			language="javascript"
			height="500px"
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
	);
};

export default CodeEditor;
