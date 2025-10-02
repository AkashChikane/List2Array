const vscode = require('vscode');

// Using a map for better scalability and readability
const languageSettings = new Map([
    ['javascript', { start: '[', end: ']', declaration: 'var' }],
    ['js', { start: '[', end: ']', declaration: 'var' }],
    ['typescript', { start: '[', end: ']', declaration: 'let' }],
    ['ts', { start: '[', end: ']', declaration: 'let' }],
    ['python', { start: '[', end: ']' }],
    ['py', { start: '[', end: ']' }],
    ['java', { start: '{', end: '};', intType: 'int[]', stringType: 'String[]' }],
    ['csharp', { start: '{', end: '};', intType: 'new int[]', stringType: 'new string[]' }],
    ['cs', { start: '{', end: '};', intType: 'new int[]', stringType: 'new string[]' }],
    ['cpp', { start: '{', end: '};', intType: 'int', stringType: 'std::string', suffix: '[]' }],
]);

function getArrayText(code, extension) {
    const config = vscode.workspace.getConfiguration('list2array');
    const includeVariableName = config.get('includeVariableName', true);
    const customVariableName = config.get('variableName', 'arr');

    // Default to a generic array format if the language is not configured
    const lang = languageSettings.get(extension) || { start: '[', end: ']' };

    const lines = code.split(/\r?\n/).map(line => line.trim()).filter(line => line);
    if (lines.length === 0) {
        return '';
    }

    // A more robust check for numeric values, allowing for floats and negatives.
    const isNumeric = lines.every(line => !isNaN(parseFloat(line)) && isFinite(line));

    const items = isNumeric
        ? lines.join(', ')
        : lines.map(line => `"${line.replace(/"/g, '\\"')}"`).join(', ');

    let arrayLiteral = `${lang.start}${items}${lang.end}`;

    if (!includeVariableName) {
        // For C#, we need the type declaration even without a variable name
        if (extension === 'csharp' || extension === 'cs') {
             return isNumeric ? `${lang.intType}${arrayLiteral}` : `${lang.stringType}${arrayLiteral}`;
        }
        return arrayLiteral;
    }

    let declaration;
    const variableName = `${customVariableName}${lang.suffix || ''}`;

    // Handle C# separately due to its unique syntax `var name = new type[]{...};`
    if (extension === 'csharp' || extension === 'cs') {
        const type = isNumeric ? lang.intType : lang.stringType;
        return `var ${customVariableName} = ${type}${arrayLiteral}`;
    }

    if (lang.declaration) { // For languages like JS, TypeScript
        declaration = `${lang.declaration} ${variableName} = `;
    } else if (lang.intType && lang.stringType) { // For languages like Java, C++
        if (isNumeric) {
            declaration = `${lang.intType} ${variableName} = `;
        } else {
            declaration = `${lang.stringType} ${variableName} = `;
        }
    } else { // For languages like Python and the default case
        declaration = `${variableName} = `;
    }

    return `${declaration}${arrayLiteral}`;
}


function activate(context) {
    console.log('extension "List2Array" is now active!');

    let disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showWarningMessage('No text selected. Please select a list to convert.');
            return;
        }

        const fileExtension = editor.document.fileName.split('.').pop()?.toLowerCase() || '';

        const arrayText = getArrayText(text, fileExtension);

        editor.edit(editBuilder => {
            editBuilder.replace(selection, arrayText);
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage('List converted to array successfully!');
            } else {
                vscode.window.showErrorMessage('Failed to convert list to array.');
            }
        });
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
    activate,
    deactivate
};