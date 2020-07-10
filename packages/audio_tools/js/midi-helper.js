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


//----------------------------------------------------------
// DART DEFINED FUNCTIONS
//----------------------------------------------------------
//  midiEvent   -- midi input event from a device
//  midiConnection  -- new device connected or disconnected

var midiAccess = null;


//----------------------------------------------------------
// Sets up the MIDIAccess object and starts listening for events.
//----------------------------------------------------------
function midiInit() {
  if (typeof navigator.requestMIDIAccess === "function") {
    navigator.requestMIDIAccess({ sysex: true }).then(
      function (midi) {
        midiAccess = midi;
        console.log("Connected to MIDI.");
        midi.onstatechange = _midiConnection;
        for (let input of midi.inputs.values()) {
          input.onmidimessage = _midiEvent;
        }
        for (let output of midi.outputs.values()) {
          output.open();
        }
      },
      function () { 
        console.log("Failed to initialize web MIDI."); 
      });
  }
}


//----------------------------------------------------------
// Send command to midi output device
//    port : port number
//    command : 8 OFF, 9 ON
//    note : midi note number
//    velocity : note velocity for note on events
//----------------------------------------------------------
function midiSendMessage(port, command, note, velocity) {
  if (midiAccess == null) return;
  for (let mout of midiAccess.outputs.values()) {
    if (port == null || mout.id == port) {
      _midiSendCommand(mout, command, note, velocity);
    }
  }
}


//----------------------------------------------------------
// MIDI file export. 
//
// bpm: beats per minute from project (int)
// trace: stringified JSON trace object from TunePad
//----------------------------------------------------------
function exportMidi(bpm, traceString) {
  let trace = JSON.parse(traceString);

  if (Number.isInteger(bpm) && Array.isArray(trace)) {

    let file = new Midi.File();
    let track = new Midi.Track();
    file.addTrack(track);
    track.setTempo(bpm);


    let allCommands = []
    for (let command of trace) {

      /* If play command, convert from beats to ticks */
      if (command.command === "play") {
        command.time *= 128;
        command.duration *= 128;

        /* Create corresponding off events */
        allCommands.push(command);
        let newCommand = JSON.parse(JSON.stringify(command))
        newCommand.command = 'off';
        newCommand.time = command.time + command.duration;
        allCommands.push(newCommand)
      }
    } 

    /* Sort all on and off commands by time */
    allCommands = sort_by_key(allCommands, 'time')

    /* Iterate through all commands, if play then add noteOn else, add noteOff */
    let numCommands = allCommands.length;
    let lastTime = 0;
    for (var i = 0; i < numCommands; i++) {
      let command = allCommands[i]

      if (command.command === 'play') {
        let note = command.params.note;
        let velocity = command.params.velocity;
        let delta = command.time - lastTime;
        track.addNoteOn(0,note,delta,velocity);
        lastTime = command.time;
      } 
      else if (command.command==='off') {
        let note = command.params.note;
        let velocity = command.params.velocity;
        let delta = command.time - lastTime;
        track.addNoteOff(0,note,delta,velocity);
        lastTime = command.time;
      }
    }
    return file.toBytes();
  }
  return null;
}


function sort_by_key(array, key) {
  return array.sort(function(a, b) {
    let x = a[key]; let y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}


function _midiSendCommand(mout, command, note, velocity) {
  if (mout != null && mout.connection == 'open') {
    mout.send( [ command, note, velocity ] );    
  }
}


//----------------------------------------------------------
// Fired when midi devices are added or removed. The 
// parameter passed is a MIDIConnectionEvent.
//----------------------------------------------------------
function _midiConnection( event ) {
  var port = event.port; // MIDIPort
  if (port.type == "input" && port.state == "connected") {
    port.onmidimessage = _midiEvent;
  }
  else if (port.type == "output" && port.state == "connected") {
    port.open();
  }
  let portData = {
    port : port.id,
    name : port.name,
    type : port.type,
    state : port.state,
    connection : port.connection,
    manufacturer : port.manufacturer
  };
  midiConnection(JSON.stringify(portData));
}


//----------------------------------------------------------
// Processes incoming midi events and send it to a dart 
// callback function
//----------------------------------------------------------
function _midiEvent(event) {
  let cmd = event.data[0] >> 4;
  let channel = event.data[0] & 0xf;
  let note = event.data[1];
  let velocity = 0;
  if (event.data.length >= 3) velocity = event.data[2];
  let portData = {
    port : event.target.id,
    name : event.target.name,
    command : cmd,
    channel : channel,
    note : note,
    velocity : velocity,
    timestamp :  event.timeStamp
  };
  midiEvent(JSON.stringify(portData));   // call dart
}
