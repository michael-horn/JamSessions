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
// Encode raw audio data as MP3 with single audio channel
//  data: Int16Array containing audio buffer data
//  channels: int containing the number of channels to export
//  rate: int containing sample rate (e.g. 44100)
//----------------------------------------------------------
function encodeMP3Mono(data, rate) {
  let kbps = 128; // encode 128 kbps mp3
  let blockSize = 1152;
  let blocks = [];
  let channels = 1;
  let length = 0;

  mp3encoder = new lamejs.Mp3Encoder(channels, rate, kbps);

  for (let i=0; i < data.length; i += blockSize) {
    let chunk = data.subarray(i, i + blockSize);
    let encoded = mp3encoder.encodeBuffer(chunk);
    if (encoded.length > 0) {
      blocks.push(encoded);
      length += encoded.length;
    }
  }

  let encoded = mp3encoder.flush();   //finish writing mp3

  if (encoded.length > 0) {
    blocks.push(encoded);
    length += encoded.length;
  }

  return _flattenBlocks(blocks, length);
}


//----------------------------------------------------------
// Encode raw audio data as MP3 with two audio channels
//  left: Int16Array containing audio buffer data
//  right: Int16Array containing audio buffer data
//  channels: int containing the number of channels to export
//  rate: int containing sample rate (e.g. 44100)
//----------------------------------------------------------
function encodeMP3Stereo(left, right, rate) {
  let kbps = 128; // encode 128 kbps mp3
  let blockSize = 1152;
  let blocks = [];
  let channels = 2;
  let length = 0;

  mp3encoder = new lamejs.Mp3Encoder(channels, rate, kbps);

  for (let i=0; i < left.length; i += blockSize) {
    let leftChunk = left.subarray(i, i + blockSize);
    let rightChunk = right.subarray(i, i + blockSize);
    let encoded = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (encoded.length > 0) {
      blocks.push(encoded);
      length += encoded.length;
    }
  }

  let encoded = mp3encoder.flush();   //finish writing mp3

  if (encoded.length > 0) {
    blocks.push(encoded);
    length += encoded.length;
  }

  return _flattenBlocks(blocks, length);
}


function _flattenBlocks(blocks, length) {
  let mp3Data = new Uint8Array(length);
  let index = 0;
  for (let i=0; i<blocks.length; i++) {
    mp3Data.set(blocks[i], index);
    index += blocks[i].length;
  }
  return mp3Data;
}

