// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ftech-csvtocode.generateBindings', generateBindingsCommand);

    context.subscriptions.push(disposable);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate1(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "ftech-csvtocode" is now active in the web extension host');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('ftech-csvtocode.generateBindings', async (uri: vscode.Uri) => {
		try {
		  const fileContent = await getFileContent(uri);
		  const result = await sendToAPI(fileContent);
		  displayResult(result);
		} catch (error) {
		  vscode.window.showErrorMessage(`Failed to process CSV: ${error}`);
		}
	  });

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function getFileContent(uri: vscode.Uri): Promise<string> {
	const fileContent = await vscode.workspace.fs.readFile(uri);
	return Buffer.from(fileContent).toString('utf-8');
  }
  
  async function sendToAPI(fileContent: string): Promise<any> {
	const apiUrl = 'https://coder.farawaytech.com/api/csvtocode';
	const options = {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({ fileContent }),
	  };
	  const response = await fetch(apiUrl, options);
	  const result = await response.json();
	  return result;
  }
  
  function displayResult(result: any) {
	const panel = vscode.window.createWebviewPanel(
	  'resultView',
	  'C# Generated Code',
	  vscode.ViewColumn.Two,
	  {}
	);
	panel.webview.html = `
	  <html>
	  <head>
		<style>
		  body {
			margin: 0;
			padding: 0;
			font-family: sans-serif;
		  }
		  pre {
			white-space: pre-wrap;
		  }
		</style>
	  </head>
	  <body>
		<pre>${JSON.stringify(result, null, 2)}</pre>
	  </body>
	  </html>
	`;
  }

async function generateBindingsCommand() {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== 'csv') {
		vscode.window.showErrorMessage('Please open a CSV file to generate bindings.');
		return;
	}
	const csvContent = editor.document.getText();
	const bindings = await generateBindings(csvContent);
	const newFile = await vscode.workspace.openTextDocument({ content: bindings, language: 'csharp' });
	vscode.window.showTextDocument(newFile);
}

  async function generateBindings(csvContent: string): Promise<string> {
    const apiUrl = 'https://coder.farawaytech.com/api/csvtocode';

    try {
		const response = await axios.post(apiUrl, { "csvContent": csvContent });
        return response.data;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to process CSV: ${error}`);
        throw error;
    }
}