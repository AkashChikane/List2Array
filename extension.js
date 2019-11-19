
const vscode = require('vscode');


/**
 * @param {string} code
 */
function getarraytext(code,extension)
{
	var start="["
	var end="]"
	var varname="arr="
	if(extension==='java')
		{
			start='{'
			end='};'
		}
	

	var a=code.split("\n");
	var x=""+start;
	var isnum=false;
	a.forEach(element => {
		
		if(Number.isFinite(Number(element))){
			element=element.trim();
			x+=""+element+",";
			isnum=true;
		}
		else
		{
			element=element.trim();
			x+="\""+element+"\",";
		}				
	});	
	x=x.substr(0,x.length-1);
	x+=""+end;
	
	if(extension==='java')
	{
		if(isnum)
		varname="int[] arr="
		else
		varname="String[] arr="
	}
	if(extension==='js')
	{
		varname="var arr="
	}
	
	x=varname+x
	console.log(x);
	return x;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


	console.log(' extension "List2Array" is now active!');


	let disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		var editor = vscode.window.activeTextEditor;
		if(editor)
		{
			var start=editor.selection.start;
			console.log(start);
			console.log(editor.document.fileName);
			var end=editor.selection.end;
			var text = editor.document.getText(editor.selection);
			;
			editor.edit(editBuilder => {
				var x=getarraytext(text,editor.document.fileName.split(".").pop()).search("arr");
				console.log(x);
				
				editBuilder.replace(editor.selection,getarraytext(text,editor.document.fileName.split(".").pop()));
				/*editor.selection=new vscode.Selection(start,start)
				var e1=start.with(start.line,start.character+x+2);
				editor.selection=new vscode.Selection(start,e1)
				/*console.log(e1);
				//editor.selection = new vscode.Selection(start,e1);
				console.log(editor.selection);
				console.log("before");
				
				editor.selection=new vscode.Selection(start,e1)
				//vscode.commands.executeCommand("editor.action.select");
				console.log("after");
				
				console.log(editor.selection);*/						

			});
		}
		// Display a message box to the user
		vscode.window.showInformationMessage('Sucess !');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
