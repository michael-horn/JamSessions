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

var _quillEditors = { };


function initQuillEditor(selector, placeholderText) {
  let Font = Quill.import('formats/font');
  Font.whitelist = ['bold', 'monospace'];
  Quill.register(Font, true);

  var quill = new Quill(selector, {
    modules: {
      imageResize: {modules: [ 'Resize', 'DisplaySize']},
      videoResize: {modules: [ 'Resize', 'DisplaySize', 'Toolbar']},
      toolbar: [
        [{ 'font': ['', 'bold', 'monospace'] }],
        [{ header: [1, 2, 3, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }, 'bold', 'italic', 'link'],
        [{ 'list' : 'ordered' }, { 'list' : 'bullet' } ],
        ['image', 'video', 'code-block'],
        ['clean']
      ],
    },

    placeholder: placeholderText,
    theme: 'snow',  // or 'bubble'
  });

  quill.on('text-change', function(delta, oldDelta, source) {
    onEditorUpdate(selector, JSON.stringify(delta));
  });

  _quillEditors[selector] = quill;

  let showTooltip = (el) => {
      let tool = el.className.replace('ql-', '');
    if (tooltips[tool]) {
      $(el).attr("title",tooltips[tool]);
    }
  };
  let tooltips = {
    'bold': 'Bold (ctrl+B)',
    'italic': 'Italic (ctrl+I)',
    'underline': 'Underline (ctrl+U)',
    'strike': 'Strike'
  };

  let toolbarElement = document.querySelector('.ql-toolbar');
  if (toolbarElement) {
    let matches = toolbarElement.querySelectorAll('button');
    for (let el of matches) {
      showTooltip(el);
    }
  }
}


//----------------------------------------------------------
// get content from a quill editor
//----------------------------------------------------------
function getQuillContent(selector) {
  if (_quillEditors[selector]) {
    return JSON.stringify(_quillEditors[selector].getContents());
  }
  return "";
}


//----------------------------------------------------------
// set contents for a quill editor
//----------------------------------------------------------
function setQuillContent(selector, content) {
  if (_quillEditors[selector]) {
    _quillEditors[selector].setContents(JSON.parse(content));
  }
}


//----------------------------------------------------------
// applies a text delta to quill
//----------------------------------------------------------
function updateQuillContent(selector, delta) {
  if (_quillEditors[selector]) {
    _quillEditors[selector].updateContents(JSON.parse(delta));
  }
}


//----------------------------------------------------------
// get plaintext from a quill editor
//----------------------------------------------------------
function getQuillText(selector) {
  if (_quillEditors[selector]) {
    return JSON.stringify(_quillEditors[selector].getText());
  }
}


//----------------------------------------------------------
// set text for a quill editor
//----------------------------------------------------------
function setQuillText(selector, text) {
  if (_quillEditors[selector]) {
    _quillEditors[selector].setText(text);
  }
}
