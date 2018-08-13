'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ts from 'typescript';

function analysisCode(code: string) {
    const ast = ts.createSourceFile(
        "",
        code,
        ts.ScriptTarget.ES2015,
        true,
        ts.ScriptKind.TSX
    );

    let commentLine = 0;
    let commentPoses = [];

    function findCommentPos(node: ts.Node) {
        if (!commentPoses.find(num => num === node.getFullStart())) {
            commentPoses.push(node.getFullStart());
        }

        if (node) {
            ts.forEachChild(node, findCommentPos);
        }
    }

    ts.forEachChild(ast, findCommentPos);

    commentPoses.forEach(pos => {
        const comments = ts.getLeadingCommentRanges(code, pos);

        comments && comments.forEach(comment => {
            const commentCode = code.slice(comment.pos, comment.end);
            console.log(commentCode);
            commentLine += commentCode.split('\n').length;
        });
    })

    return '代码注释率: ' + (commentLine / code.split('\n').length * 100 + '').slice(0, 4) + '%';
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const rateBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);

    function showRate(editor: vscode.TextEditor) {
        const code = editor.document.getText();
        const rate = analysisCode(code);
        rateBar.text = rate;
        rateBar.color = 'yellow';
        rateBar.show();
    }

    if (vscode.window.activeTextEditor) {
        showRate(vscode.window.activeTextEditor);
    }

    vscode.window.onDidChangeActiveTextEditor(showRate);
}

// this method is called when your extension is deactivated
export function deactivate() {
}