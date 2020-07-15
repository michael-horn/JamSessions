/*
 * TunePad
 *
 * Michael S. Horn
 * Northwestern University
 * michael-horn@northwestern.edu
 * Copyright 2020, Michael S. Horn
 *
 * This project was funded by the National Science Foundation (grant DRL-1612619).
 * Any opinions, findings and conclusions or recommendations expressed in this
 * material are those of the author(s) and do not necessarily reflect the views
 * of the National Science Foundation (NSF).
 */

var _cmEditors = { };

var _errorLines = { };
var _traceLine = { };


function codemirror(selector, content) {
  var container = document.querySelector(selector);
  var editor;

  if (container) {
    editor = CodeMirror(container, {
      value: content,
      mode: {name: "python", version: 3, singleLineStringErrors: false},
      lineNumbers: true,
      theme: "tunepad-dark",
      foldGutter: true,
      //fixedGutter: false,  // gutters scroll along with horizontal content
      fixedGutter: true,
      gutters: ["trace", "CodeMirror-linenumbers", "breakpoints", "CodeMirror-foldgutter"],
      styleActiveLine: true,
      indentUnit: 4,
      matchBrackets: true,
      search: true,
      extraKeys: {
        "Tab": function(cm){
            cm.replaceSelection("    " , "end");
        },
        "Ctrl-L": "jumpToLine",
        "Cmd-L": "jumpToLine"
      }
    });
    editor.on('change', function(cMirror, change) {
      onEditorUpdate(selector, JSON.stringify(change));
    });
    editor.on('cursorActivity', function(cMirror) {
      onCursorActivity(selector, JSON.stringify(cMirror.getCursor()));
    });
    editor.on('blur', function() {
      onBlur(selector);
    });
    editor.on('focus', function() {
      onFocus(selector);
    });
    editor.on('scrollCursorIntoView', function(cMirror, event){
      event.preventDefault();  // prevent phantom scrolling in drumcircles
    });
    _cmEditors[selector] = editor;
    _errorLines[selector] = [ ];
    _traceLine[selector] = null;

  }
}


//----------------------------------------------------------
// concurrent multi-user editing with firepad
//----------------------------------------------------------
/*
function connectFirepad(selector, directory) {
  if (_cmEditors[selector]) {
    editor = _cmEditors[selector];
    let ref = firebase.database().ref(directory);
    Firepad.fromCodeMirror(ref, editor);
  }
}
*/

//----------------------------------------------------------
// get code from a code mirror editor
//----------------------------------------------------------
function getCode(selector) {
  if (_cmEditors[selector]) {
    return _cmEditors[selector].getValue();
  }
  return "";
}


//----------------------------------------------------------
// set code for a code mirror editor
//----------------------------------------------------------
function setCode(selector, code) {
  if (_cmEditors[selector]) {
    return _cmEditors[selector].setValue(code);
  }
  return "";
}


//----------------------------------------------------------
// replace text in given range (does not trigger editor events)
//----------------------------------------------------------
function replaceRange(selector, jsonString) {
  if (_cmEditors[selector]) {
    let cm = _cmEditors[selector];
    let changes = JSON.parse(jsonString);
    cm.replaceRange(changes.text, changes.from, changes.to, changes.origin);
  }
}


//----------------------------------------------------------
// set the codemirror cursor position
//----------------------------------------------------------
function setCursorPosition(selector, line, col) {
  if (_cmEditors[selector]) {
    _cmEditors[selector].focus();
    _cmEditors[selector].setCursor({line: line - 1, ch: col});
  }
}


//----------------------------------------------------------
// set / clear an error marker
//----------------------------------------------------------
function setErrorMarker(selector, line) {
  if (_cmEditors[selector]) {
    var marked = _cmEditors[selector].addLineClass(line - 1, "gutter", "error");
    _cmEditors[selector].addLineClass(line - 1, "text", "error");
    _errorLines[selector].push(marked);
  }
}

function clearErrorMarkers(selector) {
  if (_cmEditors[selector]) {
    for (let marked of _errorLines[selector]) {
      _cmEditors[selector].removeLineClass(marked, "gutter", "error");
      _cmEditors[selector].removeLineClass(marked, "text", "error");
    }
    _errorLines[selector] = [];
  }
}


//----------------------------------------------------------
// trace a line
//----------------------------------------------------------
function setTraceMarker(selector, line) {
  if (_cmEditors[selector]) {
    clearTraceMarkers(selector);
    _traceLine[selector] = _cmEditors[selector].addLineClass(line - 1, "gutter", "trace");
    _cmEditors[selector].addLineClass(line - 1, "text", "trace");
  }
}


function clearTraceMarkers(selector) {
  if (_cmEditors[selector] && _traceLine[selector] != null) {
    _cmEditors[selector].removeLineClass(_traceLine[selector], "text", "trace");
    _cmEditors[selector].removeLineClass(_traceLine[selector], "gutter", "trace");
    _traceLine[selector] = null;
  }
}
