import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
	initalValue: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initalValue }) => {
	return (
		<MonacoEditor
			value={initalValue}
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
