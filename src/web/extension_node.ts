// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fetch from "node-fetch";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ftech-csvtocode.generateBindings', generateBindingsCommand);
    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

async function generateBindingsCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'csv') {
        vscode.window.showErrorMessage('Please open a CSV file to generate bindings.');
        return;
    }

    const targetLanguage = vscode.workspace.getConfiguration('ftech-csvtocode')['language'];
    const vsCodeLang = targetLanguage.toLowerCase().replace("#", "sharp");
    vscode.window.showErrorMessage(`Lang: ${vsCodeLang}`);

    const csvContent = editor.document.getText();
    const bindings = await generateBindings(csvContent, vsCodeLang);
    const newFile = await vscode.workspace.openTextDocument({ content: bindings, language: vsCodeLang });
    vscode.window.showTextDocument(newFile);
}

async function generateBindings(csvContent: string, language: string): Promise<string> {
    const apiUrl = 'https://coder.farawaytech.com/api/csvtocode';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvContent, language })
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