/*
 * TunePad
 *
 * Michael S. Horn
 * Northwestern University
 * michael-horn@northwestern.edu
 * Copyright 2018, Michael S. Horn
 *
 * This project was funded by the National Science Foundation (grant DRL-1612619).
 * Any opinions, findings and conclusions or recommendations expressed in this
 * material are those of the author(s) and do not necessarily reflect the views
 * of the National Science Foundation (NSF).
 */
importScripts('skulpt.min.js', 'skulpt-stdlib.js');


// output buffer
var outputs = [ ];
var modules = { };

//----------------------------------------------------------
// generate python error message callback
//----------------------------------------------------------
function pythonError(err) {
  var line = -1;
  var name = err.tp$name;
  var message = "";
  var details = "";

  // message
  if (err.args && err.args.v.length > 0) {
    message = err.args.v[0].v;
  }

  // details
  if (err.args && err.args.v.length >= 4) {
    if (err.args.v[3].length >= 3) {
      details = err.args.v[3][2];
    }
  }

  // line number
  if (err.traceback && err.traceback.length !== 0) {
    line = err.traceback[0].lineno;
  }

  postMessage( [ "error", name, message, details, line ] );
}


//----------------------------------------------------------
// add output to our string buffer
//----------------------------------------------------------
function pythonOutput(v) {
  var s = v.replace(/\s*$/,"");
  outputs.push( (s == '') ? v : s);

  /// infinite loop??
  if (outputs.length > 50000) {
    pythonDone();
    throw("Overrun: Do you have an infinite loop? ");
  }
}


//----------------------------------------------------------
// send a done message and terminate the worker thread
//----------------------------------------------------------
function pythonDone() {
  postMessage( [ "done", outputs ]);
  close(); // close the web worker
}



//----------------------------------------------------------
// loads python libraries
//----------------------------------------------------------
function builtinRead(x) {
  if (x.startsWith('./tunepad') && x.endsWith('.py')) {
    let module = x.substring(2, x.length - 3);
    if (module in modules) {
      return modules[module];
    } else {
      postMessage( [ "import", module ] );
      return '';
    }
  }
  else if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
    throw "File not found: '" + x + "'";
  }
  return Sk.builtinFiles["files"][x];
}


//----------------------------------------------------------
// run a python program
//----------------------------------------------------------
function pythonRun(code) {
  _traceCount = 0;
  Sk.configure( { output : pythonOutput, read : builtinRead } );
  var myPromise = Sk.misceval.asyncToPromise(function() {
    return Sk.importMainWithBody("<stdin>", false, code, true);
  });

  // add a separator after the program runs
  myPromise.then(
    function(mod) {
      pythonDone();
    },

    function(err) {
      pythonError(err);
      pythonDone();
    }
  );
}


//----------------------------------------------------------
// when we receive a message from the main thread, kick off
// the compile process...
//----------------------------------------------------------
onmessage = function(e) {
  modules = e.data[1];
  pythonRun(e.data[0]);
}
