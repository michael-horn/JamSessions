var drum_animations = { };


function initDrumkit(selector) {
  //----------------------------------------------------
  // get objects from the drumkit SVG
  //----------------------------------------------------
  var sr = $(selector + ' .instrument-container')[0].shadowRoot;
  crashCymbolAll = $(sr).find('#Crash-All');
  crashCymbol = $(sr).find('#crash');

  rightTomDrumAll = $(sr).find('#Tom-Right-All');
  rightTomDrum = $(sr).find('#high-tom');

  leftTomDrumAll = $(sr).find('#Tom-Left-All');
  leftTomDrum = $(sr).find('#mid-tom');

  floorTomDrumAll = $(sr).find('#floor-tom');

  snareDrumAll = $(sr).find('#Snare');
  snareDrum = $(sr).find('#snare1');

  kickDrumAll = $(sr).find('#kick');

  hiHatAll = $(sr).find('#hat');
  hiHatTop = $(sr).find('#Hi-Hat-Top');
  hiHatBottom = $(sr).find('#Hi-Hat-Bottom');


  //----------------------------------------------------
  // create animations for each drum
  //----------------------------------------------------
  var crashtl = new TimelineMax({ paused: true });
  crashtl.to(crashCymbol, 0.1, {rotation: 8, transformOrigin: "50% 50%"})
         .to(crashCymbol,1.5, {rotation: 0, transformOrigin: "50% 50%", ease: Elastic.easeOut.config(2.5, 0.3)});

  var rightTomtl = new TimelineMax({ paused: true });
  rightTomtl.to(rightTomDrum, 0.1, {scaleX: 1.04, transformOrigin: "50% 50%", ease: Expo.easeOut})
            .to(rightTomDrum, 0.1, {scaleY: 0.95, transformOrigin: "50% 50%", ease: Expo.easeOut}, '0')
            .to(rightTomDrumAll, 0.1, {rotation: 2.5, transformOrigin: "0 50%", ease: Elastic.easeOut}, '0')
            .to(rightTomDrum, 0.4, {scale: 1, transformOrigin: "50% 50%", ease: Elastic.easeOut})
            .to(rightTomDrumAll, 0.6, {rotation: 0, transformOrigin: "0 50%", ease: Elastic.easeOut}, '-=0.4');

  var leftTomtl = new TimelineMax({ paused: true });
  leftTomtl.to(leftTomDrum, 0.1, {scaleX: 1.04, transformOrigin: "50% 50%", ease: Expo.easeOut})
          .to(leftTomDrum, 0.1, {scaleY: 0.95, transformOrigin: "50% 50%", ease: Expo.easeOut}, '0')
          .to(leftTomDrumAll, 0.1, {rotation: -2.5, transformOrigin: "100% 50%", ease: Elastic.easeOut}, '0')
          .to(leftTomDrum, 0.4, {scale: 1, transformOrigin: "50% 50%", ease: Elastic.easeOut})
          .to(leftTomDrumAll, 0.6, {rotation: 0, transformOrigin: "100% 50%", ease: Elastic.easeOut}, '-=0.4');

  var floorTomtl = new TimelineMax({ paused: true });
  floorTomtl.to(floorTomDrumAll, 0.1, {scaleX: 1.02, transformOrigin: "50% 50%", ease: Expo.easeOut})
            .to(floorTomDrumAll, 0.1, {scaleY: 0.95, transformOrigin: "50% 100%", ease: Expo.easeOut}, '0')
            .to(floorTomDrumAll, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

  var snaretl = new TimelineMax({ paused: true });
  snaretl.to(snareDrum, 0.1, {scaleX: 1.04, transformOrigin: "50% 50%", ease: Expo.easeOut})
         .to(snareDrum, 0.1, {scaleY: 0.9, transformOrigin: "50% 100%", ease: Expo.easeOut}, '0')
         .to(snareDrum, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

  var kicktl = new TimelineMax({ paused: true	});
  kicktl.to(kickDrumAll, 0.1, {scale: 1.02, transformOrigin: "50% 100%", ease: Expo.easeOut})
        .to(kickDrumAll, 0.4, {scale: 1, transformOrigin: "50% 100%", ease: Elastic.easeOut});

  var hiHattl = new TimelineMax({ paused: true });
  hiHattl.to([hiHatTop, hiHatBottom], 0.1, {rotation: -4, transformOrigin: "50% 50%"})
         .to([hiHatTop, hiHatBottom], 0.6, {rotation: 0, transformOrigin: "50% 50%", ease: Elastic.easeOut.config(1.5, 0.2)});


  drum_animations[selector] = {
    "snare1" : snaretl,
    "floor-tom" : floorTomtl,
    "hat" : hiHattl,
    "mid-tom" : leftTomtl,
    "high-tom" : rightTomtl,
    "kick" : kicktl,
    "crash" : crashtl
  };
}

//----------------------------------------------------
// animation trigger functions
//----------------------------------------------------
function animateDrum(selector, name) {
  if (!drum_animations[selector]) {
    initDrumkit(selector);
  }
  if (drum_animations[selector] && drum_animations[selector][name]) {
    let timeline = drum_animations[selector][name];
    //if (!timeline.isActive()) {
      timeline.restart();
      timeline.play();
    //}
  }
}
