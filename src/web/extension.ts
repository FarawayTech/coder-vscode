// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Response as NodeResponse } from "node-fetch";

type CommonResponse = NodeResponse | Response;

let commonFetch: (input: string, init?: any) => Promise<CommonResponse>;

async function resolveFetch() {
  if (typeof process === "object") {
    commonFetch = (await import("node-fetch")).default;
  } else {
    commonFetch = fetch;
  }
}

void resolveFetch();

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ftech-csvtocode.generateBindings', generateBindingsCommand);

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function getFileContent(uri: vscode.Uri): Promise<string> {
	const fileContent = await vscode.workspace.fs.readFile(uri);
	return Buffer.from(fileContent).toString('utf-8');
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
		const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvContent })
        });

        if (!response.ok) {
            throw new Error(`Error communicating with the Coder API: ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to process CSV: ${error}`);
        throw error;
    }
}