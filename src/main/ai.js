import {player, playerType, characterSelections} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";
/* eslint-disable */

let a = 0;
export function NearestEnemy(cpu,p){
  let nearestEnemy = -1;
  let enemyDistance = 100000;
  for (let i = 0; i < 4; i++) {
    if (playerType[i] > -1) {
      if (playerType[i] > -1 && i != p && player[i].actionState != "SLEEP") {
        if (i != p) {
          const dist = Math.pow(cpu.phys.pos.x - player[i].phys.pos.x, 2) + Math.pow(cpu.phys.pos.y - player[i].phys.pos.y,
                  2);
          if (dist < enemyDistance) {
            enemyDistance = dist;
            nearestEnemy = i;
          }
        }
      }
    }
  }
  if (nearestEnemy == -1) {
    nearestEnemy = 0;
    console.log("cant find nearest enemy");
    // fail safe so it doesnt crash at least
  }
  return nearestEnemy;
}
export function generalAI(i,input) {
  input[i].lsX[0] = 0;
  input[i].lsY[0] = 0;
  input[i].x[0] = false;
  input[i].b[0] = false;
  input[i].l[0] = 0;
  input[i].lA[0] = 0;
  input[i].csX[0] = 0;
  input[i].csY[0] = 0;
  input[i].a[0] = false;
  var willWalk = false;
  const paction = player[i].actionState;
  const px = player[i].phys.pos.x;
  const py = player[i].phys.pos.y;
  const pcyx = player[i].phys.cVel.x;
  const pcyy = player[i].phys.cVel.y;
  const pdiff = player[i].difficulty;
  const aerialAttacks = ["ATTACKAIRN","ATTACKAIRF","ATTACKAIRB","ATTACKAIRU","ATTACKAIRD"];
  const idleActions = ["WAIT","OTTOTTOWAIT","WALK","LANDING"];
  //const tilts = ["DOWNTILT","UTILT","FTILT","JAB1"];
  const groundAttacks = ["DOWNTILT","UTILT","FTILT","JAB1","JAB2","JAB3","FSMASH","DSMASH","USMASH","ATTACKDASH"];
  const ptimer = player[i].timer;
  const pgrounded = player[i].phys.grounded;
  // if (a > 5) {
  // if (characterSelections[i] == 2) {
  // var distx = player[i].phys.pos.x - player[NearestEnemy(player[i],i)].phys.pos.x;
  // player[i].phys.pos.x = ((Math.random() * 50) - 25) + player[i].phys.pos.x - (Math.sign(player[i].phys.pos.x - player[NearestEnemy(player[i],i)].phys.pos.x) * 1.0 * Math.min(5,Math.abs(player[i].phys.pos.x - (player[NearestEnemy(player[i],i)].phys.pos.x + ((Math.random() * 50) - 20)))));
  // px = ((Math.random() * 50) - 25) + px - (Math.sign(px - player[NearestEnemy(player[i],i)].phys.pos.y) * 1.0 * Math.min(5,Math.abs(px - (player[NearestEnemy(player[i],i)].phys.pos.y + ((Math.random() * 50) - 20)))));
  // player[NearestEnemy(player[i],i)].phys.pos.x += ((Math.random() * 8) - 4);
  // player[NearestEnemy(player[i],i)].phys.pos.y += ((Math.random() * 8) - 4);
  // if (Math.abs(distx) < 50 && !(player[NearestEnemy(player[i],i)].actionState.substr(0,4) == "DEAD")) {
  // player[NearestEnemy(player[i],i)].hitstun = 50;
  // player[NearestEnemy(player[i],i)].actionState = "DAMAGEFLYN";
  // player[NearestEnemy(player[i],i)].phys.kVel.y = 1.0;
  // player[NearestEnemy(player[i],i)].phys.kVel.x = 1.0;
  // player[NearestEnemy(player[i],i)].phys.cVel.x = ((Math.random() * 10) - 5) / 4;
  // player[NearestEnemy(player[i],i)].phys.cVel.x = ((Math.random() * 10) - 5) / 4;
  // }
  // }
  // }
  //if (player[i].currentAction == "CLIFFWAIT")
  if (paction == "GRABRELEASE"){
	  if(ptimer >= 2 && ["WAIT","OTTOTTOWAIT","DAMAGEFALL","FALL","JUMPF","LANDING","JAB1","ESCAPEF","ESCAPEB","FORWARDSMASH","DOWNTILT"].indexOf(paction) != -1) {
	  player[i].currentAction = "NONE";
	  player[i].currentSubaction = "NONE";
	  }
  }
  if (paction == "CATCHWAIT") { //filler AI

    var randomSeed = Math.floor((Math.random() * 10) + 1);
    if (randomSeed <= 2) {
      input[i].lsX[0] = 1.0;
    } else if (randomSeed <= 4) {
      input[i].lsX[0] = -1.0;
    } else if (randomSeed <= 6) {
      input[i].lsY[0] = 1.0;
    } else if (randomSeed <= 8) {
      input[i].lsY[0] = -1.0;
    } else {
      input[i].a[0] = 1.0;
    }
    return;
  }
  if (player[i].currentAction == "DROPTHROUGHPLATFORM" && paction != "SQUAT") {
    player[i].currentAction = "NONE";
    player[i].currentSubaction = "NONE";
  } else if (player[i].currentAction == "DROPTHROUGHPLATFORM") {
    //if (ptimer <= 2) {
    input[i].lsY[0] = -1.0;
    //player[i].currentAction = "NONE";
    //}
    return;
  }
  if ((player[i].currentSubaction == "LEFT" || player[i].currentSubaction == "RIGHT") && player[i].currentAction ==
    "NONE") {
    player[i].currentSubaction = "NONE";
  }
  if (player[i].currentAction == "RUNOFFPLATFORM") {
    if (!(pgrounded) && isOffstage(player[i])) {
      player[i].currentAction = "NONE";
      player[i].currentSubaction = "NONE";
    }
    if (["FALL", "DASH", "RUN", "SMASHTURN", "TURN", "WALK"].indexOf(paction) == -1) {
      player[i].currentAction = "NONE";
      player[i].currentSubaction = "NONE";
    } else {
      if (paction == "WALK") {
        //changed from phys.pos.face to phys.face
        input[i].lsX[0] = player[i].phys.face * -1.0;
      }
      if (paction == "SMASHTURN") {
        if (ptimer < 2) {
          return;
        }
      }
      if (player[i].currentSubaction == "LEFT") {
        if (pgrounded) {
          input[i].lsX[0] = -1.0;
        } else {
          input[i].lsX[0] = -1.0;
          if (ptimer == 2 && player[i].phys.cVel.y <= 0) { //fast fall
            input[i].lsY[0] = -1.0;
          }
          return;
        }
      } else {
        if (pgrounded) {
          input[i].lsX[0] = 1.0;
        } else {
          input[i].lsX[0] = -1.0;
          if (ptimer == 2 && player[i].phys.cVel.y <= 0) { //fast fall
            input[i].lsY[0] = -1.0;
          }
          return;
        }
      }
    }
  }
  if (player[i].currentSubaction == "UPTILT" && paction != "UPTILT") {
    player[i].currentSubaction = "NONE";
  }
  var nearest = NearestEnemy(player[i], i,input);
  if (pdiff >= 2) {
    if (player[i].currentAction == "NONE") {
	if (["OTTOTTOWAIT", "WAIT", "SMASHTURN", "WALKF", "WALK", "SQUAT"].indexOf(
        paction) != -1 && isAboveGround(player[i].phys.pos.x, px + 1.0)[1] ==
      "platform" && pgrounded && py - player[nearest].phys.pos.y > 0 && Math.abs(player[
        nearest].phys.pos.x - player[i].phys.pos.x) <= 40) {
      //is above platform
      //console.log("H");
      var randomSeed = Math.floor((Math.random() * 10) + 1);
      //randomSeed = 5;
      if (randomSeed <= 3) {
        input[i].lsY[0] = -1.0;
        player[i].currentAction = "DROPTHROUGHPLATFORM";
        return;
      } else if (randomSeed <= 5) {
        player[i].currentAction = "SHIELD";
        input[i].l[0] = 1.0;
        if (input[i].l[0]) {
          input[i].lA[0] = 1;
        }
        return;
      } else if (randomSeed >= 6) {
        player[i].currentAction = "RUNOFFPLATFORM";
        var randomSeed = Math.floor((Math.random() * 2) + 1);
        if (randomSeed == 1) {
          player[i].currentSubaction = "LEFT";
          input[i].lsX[0] = -1.0;
          return;
        } else {
          player[i].currentSubaction = "RIGHT";
          input[i].lsX[0] = 1.0;
          return;
        }
      }
     }
   }
  }
  if (player[i].currentAction == "SHIELD") {
    if (["GUARD", "GUARDON", "WAIT", "DASH", "OTTOTTOWAIT", "SMASHTURN"].indexOf(paction) == -1) {
      player[i].currentAction = "NONE";
      player[i].currentSubaction = "NONE";
    } else {
      //is shielding
      var inputs = CPUShield(player[i], i);
      input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
      input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
      input[i].x[0] = inputs.x;
      input[i].b[0] = inputs.b;
      input[i].l[0] = inputs.l;
      input[i].csX[0] = isNaN(inputs.csX) ? 0 : inputs.csX;
      input[i].csY[0] = isNaN(inputs.csY) ? 0 : inputs.csY;
      input[i].a[0] = inputs.a;
      if (input[i].l[0]) {
        input[i].lA[0] = 1;
      }
      return;
    }
  }
  if (player[i].currentAction == "LEDGESTALL") {
    if (player[i].currentSubaction == "FALL") {
      if (["CLIFFWAIT", "JUMPF", "FALL", "FALLAERIAL", "JUMPAERIAL", "JUMPAERIALF", "JUMPAERIAL1", "JUMPAERIALB"].indexOf(
          paction) == -1) {
        player[i].currentAction = "NONE";
        player[i].currentSubaction = "NONE";
      }
    } else if (player[i].currentSubaction == "GRAB") { //grab ledge
      if (["UPSPECIAL", "UPSPECIALCHARGE", "UPSPECIALLAUNCH", "JUMPAERIAL", "CLIFFWAIT", "FALL", "JUMPAERIAL1",
          "FALLAERIAL", "JUMPAERIALF", "JUMPAERIALB", "JUMPF"
        ].indexOf(player[i].currentAction) == -1) {
        player[i].currentAction = "NONE";
        player[i].currentSubaction = "NONE";
      }
    }
  }
  if (["TOURNAMENTWINNER", "LEDGEGETUP", "LEDGEATTACK", "LEDGEROLL"].indexOf(player[i].currentAction) != -1) {
    if (!(paction.substr(0, 5) == "CLIFF")) {
      player[i].currentAction = "NONE";
    }
  }
  if (player[i].currentAction == "LEDGEDASH") {
    if (["CLIFFWAIT", "JUMPAERIALF", "JUMPAERIALB", "FALLAERIAL", "ESCAPEAIR", "FALL", "JUMPAERIAL1", "JUMPAERIAL"].indexOf(
        paction) == -1) {
      player[i].currentAction = "NONE";
    } else {
      var inputs = CPULedge(player[i], i);
      //do inputs
      input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
      input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
      input[i].x[0] = inputs.x;
      input[i].b[0] = inputs.b;
      input[i].l[0] = inputs.l;
      input[i].csX[0] = isNaN(inputs.csX) ? 0 : inputs.csX;
      input[i].csY[0] = isNaN(inputs.csY) ? 0 : inputs.csY;
      input[i].a[0] = inputs.a;
      if (input[i].l[0]) {
        input[i].lA[0] = 1;
      }
      return;
    }
  }
  if (pdiff == 4 && player[i].hit.hitlag > 0 && isOffstage(player[i]) && !(pgrounded)) { //SDI
    var inputs = CPUSDItoStage(player[i], i);
    input[i].lA[0] = 1;
    input[i].l[0] = true;
    input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
    input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
    return;
  }
  if (!(player[i].grounded) && isOffstage(player[i]) && player[i].currentAction == "NONE") {
    var inputs = CPUrecover(player[i], i);
    //do inputs
    input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
    input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
    input[i].x[0] = inputs.x;
    input[i].b[0] = inputs.b;
  }
  if (player[i].currentAction == "REVERSEUPTILT") {
    if (["SMASHTURN", "WAIT", "UPTILT", "LANDING", "OTTOTTOWAIT"].indexOf(paction) != -1) {
      player[i].currentAction = "NONE";
      player[i].currentSubaction = "NONE";
    } else {
      if (player[i].currentSubaction == "REVERSE") { //smash turn
        input[i].lsX[0] = -1.0 * player[i].phys.face;
        player[i].currentSubaction = "UPTILT";
        return;
      } else if (player[i].currentSubaction == "UPTILT" && ptimer > 1) {
        input[i].lsX[0] = 0.0;
        player[i].currentAction = "NONE";
        player[i].currentSubaction = "NONE";
        input[i].lsY[0] = .50;
        input[i].a[0] = true;
        return;
      }
    }
  }
  if (player[i].currentAction == "MASHING" && paction == "WAIT" && ptimer > 2) {
    player[i].currentAction = "NONE";
  }
  //if (player[i].currentSubaction.substr(0,2) == "TUMBLE" && !(paction == "DAMAGEFALL") {
  //	  player[i].currentSubaction = "NONE";
  //}
  if (player[i].currentAction == "SMASHTURN") {
    if (paction == "WAIT" || ptimer > 0) {
      player[i].currentAction = "NONE";
    }
  }
  if (player[i].currentAction == "TECH" || player[i].currentAction == "MISSEDTECH") {
    if (paction == "CLIFFWAIT" || paction == "FALLN" || paction == "WAIT") {
      player[i].currentAction = "NONE";
    }
  }
  if ((paction == "DAMAGEFALL" || paction == "DAMAGEFLYN") && (!isOffstage(player[i])) &&
    pdiff > 0) {
    //if ((px - (1.5 * player[i].phys.kVel.y)) - NearestFloor(player[i]) < 0) {
    //if (px - NearestFloor(player[i]) < 5 && player[i].phys.kVel > 0) {
    if (player[i].hit.hitstun <= 0) {
      let extra = 0;
      if (!player[i].phys.doubleJumped || (player[i].phys.jumpsUsed < 5 && player[i].charAttributes.multiJump)) {
        extra = 3
      }
      var randomSeed = Math.floor((Math.random() * (2 + extra)) + 1);
      if (randomSeed == 1) { //left
        input[i].lsX[0] = -1.0;
      } else if (randomSeed == 2) { //right
        input[i].lsX[0] = 1.0;
      } else { //jump
        input[i].x[0] = true;
      }
      player[i].currentAction = "NONE";
      return;
    }
    //console.log("SS");
    player[i].currentAction = "TECH";
    var inputs = CPUTech(player[i], i);
    input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
    input[i].l[0] = inputs.l;
    if (input[i].l[0]) {
      input[i].lA[0] = 1;
    }
    return;
    //}
  }
  //if (paction == "DAMAGEFALL") {
  //	var inputs = CPUTumble(player[i],i);
  //	input[i].lsX[0] = inputs.lsX;
  //}
  if (paction == "DOWNWAIT") { //missed tech options
    player[i].currentAction = "MISSEDTECH";
    var inputs = CPUMissedTech(player[i], i);
    input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
    input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
    input[i].a[0] = inputs.a;
  }
  if (paction != "DOWNWAIT") {

    if (paction.substr(0, 7) == "CAPTURE" && pdiff > 0 && paction !=
      "CAPTURECUT") { //break out of grabs
      player[i].currentAction = "MASHING";
      player[i].lastMash += 1;
      if (player[i].lastMash > (8 - (2 * (pdiff)))) {
        player[i].lastMash = 0;
        input[i].lsY[0] = 1.0;
        input[i].lA[0] = 1;
        if (!input[i].a[1]) {
          input[i].a[0] = true;
          input[i].x[0] = true;
          input[i].lsX[0] = -1.0;
          input[i].csX[0] = -1.0;
          //input[i].r[0] = true;
        } else {
          input[i].y[0] = true;
          input[i].lsX[0] = 1.0;
          input[i].b[0] = true;
          input[i].csX[0] = 1.0;
          //input[i].l[0] = true;
        }
    }
      }
    if (player[i].currentAction == "WAVESHINEANY") {
      var inputs = CPUWaveshineAny(player[i], i);
      input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
      input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
      input[i].x[0] = inputs.x;
      input[i].b[0] = inputs.b;
      input[i].l[0] = inputs.l;
      if (input[i].l[0]) {
        input[i].lA[0] = 1;
      }
      return;
    }
    if (player[i].currentAction != "WAVESHINEANY" && (paction == "CAPTURECUT" || player[i].currentAction ==
        "GRABRELEASE")) {
      player[i].currentAction = "GRABRELEASE";
      var inputs = CPUGrabRelease(player[i], i);
      input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
      input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
      input[i].x[0] = inputs.x;
      input[i].b[0] = inputs.b;
      input[i].l[0] = inputs.l;
      input[i].csX[0] = isNaN(inputs.csX) ? 0 : inputs.csX;
      input[i].csY[0] = isNaN(inputs.csY) ? 0 : inputs.csY;
      input[i].a[0] = inputs.a;
      if (input[i].l[0]) {
        input[i].lA[0] = 1;
      }
      return;
    }
    if (player[i].currentAction == "MASHING" && !(paction.substr(0, 7) == "CAPTURE")) {
      player[i].currentAction == "NONE";
      player[i].lastMash = 0;
    }
    if (player[i].hit.hitstun > 0) { //stops action if they get interrupt. pretty simple? could also expand for DI
      player[i].currentAction = "NONE";
    }
    if (paction == "REBIRTHWAIT") {
      input[i].lsY[0] = -1.0;
    }
    if ((player[i].currentAction == "NONE" && (paction == "CLIFFWAIT")) || (player[i].currentAction ==
        "LEDGEDASH" || player[i].currentAction == "LEDGEAIRATTACK2" || player[i].currentAction == "LEDGEAIRATTACK" ||
        player[i].currentAction == "LEDGEGETUP" || player[i].currentAction == "LEDGEATTACK" || player[i].currentAction ==
        "LEDGEJUMP" || player[i].currentAction == "LEDGEROLL" || player[i].currentAction == "LEDGEJUMP" || player[i].currentAction ==
        "TOURNAMENTWINNER")) {
      var inputs = CPULedge(player[i], i);
      //do inputs
      input[i].lsX[0] = isNaN(inputs.lsX) ? 0 : inputs.lsX;
      input[i].lsY[0] = isNaN(inputs.lsY) ? 0 : inputs.lsY;
      input[i].x[0] = inputs.x;
      input[i].b[0] = inputs.b;
      input[i].l[0] = inputs.l;
      input[i].csX[0] = isNaN(inputs.csX) ? 0 : inputs.csX;
      input[i].csY[0] = isNaN(inputs.csY) ? 0 : inputs.csY;
      input[i].a[0] = inputs.a;
      if (input[i].l[0]) {
        input[i].lA[0] = 1;
      }
      return;
    }
  }
  if (input[i].l[0]) {
    input[i].lA[0] = 1;
  }
  if (pdiff > 1) {
    var distx = player[i].phys.pos.x - player[nearest].phys.pos.x;
    var disty = py - player[nearest].phys.pos.y;
    if (player[i].currentAction == "NONE" && player[i].currentSubaction == "NONE" && (paction == "WAIT" ||
        paction == "OTTOTTOWAIT" || paction == "WALK")) { //walk towards enemy
      if (Math.abs(distx) >= 23 && (player[nearest].phys.grounded || isAboveGround(player[
          nearest].phys.pos.x, player[nearest].phys.pos.y)[0])) {
        input[i].lsX[0] = 0.75 * (-1.0 * (Math.sign(distx)));
      }
    }
    //console.log(player[i].currentAction);
  }
  //run character specific stuff
  const ais = [marthAI, jiggsAI, foxAI];
  ais[characterSelections[i]](i); //calls that character's AI.
}
export function marthAI(i) {
  const paction = player[i].actionState;
  const px = player[i].phys.pos.x;
  const py = player[i].phys.pos.y;
  const pcyx = player[i].phys.cVel.x;
  const pcyy = player[i].phys.cVel.y;
  const pdiff = player[i].difficulty;
  const aerialAttacks = ["ATTACKAIRN","ATTACKAIRF","ATTACKAIRB","ATTACKAIRU","ATTACKAIRD"];
  const idleActions = ["WAIT","OTTOTTOWAIT","WALK","LANDING"];
  //const tilts = ["DOWNTILT","UTILT","FTILT","JAB1"];
  const groundAttacks = ["DOWNTILT","UTILT","FTILT","JAB1","JAB2","JAB3","FSMASH","DSMASH","USMASH","ATTACKDASH"];
  const ptimer = player[i].timer;
  const pgrounded = player[i].phys.grounded;
  const pface = player[i].phys.face;
  const nfloor = NearestFloor(player[i]);
  const nledge = NearestLedge(player[i]);
  const pisoffstage = isOffstage(player[i]);
  const ddlength = 15;
  if (player[i].currentAction == "LEDGESTALL") {
    input[i].lsX[0] = 0.0;
    if (player[i].currentSubaction == "FALL") {
      if (ptimer == 7) {
        //input[i].lsY[0] = -1.0;
        input[i].lsY[0] = -1.0;
        input[i].x[0] = 1.0;
        player[i].currentSubaction = "GRAB";
      } else {
        input[i].lsY[0] = -1.0;
      }
      return;
    } else if (player[i].currentSubaction == "GRAB") {
      input[i].lsX[0] = 0.0;
      if (paction.substr(0, 4) == "CLIFF" && paction == "CLIFFCATCH") { //end of action
        player[i].currentAction = "NONE";
        player[i].currentSubaction = "NONE";
      }
      return;
    }
  }
  var nearest = NearestEnemy(player[i], i,input);
  //if (player[i].currentAction == "NONE") {
  //if (paction == "FALL" || paction == "JUMP") {
  //	  input[i].lsX[0] = player[i].phys.pos.face;
  //	  input[i].a[0] = true;
  //	  return;
  //}
  //}
  const distx = px - player[nearest].phys.pos.x;
  const disty = py - player[nearest].phys.pos.y;
  if (player[i].currentAction == "NONE") {
  }
  if (["WAVEDASHANY","WAVEDASH","DASHDANCE","DASHDANCEBACK"].indexOf(player[i].currentAction) != -1) {
    //cancel states
    if (paction === "FALL") {
      player[i].currentAction = "NONE";
      player[i].currentSubaction = "NONE";
    } else if ((paction == "LANDING" || paction == "WAIT")&& input[i].lsX[1] === 0.0) {
      player[i].currentAction = "NONE";
      player[i].currentSubaction = "NONE";
    }
  }
  if (pdiff >= 3) {
    if (player[i].currentAction == "DASHDANCING" || player[i].currentAction == "DASHDANCEBACK") {
      if (!isAboveGround((3 * pcyx) + px,py)) {
        input[i].lsX[0] = -1.0 * Math.sign(pcyx);
        player[i].currentAction = "DASHDANCE";
        player[i].currentSubaction = "NONE";
        return;
      }
    }
    if (!(pgrounded)) {  //l canceling l-cancelling lcancelling
      if (aerialAttacks.indexOf(paction) != -1) {
        //aerial strafing
        //console.log("ARG1: " + (py + (2 * pcyy)) + "NFLOOR: " + nfloor);
        if ((py + (pcyy * 2) <= nfloor) && pcyy < 0) { //will land
          //console.log("Pressed L");
          let randomSeed = Math.floor((Math.random() * 100) + 1);
          if (randomSeed <= 80 + ((pdiff - 3) * 20)) {
            input[i].l[0] = true;
            input[i].lA[0] = 1.0;
            return;
          }
        } else if (pcyy <= 0 && !(player[i].phys.fastfalled)) {
          if (!(pisoffstage)) { //fast fall
            let randomSeed = Math.floor((Math.random() * 100) + 1);
            if (randomSeed <= 50 + ((pdiff - 3) * 20)) {
              input[i].lsY[0] = -1.0;
              return;
            }
          }
        }
      }
    }
    if (player[i].currentAction == "DASHDANCE") {
      if (ptimer >= ddlength - 1) {
        var randomSeed = Math.floor((Math.random() * 100) + 1);
        if (randomSeed <= 3) {
          if (Math.abs(distx) < 10 && Math.abs(disty) < 5 && pface == Math.sign(distx)) {
            player[i].currentAction = "PIVOTFSMASH";
            input[i].lsX[0] = -1.0 * pface;
            return;
          } else { //can't pivot f-samash
            player[i].currentAction = "WAVEDASHANY"; //not any
            if (pface == 1.0) {
              player[i].currentSubaction = "LEFT";
            } else {
              player[i].currentSubaction = "RIGHT";
            }
            input[i].x[0] = 1.0;
            return;
          }
        } else if (randomSeed <= 38) {
          //extend dashdance
          player[i].currentAction = "DASHDANCEBACK";
          input[i].lsX[0] = pface * -1.0;
          if (pface == 1.0) {
            player[i].currentSubaction = "LEFT";
          } else {
            player[i].currentSubaction = "RIGHT";
          }
          return;
        } else if (randomSeed <= 71) {//wavedash
          input[i].x[0] = true;
          player[i].currentAction = "WAVEDASHANY";
          return;
        } else {
          //dash dance
          input[i].lsX[0] = pface * -1.0;
          return;
        }
      } else {
        //input[i].lsX[0] = input[i].lsX[1];
        input[i].lsX[0] = pface;
        return;
      }
    } //end of dashance end code
    if (player[i].currentAction == "NONE" && player[i].currentSubaction == "NONE") { //dash dance beginning code
      if (idleActions.indexOf(paction) != -1) {
        if (ptimer >= 3) { //gives idle frames
          if (paction == "OTTOTTOWAIT") {
            input[i].lsX[0] = -1.0 * pface;
            return;
          } else {
            let randomSeed = Math.floor((Math.random() * 100) + 1);
            if (randomSeed <= 25) {
              player[i].currentAction = "DASHDANCE";
              input[i].lsX[0] = -1.0;
              return;
            } else if (randomSeed <= 50) {
              player[i].currentAction = "DASHDANCE";
              input[i].lsX[0] = 1.0;
              return;
            } else if (randomSeed <= 85) {
              player[i].currentAction = "WAVEDASHANY";
              input[i].x[0] = true;
              return;
            }
          }
        }
      }
    }
    if (player[i].currentAction == "DASHDANCEBACK") {
      if (["LEFT","RIGHT"].indexOf(player[i].currentSubaction) == -1) {
        player[i].currentAction = "NONE";
        player[i].currentSubaction = "NONE";
        return;
      } else {
        if (player[i].currentSubaction === "LEFT") {
          if (pface == -1.0) {
            player[i].currentAction = "DASHDANCE";
            player[i].currentSubaction = "NONE";
            input[i].lsX[0] = -1.0;
            return;
          }  else {
            if (paction == "SMASHTURN") {
              console.log("0: " + input[i].lsX[0]);
              console.log("1: " + input[i].lsX[1]);
              input[i].lsX[0] = input[i].lsX[2];
              return;
            } else if (paction == "DASH") {
              let doSomething = Math.min(100,20 + Math.sin(((2 * 3.14159265358979323) / 15) * (ptimer - 1)));
              let randomSeed = Math.floor((Math.random() * 100) + 1);
              if (randomSeed <= doSomething) {
                input[i].lsX[0] = -1.0 * pface;
              } else {
                input[i].lsX[0] = pface;
              }
              return;
            }
          }
        } else if (player[i].currentSubaction === "RIGHT") {
          if (pface == 1.0) {
            player[i].currentAction = "DASHDANCE";
            player[i].currentSubaction = "NONE";
            input[i].lsX[0] = 1.0;
            return;
          }  else {
            if (paction == "SMASHTURN") {
              input[i].lsX[0] = input[i].lsX[1];
              return;
            } else if (paction == "DASH") {
              let doSomething = Math.min(100,20 + Math.sin(((2 * 3.14159265358979323) / 15) * (ptimer - 1)));
              let randomSeed = Math.floor((Math.random() * 100) + 1);
              if (randomSeed <= doSomething) {
                input[i].lsX[0] = -1 * pface;
              } else {
                input[i].lsX[0] = pface;
              }
              return;
            }
          }
        }
      }
    }
  }

  if (pdiff == 2 && player[i].currentAction == "NONE") {
    if ((pgrounded && ((paction ==
        "WAIT" || (pgrounded && gameSettings.turbo && player[i].hasHit && (Math.floor((Math.random() *
            10) + 1) >= 8 - (2 * pdiff)))) && Math.abs(distx) > 15) || ((pdiff > 0 &&
        player[i].hasHit && gameSettings.turbo && pgrounded) || paction == "WAIT") || (
        paction == "LANDING" && ptimer > 3))) { //smash turn to face enemy
      if (!(player[i].phys.face == -1.0 * (Math.sign(distx)))) {
        player[i].currentAction = "SMASHTURN";
        input[i].lsX[0] = -1.0 * player[i].phys.face;
        return;
      } else {
        if (player[i].currentAction == "NONE" && ["WAIT","WALK","OTTOTTOWAIT","LANDING"].indexOf(paction) != -1 && player[nearest].phys.hurtBoxState == 0) {
          if (Math.abs(distx) < 23 && Math.abs(disty) < 15) {
            var randomSeed = Math.floor((Math.random() * 100) + 1);
            if (randomSeed <= 10) { //grab
              input[i].z = true;
              /*
               input[i].l[0] = true;
               input[i].lA[0] = 1;
               input[i].a = true;
               */
            } else if (randomSeed <= 25) { //tilt
              var randomSeed1 = Math.floor((Math.random() * 100) + 1);
              if (randomSeed1 <= 25) { //f-tilt
                input[i].lsX[0] = 0.50;
              } else if (randomSeed1 <= 50) { //d-tilt
                input[i].lsY[0] = -0.50;
              } else if (randomSeed1 <= 75) { //up-tilt
                if (characterSelections[i] == 1 || characterSelections[i] == 2) {
                  if (!(1.0 * Math.sign(distx) == player[i].phys.face)) {
                    player[i].currentAction = "REVERSEUPTILT";
                    player[i].currentSubaction = "REVERSE";
                    return;
                  } else {
                    input[i].lsY[0] = 0.50;
                    input[i].a[0] = true;
                  }
                } else {
                  //console.log(Math.sign(distx),":",player[i].phys.face)
                  input[i].lsY[0] = 0.50;
                  input[i].a[0] = true;
                }
              }
              input[i].a[0] = true;
              return;
            }
            /* else if (randomSeed <= 20) {//shield
             input[i].l[0] = true;
             input[i].lA[0] = 1;
             } */
          }
        }
      }
    }
  }
  if (pdiff >= 3) {
    if (player[nearest].phys.hurtBoxState == 0) {
      if (["WAIT", "OTTOTTOWAIT", "WALK", "DASH", "RUN"].indexOf(paction) != -1) {
        if (Math.abs(py - player[nearest].phys.pos.y) <= 3) {
          if ((player[i].phys.face == -1.0 * (Math.sign(distx)))) {
            var randomSeed = Math.floor((Math.random() * 100) + 1);
            if (randomSeed <= 40) {
              if (isEnemyApproaching(player[i], player[nearest]) || player[nearest].actionState.substr(0, 5) == "GUARD") {
                if (Math.abs(px - player[nearest].phys.pos.x) <= 20) {
                  player[i].currentAction = "NONE";
                  player[i].currentSubaction = "NONE";
                  input[i].l[0] = true;
                  input[i].lA[0] = 1.0;
                  input[i].a[0] = true;
                }
              } else if (randomSeed <= 25 && Math.abs(px - player[nearest].phys.pos.x) < 12.5 && ["DOWNBOUND","DOWNSTANDF","DOWNSTANDB","DOWNSTANDN"].indexOf(paction) == -1) {
                player[i].currentAction = "NONE";
                player[i].currentSubaction = "NONE";
                input[i].l[0] = true;
                input[i].lA[0] = 1.0;
                input[i].a[0] = true;
              }
            }
          }
        }
      }
    }
  }
}

export function jiggsAI(i) {
  const paction = player[i].actionState;
  const px = player[i].phys.pos.x;
  const py = player[i].phys.pos.y;
  const pcyx = player[i].phys.cVel.x;
  const pcyy = player[i].phys.cVel.y;
  const pdiff = player[i].difficulty;
  const aerialAttacks = ["ATTACKAIRN","ATTACKAIRF","ATTACKAIRB","ATTACKAIRU","ATTACKAIRD"];
  const idleActions = ["WAIT","OTTOTTOWAIT","WALK","LANDING"];
  //const tilts = ["DOWNTILT","UTILT","FTILT","JAB1"];
  const groundAttacks = ["DOWNTILT","UTILT","FTILT","JAB1","JAB2","JAB3","FSMASH","DSMASH","USMASH","ATTACKDASH"];
  const ptimer = player[i].timer;
  const pgrounded = player[i].phys.grounded;
  const nearest = NearestEnemy(player[i], i,input);
  if (player[i].currentAction == "NONE") {
    var distx = px - player[nearest].phys.pos.x;
    var disty = py - player[nearest].phys.pos.y;

    if (pdiff >= 2 && player[i].currentAction == "NONE") {
    if (pgrounded && ((paction ==
        "WAIT" || (pgrounded && gameSettings.turbo && player[i].hasHit && (Math.floor((Math.random() *
          10) + 1) >= 8 - (2 * pdiff)))) && Math.abs(distx) > 15) || ((pdiff > 0 &&
        player[i].hasHit && gameSettings.turbo && pgrounded) || paction == "WAIT") || (
        paction == "LANDING" && ptimer > 3)) { //smash turn to face enemy
      if (!(player[i].phys.face == -1.0 * (Math.sign(distx)))) {
        player[i].currentAction = "SMASHTURN";
        input[i].lsX[0] = -1.0 * player[i].phys.face;
        return;
      } else {
        if (characterSelections[i] == 2 && Math.abs(distx) > 80 && Math.abs(disty) < 15) { //is fox
          var randomSeed = Math.floor((Math.random() * 10) + 1);
          if (randomSeed == 1) {
            player[i].currentAction = "SHDL";
            player[i].currentSubaction = "LASER1";
          }
        }
        if (player[i].currentAction == "NONE") {
          if (Math.abs(distx) < 23 && Math.abs(disty) < 15) {
            var randomSeed = Math.floor((Math.random() * 100) + 1);
            if (randomSeed <= 10) { //grab
              input[i].z = true;
              /*
				  input[i].l[0] = true;
				  input[i].lA[0] = 1;
				  input[i].a = true;
				  */
            } else if (randomSeed <= 25) { //tilt
              const randomSeed1 = Math.floor((Math.random() * 100) + 1);
              if (randomSeed1 <= 25) { //f-tilt
                input[i].lsX[0] = 0.50;
              } else if (randomSeed1 <= 50) { //d-tilt
                input[i].lsY[0] = -0.50;
              } else if (randomSeed1 <= 75) { //up-tilt
                if (characterSelections[i] == 1 || characterSelections[i] == 2) {
                  if (!(1.0 * Math.sign(distx) == player[i].phys.face)) {
                    player[i].currentAction = "REVERSEUPTILT";
                    player[i].currentSubaction = "REVERSE";
                    return;
                  } else {
                    input[i].lsY[0] = 0.50;
                    input[i].a[0] = true;
                  }
                } else {
                  //console.log(Math.sign(distx),":",player[i].phys.face)
                  input[i].lsY[0] = 0.50;
                  input[i].a[0] = true;
                }
              }
              input[i].a[0] = true;
              return;
            }
            /* else if (randomSeed <= 20) {//shield
				  input[i].l[0] = true;
				  input[i].lA[0] = 1;
			  } */
          }
        }
      }
    }
  }
  }
  if (pdiff >= 3) {
	if (player[nearest].phys.hurtBoxState == 0) {
    if (["WAIT", "OTTOTTOWAIT", "WALK", "DASH", "RUN"].indexOf(paction) != -1) {
      if (Math.abs(py - player[nearest].phys.pos.y) <= 3) {
        if ((player[i].phys.face == -1.0 * (Math.sign(distx)))) {
          var randomSeed = Math.floor((Math.random() * 100) + 1);
          if (randomSeed <= 30) {
            if (isEnemyApproaching(player[i], player[nearest]) || player[nearest].actionState.substr(0, 5) == "GUARD") {
              if (Math.abs(px - player[nearest].phys.pos.x) <= 13) {
                input[i].l[0] = true;
                input[i].lA[0] = 1.0;
                input[i].a[0] = true;
              }
            } else if (randomSeed <= 20 && Math.abs(px - player[nearest].phys.pos.x) < 8 && ["DOWNBOUND","DOWNSTANDF","DOWNSTANDB","DOWNSTANDN"].indexOf(paction) == -1) {
                input[i].l[0] = true;
                input[i].lA[0] = 1.0;
                input[i].a[0] = true;
			}
          }
        }
      }
    }
  }
  }
}

export function foxAI(i) {
  const paction = player[i].actionState;
  const px = player[i].phys.pos.x;
  const py = player[i].phys.pos.y;
  const pcyx = player[i].phys.cVel.x;
  const pcyy = player[i].phys.cVel.y;
  const pdiff = player[i].difficulty;
  const aerialAttacks = ["ATTACKAIRN","ATTACKAIRF","ATTACKAIRB","ATTACKAIRU","ATTACKAIRD"];
  const idleActions = ["WAIT","OTTOTTOWAIT","WALK","LANDING"];
  //const tilts = ["DOWNTILT","UTILT","FTILT","JAB1"];
  const groundAttacks = ["DOWNTILT","UTILT","FTILT","JAB1","JAB2","JAB3","FSMASH","DSMASH","USMASH","ATTACKDASH"];
  const ptimer = player[i].timer;
  const pgrounded = player[i].phys.grounded;
  if (player[i].currentAction == "LEDGESTALL") {
    input[i].lsX[0] = 0.0;
    if (player[i].currentSubaction == "FALL") {
      if (ptimer == 1) {
        //input[i].lsY[0] = -1.0;
        input[i].lsY[0] = 1.0;
        input[i].b[0] = true;
        player[i].currentSubaction = "GRAB";
      } else {
        input[i].lsY[0] = -1.0;
      }
      return;
    } else if (player[i].currentSubaction == "GRAB") {
      input[i].lsX[0] = 0.0;
      if (paction.substr(0, 4) == "CLIFF") { //end of action
        player[i].currentAction = "NONE";
        player[i].currentSubaction = "NONE";
      }
      return;
    }
  }
  let isDead = false;
  let deadDude = "NONE";
  for (let aa = 0; aa < 4; aa++) {
    if (playerType[aa] != -1 && !(i == aa)) {
      if (player[aa].actionState.substr(0, 4) == "DEAD" || player[aa].actionState.substr(0, 7) == "REBIRTH") { //"DEADDOWN","REBIRTH","REBIRTHWAIT"]) {
        isDead = true;
        deadDude = aa;
      } else {
        //console.log(player[aa].actionState);
      }
    }
  }
  if (isDead) {
    if (player[i].currentSubaction == "NONE" && player[i].currentAction == "NONE" && pgrounded && pdiff >= 3) { //can do it
      player[i].currentAction = "RESPAWNMULTISHINE";
      player[i].currentSubaction = "SHINE";
      return;
    }
  }
  if (player[i].currentAction == "RESPAWNMULTISHINE") {
    if (player[i].currentSubaction == "NONE") {
      if (!(isDead)) { //should finish multishining
        player[i].currentAction = "NONE";
      } else {
        player[i].currentSubaction = "JUMP";
      }
    }
    if ((["DOWNSPECIALGROUND", "DOWNSPECIALAIR", "KNEEBEND", "JUMPF", "JUMPB", "WAIT", "WALK", "WALKF", "OTTOTTOWAIT"].indexOf(
        paction) == -1.0)) {
      player[i].currentAction = "NONE";
      player[i].currentSubaction = "NONE";
    }
    if (player[i].currentSubaction == "SHINE") {
      input[i].lsY[0] = -1.0;
      input[i].b[0] = true;
      player[i].currentSubaction = "JUMP";
    } else if (player[i].currentSubaction == "JUMP") {
      input[i].b[0] = true;
      if ((ptimer == 3 && paction == "DOWNSPECIALGROUND") || (ptimer == 6 && paction ==
          "DOWNSPECIALGROUND")) {
        input[i].x[0] = true;
        player[i].currentSubaction = "SHINE2";
      }
    } else if (player[i].currentSubaction == "SHINE2") {
      if (paction == "KNEEBEND" && ptimer == 3) {
        input[i].lsY[0] = -1.0;
        input[i].b[0] = true;
        player[i].currentSubaction = "NONE";
      }
    }
    if (player[i].currentAction == "RESPAWNMULTISHINE") {
      return;
    }
    if (player[i].currentSubaction in ["LASER1", "LASER2", "REVERSE"]) {
      if (player[i].hit.hitstun >= 0) {
        player[i].currentSubaction = "NONE";
      }
    }
  }
  const nearest = NearestEnemy(player[i], i,input);
  if (player[i].currentAction == "NONE") {
    var distx = px - player[nearest].phys.pos.x;
    var disty = py - player[nearest].phys.pos.y;
  if (pdiff >= 2 && player[i].currentAction == "NONE") {
  if ((pgrounded && ((paction ==
        "WAIT" || (pgrounded && gameSettings.turbo && player[i].hasHit && (Math.floor((Math.random() *
          10) + 1) >= 8 - (2 * pdiff)))) && Math.abs(distx) > 15) || ((pdiff > 0 &&
        player[i].hasHit && gameSettings.turbo && pgrounded) || paction == "WAIT") || (
        paction == "LANDING" && ptimer > 3))) { //smash turn to face enemy
      if (!(player[i].phys.face == -1.0 * (Math.sign(distx)))) {
        player[i].currentAction = "SMASHTURN";
        input[i].lsX[0] = -1.0 * player[i].phys.face;
        return;
      } else {
        if (characterSelections[i] == 2 && Math.abs(distx) > 80 && Math.abs(disty) < 15) { //is fox
          var randomSeed = Math.floor((Math.random() * 10) + 1);
          if (randomSeed == 1) {
            player[i].currentAction = "SHDL";
            player[i].currentSubaction = "LASER1";
          }
        }
        if (player[i].currentAction == "NONE") {
          if (Math.abs(distx) < 23 && Math.abs(disty) < 15) {
            var randomSeed = Math.floor((Math.random() * 100) + 1);
            if (randomSeed <= 10) { //grab
              input[i].z = true;
            } else if (randomSeed <= 25) { //tilt
              const randomSeed1 = Math.floor((Math.random() * 100) + 1);
              if (randomSeed1 <= 25) { //f-tilt
                input[i].lsX[0] = 0.50;
              } else if (randomSeed1 <= 50) { //d-tilt
                input[i].lsY[0] = -0.50;
              } else if (randomSeed1 <= 75) { //up-tilt
                if (characterSelections[i] == 1 || characterSelections[i] == 2) {
                  if (!(1.0 * Math.sign(distx) == player[i].phys.face)) {
                    player[i].currentAction = "REVERSEUPTILT";
                    player[i].currentSubaction = "REVERSE";
                    return;
                  } else {
                    input[i].lsY[0] = 0.50;
                    input[i].a[0] = true;
                  }
                } else {
                  //console.log(Math.sign(distx),":",player[i].phys.face)
                  input[i].lsY[0] = 0.50;
                  input[i].a[0] = true;
                }
              }
              input[i].a[0] = true;
              return;
            }
          }
        }
      }
    }
  }
  }
  if (pdiff >= 3) {
	if (player[nearest].phys.hurtBoxState == 0) {
    if (["WAIT", "OTTOTTOWAIT", "WALK", "DASH", "RUN"].indexOf(paction) != -1) {
      if (Math.abs(py - player[nearest].phys.pos.y) <= 3) {
        if ((player[i].phys.face == -1.0 * (Math.sign(distx)))) {
          var randomSeed = Math.floor((Math.random() * 100) + 1);
          if (randomSeed <= 30) {
            if (isEnemyApproaching(player[i], player[nearest]) || player[nearest].actionState.substr(0, 5) == "GUARD") {
              if (Math.abs(px - player[nearest].phys.pos.x) <= 12) {
                input[i].l[0] = true;
                input[i].lA[0] = 1.0;
                input[i].a[0] = true;
              }
            } else if (randomSeed <= 20 && Math.abs(px - player[nearest].phys.pos.x) < 8 && ["DOWNBOUND","DOWNSTANDF","DOWNSTANDB","DOWNSTANDN"].indexOf(paction) == -1) {
                input[i].l[0] = true;
                input[i].lA[0] = 1.0;
                input[i].a[0] = true;
			}
          }
        }
      }
    }
  }
  }
  if (player[i].currentAction == "SHDL") {
    const inputs = CPUSHDL(player[i], i);
    input[i].x[0] = inputs.x;
    input[i].b[0] = inputs.b;
  }
}


export function runAI (i,input){
  generalAI(i,input); //calls general AI
  //console.log(player[i].difficulty);
  //These are the player Inputs
}
export function isEnemyApproaching(cpu,player) {

  if (Math.abs(cpu.phys.pos.x - (player.phys.pos.x + player.phys.cVel.x)) < Math.abs(cpu.phys.pos.x - player.phys.pos.x)) {
    return true;
  } else {
    return false;
  }
}
export function NearestLedge(cpu) {

  let closest = [0, 10000]; //used to measure which ledge is closer
  for (let i = 0; i < activeStage.ledgePos.length; i++) {
    const closeness = Math.abs(cpu.phys.pos.x - activeStage.ledgePos[i].x) + Math.abs(cpu.phys.pos.y - activeStage.ledgePos[i].y); //distance from ledge
    if (closeness < closest[1]) { //if closer to that ledge than others, update closest.
      closest = [i, closeness];
    }
  }
  //closestIndex = closest[0];
  closest = activeStage.ledgePos[closest[0]]; //updates closest to instead be the closest ledge.
  return closest;
}

export function NearestFloor(cpu) {
  // for each platform
  let nearestDist = 1000;
  let nearestY = -1000;
  for (var i = 0; i < activeStage.platform.length; i++) {
    // if cpu is above platform
    if (cpu.phys.pos.y > activeStage.platform[i][0].y && cpu.phys.pos.x >= activeStage.platform[i][0].x && cpu.phys.pos.x <= activeStage.platform[
        i][1].x) {
      if (cpu.phys.pos.y - activeStage.platform[i][0].y < nearestDist) {
        nearestDist = cpu.phys.pos.y - activeStage.platform[i][0].y;
        nearestY = activeStage.platform[i][0].y;
      }
    }
  }
  for (var i = 0; i < activeStage.ground.length; i++) {
    // if cpu is above platform
    if (cpu.phys.pos.y > activeStage.ground[i][0].y && cpu.phys.pos.x >= activeStage.ground[i][0].x && cpu.phys.pos.x <= activeStage.ground[
        i][1].x) {
      if (cpu.phys.pos.y - activeStage.ground[i][0].y < nearestDist) {
        nearestDist = cpu.phys.pos.y - activeStage.ground[i][0].y;
        nearestY = activeStage.ground[i][0].y;
      }
    }
  }
  return nearestY;
}

export function isAboveGround (x,y) {
  let returnValue = [false, "none", 0];
  let closest = 1000;
  let dist;
  for (var i = 0; i < activeStage.ground.length; i++) {
    if (x >= activeStage.ground[i][0].x && x <= activeStage.ground[i][1].x && y >= activeStage.ground[i][0].y) {
      dist = y - activeStage.ground[i][0].y;
      if (dist < closest) {
        closest = dist;
        returnValue = [true, "ground", activeStage.ground[i][0].y];
      }
    }
  }
  for (var i = 0; i < activeStage.platform.length; i++) {
    if (x >= activeStage.platform[i][0].x && x <= activeStage.platform[i][1].x && y >= activeStage.platform[i][0].y) {
      dist = y - activeStage.platform[i][0].y;
      if (dist < closest) {
        closest = dist;
        returnValue = [true, "platform", activeStage.platform[i][0].y];
      }
    }
  }
  return returnValue;
}

export function isOffstage (cpu){
  // if on a ledge
  if (cpu.phys.onLedge > -1) {
    return false;
  }
  if (!cpu.phys.grounded) {
    for (var i = 0; i < activeStage.ground.length; i++) {
      if (cpu.phys.pos.x >= activeStage.ground[i][0].x && cpu.phys.pos.x <= activeStage.ground[i][1].x && cpu.phys.ECBp[0].y >=
        activeStage.ground[i][0].y) {
        return false;
      }
    }
    for (var i = 0; i < activeStage.platform.length; i++) {
      if (cpu.phys.pos.x >= activeStage.platform[i][0].x && cpu.phys.pos.x <= activeStage.platform[i][1].x && cpu.phys.ECBp[0].y >=
        activeStage.platform[i][0].y) {
        return false;
      }
    }
  }
  return true;
}
export function CPUSHDL (cpu, p) {
  const returnInput = {
    x: false,
    b: false
  };
  if (cpu.actionState == "WAIT" || cpu.actionState == "DASH" || (cpu.actionState == "LANDING" && cpu.timer > 3)) { //jump
    returnInput.x = true;
  } else if (cpu.actionState == "KNEEBEND" && cpu.timer >= 3) {
    returnInput.b = true;
    cpu.currentSubaction = "LASER2";
  } else {
    if (cpu.timer == 10) {
      returnInput.b = true;
      cpu.currentSubaction = "NONE";
      cpu.currentAction = "NONE";
    }
  }
  return returnInput;
}
export function CPUTech (cpu, p) {
  const returnInput = {
    lsX: 0.0,
    l: false,
    lAnalog: 0.0
  };
  //console.log("1");
  //console.log("pos" , cpu.phys.pos.y);
  //console.log("nearest" , NearestFloor(cpu));
  if (cpu.phys.pos.y - NearestFloor(cpu) <= 3 && cpu.phys.kVel.y + cpu.phys.cVel.y <= 0) {
    //console.log("trying to tech");
    const MissedTechPercent = 85 - (cpu.difficulty * 20); //how often the CPU miss techs. difficulty: {1: 65%,2: 45%,3: 25%,4: 5%}
    const randomSeed = Math.floor((Math.random() * (100 + MissedTechPercent)) + 1);
    if (randomSeed <= 34) { //inplace
      returnInput.lsX = 0.0;
      returnInput.l = true;
      returnInput.lA = 1.0;
      //console.log("techinplace");
    } else if (randomSeed <= 67) { //roll left
      returnInput.l = true;
      returnInput.lsX = -1.0;
      returnInput.lA = 1.0;
      //console.log("techrollleft");
    } else if (randomSeed <= 100) { //roll right
      returnInput.l = true;
      returnInput.lsX = 1.0;
      returnInput.lA = 1.0;
      //console.log("techrollright");
    } //otherwise miss tech
    //console.log("4");
  }
  return returnInput;

}
export function CPUMissedTech (cpu,p) {
  const returnInput = {
    lsX: 0.0,
    lsY: 0.0,
    a: false
  };
  //console.log(randomSeed);
  const randomSeed = Math.floor((Math.random() * 10) + 1);
  //console.log(randomSeed);
  //console.log("2");
  if (randomSeed <= 2) { //getup attack
    returnInput.a = true;
    //returnInput.lsX = -1.0;
  } else if (randomSeed <= 4) { //roll
    const randomSeeds = Math.floor((Math.random() * 2) + 1);
    if (randomSeeds == 1) { //left
      returnInput.lsX = -1.0;
    } else { //right
      returnInput.lsX = 1.0;
    }
  } else if (randomSeed <= 6) { //getup
    returnInput.lsY = 1.0;
  } //else do nothing
  //console.log("3");
  return returnInput;
}
export function CPUWaveshineAny (cpu,p) {
  const returnInput = {
    lsX: 0.0,
    lsY: 0.0,
    x: false,
    b: false,
    l: false,
  };

  if (cpu.actionState == "WAIT") {
    returnInput.lsY = -1.0;
    returnInput.b = true;
  }
  if (cpu.actionState == "DOWNSPECIALGROUND") {
    if (cpu.timer == 4) {
      returnInput.x = true;
    }
  } else if (cpu.actionState == "KNEEBEND" && (cpu.timer == 3)) {
    const randomSeed = Math.floor((Math.random() * 3) + 1);
    if (randomSeed == 1) { //foward
      returnInput.lsX = cpu.phys.face * 0.75;
      returnInput.lsY = -1.0;
      returnInput.l = true;
      cpu.currentAction = "NONE";
    } else if (randomSeed == 2) { //in place
      returnInput.lsX = 0;
      returnInput.lsY = -1.0;
      returnInput.l = true;
      cpu.currentAction = "NONE";
    } else { //backwards
      returnInput.lsX = cpu.phys.face * -0.75;
      returnInput.lsY = -1.0;
      returnInput.l = true;
      cpu.currentAction = "NONE";
    }
  }
  return returnInput;
}
export function CPUGrabRelease(cpu,p) {
  const returnInput = {
    lsX: 0.0,
    lsY: 0.0,
    x: false,
    b: false,
    l: false,
    csX: 0.0,
    csY: 0.0,
    a: false
  };
  if (cpu.actionState == "WAIT" || cpu.actionState == "CAPTURECUT") {
    if (characterSelections[p] == 2) { //is fox
      var randomSeed = Math.floor((Math.random() * 125) + 1);
      if (randomSeed < 4) { //waveshine
        returnInput.b = true;
        returnInput.lsY = -1.0;
        cpu.currentAction = "WAVESHINEANY";
        return returnInput;
      } else if (randomSeed < 45) { //jab
        returnInput.a = true;
        //cpu.currentAction = "NONE";
      } else if (randomSeed == 85) { //roll
        returnInput.l = true;
        var randomSeed1 = Math.floor((Math.random() * 3) + 1);
        if (randomSeed1 == 1) {
          returnInput.csX = 1.0;
        } else if (randomSeed1 == 2) {
          returnInput.csY = -1.0;
        } else {
          returnInput.csX = -1.0;
        }
        //cpu.currentAction = "NONE";
      } else if (randomSeed <= 125) { //jump
        returnInput.x = true;
        //cpu.currentAction = "NONE";
      }
    } else { //all other characters
      var randomSeed = Math.floor((Math.random() * 5) + 1);
      if (randomSeed == 1) { //f-smash
        returnInput.csX = cpu.phys.face;
        //cpu.currentAction = "NONE";
      } else if (randomSeed == 2) { //jab
        returnInput.a = true;
        //cpu.currentAction = "NONE";
      } else if (randomSeed == 3) { //roll
        returnInput.l = true;
        var randomSeed1 = Math.floor((Math.random() * 3) + 1);
        if (randomSeed1 == 1) {
          returnInput.csX = 1.0;
        } else if (randomSeed1 == 2) {
          returnInput.csY = -1.0;
        } else {
          returnInput.csX = -1.0;
        }
        //cpu.currentAction = "NONE";
      } else if (randomSeed == 4) { //jump
        returnInput.x = true;
        //cpu.currentAction = "NONE";
      }
    }
  }
  return returnInput;
}



function CPUSDItoStage(cpu, p) {
  const closest = NearestLedge(cpu);
  const returnInput = {
    lsX: 0.0,
    lsY: 0.0
  };
  if (cpu.timer % 2 == 0) {
    var imperfection = 0;
    var theta = Math.atan(((closest.y - 3.5) - cpu.phys.pos.y) / (closest.x - cpu.phys.pos.x)) + imperfection; //some trig to get angles //(cpu.phys.ledgeSnapBoxF.max.y-cpu.phys.ledgeSnapBoxF.min.y)/2
    var newX = Math.cos(theta); //* Math.sqrt(2);
    var newY = Math.sin(theta); //* Math.sqrt(2);
    if (closest.x < cpu.phys.pos.x) {
      newX *= -1;
      newY *= -1;
    }
    // dont go past 1.0 or -1.0
    newX = Math.sign(newX) * Math.min(1.0, Math.abs(newX));
    newY = Math.sign(newY) * Math.min(1.0, Math.abs(newY));

    returnInput.lsX = newX;
    returnInput.lsY = newY;
  } else {
    var imperfection = 0;
    var theta = Math.atan(((closest.y - 3.5) - cpu.phys.pos.y) / (closest.x - cpu.phys.pos.x)) + imperfection; //some trig to get angles //(cpu.phys.ledgeSnapBoxF.max.y-cpu.phys.ledgeSnapBoxF.min.y)/2
    theta = theta + 0.25 * ((Math.floor((Math.random() * 2) + 1) - 1) * -1.0) * Math.PI;
    var newX = Math.cos(theta); //* Math.sqrt(2);
    var newY = Math.sin(theta); //* Math.sqrt(2);
    if (closest.x < cpu.phys.pos.x) {
      newX *= -1;
      newY *= -1;
    }
    // dont go past 1.0 or -1.0
    newX = Math.sign(newX) * Math.min(1.0, Math.abs(newX));
    newY = Math.sign(newY) * Math.min(1.0, Math.abs(newY));

    returnInput.lsX = newX;
    returnInput.lsY = newY;
  }
  return returnInput;
}

function CPUShield(cpu, p) {
  const returnInput = {
    lsX: 0.0,
    lsY: 0.0,
    x: false,
    b: false,
    a: false,
    l: true,
    csX: 0.0,
    csY: 0.0,
  };
  let shouldDoSomething = false;
  const doSomethingChance = Math.min(100, 25 * Math.tan((Math.PI / 121) * (60 - cpu.phys.shieldHP)));
  //console.log(doSomethingChance);
  var randomSeed = Math.floor((Math.random() * 100) + 1);
  if (randomSeed <= doSomethingChance) { //do something
    returnInput.l = false;
    const extra = Math.max(0, 15 - cpu.difficulty);
    var randomSeed = Math.floor((Math.random() * 30) + 1) + extra;
    if (randomSeed <= 30) { //jump or shield drop
      if (isAboveGround(cpu.phys.pos.x, cpu.phys.pos.x)[1] == "platform" && cpu.difficulty >= 3) {
        //can shield drop
        var randomSeed = Math.floor((Math.random() * 2) + 1) + extra;
        if (randomSeed != 1) { //shield drop
          returnInput.lsY = -0.66;
          cpu.currentAction = "NONE";
        } else {
          returnInput.x = true;
          cpu.currentAction = "NONE";
        }
      } else {
        returnInput.x = true;
        cpu.currentAction = "NONE";
      }
    }
  }

  return returnInput;
}
function CPULedge(cpu, p) {
  //var returnInput = [0.0,0.0,false,false,0.0,0.0,0.0,false];
  const returnInput = {
    lsX: 0.0,
    lsY: 0.0,
    x: false,
    b: false,
    l: false,
    csX: 0.0,
    csY: 0.0,
    a: false
  }; //lsX,lsY,x,b,Lanalog,cStickX,cStickY,A
  if (cpu.actionState == "LANDINGFALLSPECIAL" && cpu.currentAction == "LEDGEDASH") {
    cpu.currentAction = "NONE";
    return returnInput;
  } else if (cpu.currentAction == "TOURNAMENTWINNER") {
    if (cpu.actionState == "FALLAERIAL") {
      cpu.curentAction = "NONE";
    }
  }
  if (cpu.currentAction == "NONE") {
    var randomSeed = Math.floor((Math.random() * 30) + 1); //highest number of randomSeed can be increased or decrease to add artificial "difficulty level". Higher seeds = less difficulty
    //var randomSeed = 20;
    //var randomSeed = 16;
    if (randomSeed <= 3) { //normal getup
      cpu.currentAction = "LEDGEGETUP";
      returnInput.lsX = cpu.phys.face;
    } else if (randomSeed <= 5) { //getup roll
      cpu.currentAction = "LEDGEROLL";
      returnInput.l = true;
    } else if (randomSeed <= 8) { //getup attack
      cpu.currentAction = "LEDGEATTACK";
      returnInput.a = true;
    } else if (randomSeed <= 9) { //tournament winner
      cpu.currentAction = "TOURNAMENTWINNER";
      returnInput.lsY = 1.0;
    } else if (randomSeed <= 12) { //ledge jump
      cpu.currentAction = "LEDGEJUMP";
      returnInput.lsY = -1.0;
      returnInput.x = true;
    } else if (randomSeed <= 16) { //ledgedash
      if (player[p].difficulty >= 1) {
        //cpu.timer = 0;
        cpu.currentAction = "LEDGEDASH";
        returnInput.lsY = -1.0;
        returnInput.x = true;
      }
    } else if (randomSeed <= 20) { //ledgeairattack
      if (player[p].difficulty > 1) {
        cpu.currentAction = "LEDGEAIRATTACK";
        returnInput.lsY = -1.0;
      }
    } else if (randomSeed <= 22) { //ledgestall
      if (player[p].difficulty >= 1) {
        if (characterSelections[p] != 1) {
          cpu.currentAction = "LEDGESTALL";
          cpu.currentSubaction = "FALL";
          returnInput.lsY = -1.0;
        }
      }
    } //else does nothing
  } else if (cpu.currentAction == "LEDGEDASH") {
    //fox waits 4 frames
    //jiggs waits 5 frames
    //marth waits 17 frames...
    if (characterSelections[p] == 0) { //is marth
      //might be one frame too late or early on timing on my end. pls fix?
      //if (player[i].timer == 18) {
      //	console.log(1.0 * Math.sign(cpu.phys.face));
      //returnInput.lsX = cpu.phys.face;
      //returnInput.lsY = -1.0;
      //returnInput.l = true;
      //}

      /*if (cpu.timer == 18) {//ledgedash?
      	returnInput.lsX = cpu.phys.face;
      	returnInput.lsY = -1.0;
      	returnInput.l = true;
      } else if (cpu.timer == 1 && cpu.actionState == "FALL") {
      	returnInput.x = true;
      	returnInput.lsX = cpu.phys.face;
      } else {
      	returnInput.lsX = cpu.phys.face;
      }
      return returnInput;
      */
      if (cpu.timer == 18) {
        returnInput.lsX = cpu.phys.face;
        returnInput.lsY = -1.0;
        returnInput.l = true;
      } else {
        returnInput.x = true;
        returnInput.lsX = cpu.phys.face;
      }
    } else if (characterSelections[p] == 1) { //is jiggsc
      if (cpu.timer == 6 && cpu.actionState == "JUMPAERIAL1") {
        returnInput.lsX = cpu.phys.face;
        returnInput.lsY = -1.0;
        returnInput.l = true;
      } else {
        returnInput.x = true;
        returnInput.lsX = cpu.phys.face;
      }
    } else if (characterSelections[p] == 2) { //is fox
      if (cpu.timer == 5) {
        returnInput.lsX = cpu.phys.face;
        returnInput.lsY = -1.0;
        returnInput.l = true;
      } else {
        returnInput.x = true;
        returnInput.lsX = cpu.phys.face;
      }
    }
  } else if (cpu.currentAction == "LEDGEJUMP") {
    if (cpu.phys.grounded) {
      returnInput.lsX = 0;
      cpu.currentAction = "NONE";
    } else {
      if (cpu.actionState == "FALL") {
        returnInput.x = true;
      }
      returnInput.lsX = cpu.phys.face; //moves forward?
    }
  } else if (cpu.currentAction == "LEDGEAIRATTACK") {
    if (characterSelections[p] == 0) { //marth
      if (cpu.timer == 1) {
        returnInput.x = true; // jump
      } else if (cpu.timer == 3) {
        var randomSeed = Math.floor((Math.random() * 4) + 1); //aerial to chose
        returnInput.lsX = cpu.phys.face;
        if (randomSeed <= 2) { //fair
          returnInput.csX = cpu.phys.face;
        } else if (randomSeed == 3) { //nair
          returnInput.lsX = 0;
          returnInput.a = true;
        } else { //uair
          returnInput.csY = 1.0;
        }
        cpu.currentAction = "LEDGEAIRATTACK2";
      } else {
        returnInput.lsX = cpu.phys.face;
      }
    } else if (characterSelections[p] == 1) { //puff
      if (cpu.timer == 1) {
        returnInput.x = true; //jump
      } else if (cpu.timer == 3) {
        var randomSeed = Math.floor((Math.random() * 4) + 1); //aerial to chose
        returnInput.lsX = cpu.phys.face;
        if (randomSeed <= 2) { //fair
          returnInput.csX = cpu.phys.face;
        } else if (randomSeed == 3) { //nair
          returnInput.lsX = 0;
          returnInput.a = true;
        } else { //uair
          returnInput.csY = 1.0;
        }
        cpu.currentAction = "LEDGEAIRATTACK2";
      } else {
        returnInput.lsX = cpu.phys.face;
      }
    } else if (characterSelections[p] == 2) { //fox
      if (cpu.timer == 3) {
        returnInput.x = true; //jump
      } else if (cpu.timer == 6) {
        var randomSeed = Math.floor((Math.random() * 4) + 1); //aerial to chose
        returnInput.csX = 0.0;
        returnInput.a = false;
        returnInput.lsX = cpu.phys.face;
        if (randomSeed <= 2) { //nair
          returnInput.lsX = 0;
          returnInput.a = true;
        } else if (randomSeed == 3) { //dair
          returnInput.csY = -1.0;
        } else { //uair
          returnInput.csY = 1.0;
        }
        cpu.currentAction = "LEDGEAIRATTACK2";
      } else {
        returnInput.lsX = cpu.phys.face;
      }
    }
  } else if (cpu.currentAction == "LEDGEAIRATTACK2") {
    returnInput.lsX = cpu.phys.face;
    //l cancel
    if (cpu.actionState == "ATTACKAIRN" || cpu.actionState == "ATTACKAIRF" || cpu.actionState == "ATTACKAIRB" || cpu.actionState ==
      "ATTACKAIRU" || cpu.actionState == "ATTACKAIRD") {
      if (!isOffstage(cpu)) {
        if (cpu.phys.pos.y - NearestFloor(cpu) <= 5) {
          //press the fucking l button
          returnInput.l = true;
        }
        if (cpu.phys.cVel.y <= 0) {
          if (!(cpu.phys.fastfalled)) {
            if (cpu.phys.pos.y - NearestFloor(cpu) >= 0) {
              returnInput.lsY = -1.0;
            }
          }
        }
        //other shit
      }
    }
    //l cancel
    //fast fall
    //other shit
    if (cpu.phys.grounded || cpu.phys.onLedge > -1) {
      cpu.currentAction = "NONE";
    }
  }
  return returnInput;
}
//Recovering:
//cpu is a reference to the current cpu. Replace it if you want
//expect cases of jigglypuff's accidently battlefielding themselves sometimes.
//Fox angles should be perfectly imperfect.
export function CPUrecover (cpu,p) {
    //Where ledges is a list of the ledges on the current stage in the following format. [[ledge1XPos, ledge1YPos],[ledge2XPos,ledge3Ypos],[...]...]
    //ledgepos is where a character can grab the ledge
    const closest = NearestLedge(cpu);
    var returnInput = [0.0, 0.0, false, false];
    var returnInput = {
      lsX: 0.0,
      lsY: 0.0,
      x: false,
      b: false
    }; //format is [x joystick float, y joystick float, x button, b button]
    // if charSelect of player num is 2 meaning Fox
    if (characterSelections[p] == 2) {
      //perfect imperfect firefox angles
      if (cpu.actionState == "UPSPECIALCHARGE") {
        returnInput.lsX = 0.0;
        returnInput.lsY = 0.0;
        if ((cpu.timer >= 40 && cpu.timer <= 43)) {
          //var imperfection = Math.floor(((Math.random() * 20) + 1) - 10) / 2000;
          const imperfection = 0;
          const theta = Math.atan(((closest.y - 3.5) - cpu.phys.pos.y) / (closest.x - cpu.phys.pos.x)) + imperfection; //some trig to get angles //(cpu.phys.ledgeSnapBoxF.max.y-cpu.phys.ledgeSnapBoxF.min.y)/2
          let newX = Math.cos(theta); //* Math.sqrt(2);
          let newY = Math.sin(theta); //* Math.sqrt(2);
          if (closest.x < cpu.phys.pos.x) {
            newX *= -1;
            newY *= -1;
          }
          // dont go past 1.0 or -1.0
          newX = Math.sign(newX) * Math.min(1.0, Math.abs(newX));
          newY = Math.sign(newY) * Math.min(1.0, Math.abs(newY));

          returnInput.lsX = newX;
          returnInput.lsY = newY;
          return returnInput;
        }
      } else if (cpu.actionState == "UPSPECIALLAUNCH") {
        returnInput.lsX = 0.0;
        returnInput.lsY = 0.0;
        return returnInput;
      }
    }
    if (cpu.actionState.substr(0, 4) == "JUMP" || cpu.actionState == "FALLAERIAL" || cpu.actionState == "DAMAGEFALL" ||
      cpu.actionState == "FALL" || cpu.actionState == "FALLSPECIAL") {
      //not in up-b or some shit
      if (cpu.phys.pos.x < closest.x) {
        returnInput.lsX = 1.0;
      } else if (cpu.phys.pos.x > closest.x) {
        returnInput.lsX = -1.0;
      }
      if (characterSelections[p] == 0 && ((Math.abs(closest.x - cpu.phys.pos.x) > 25) && (!cpu.phys.doubleJumped || (cpu.phys.jumpsUsed <
          5 && cpu.charAttributes.multiJump)) && ((closest.y - cpu.phys.pos.y < 5) || ((closest.y - cpu.phys.pos.y <
          30 && Math.abs(closest.x - cpu.phys.pos.x) > 40))))) {
        //side-b
        //console.log("HI");
        if (Math.abs(cpu.phys.cVel.x) > 0.8) {
          if (cpu.phys.pos.x < closest.x) {
            returnInput.lsX = 1.0;
          } else if (cpu.phys.pos.x > closest.x) {
            returnInput.lsX = -1.0;
          } else {
            returnInput.lsX = 0.0;
          }
          if (!(cpu.actionState.substr(0, 7) == "SPECIAL")) {
            //console.log("HEY");
            returnInput.lsY = 0.0;
            returnInput.b = true;
            return returnInput;
          }
        }
      } else {
        if (cpu.phys.cVel.y <= 0 && ((closest.y - cpu.phys.pos.y > 10 && (Math.abs(closest.x - cpu.phys.pos.x) > 25)) ||
            (closest.y - cpu.phys.pos.y > 25 && (Math.abs(closest.x - cpu.phys.pos.x) <= 25)))) { //is falling
          if (!cpu.phys.doubleJumped || (cpu.phys.jumpsUsed < 5 && cpu.charAttributes.multiJump)) { //if jumps isn't .jumps thats unintuitive on your part. only tries to jump if it can jump
            var randomSeed = Math.floor((Math.random() * 1000) + 1);

            if (randomSeed <= 300) { //will jump
              returnInput.x = true;
            } else if (randomSeed <= 301) { //will up-b
              if (characterSelections[p] != 1) { //not jigglypuff
                returnInput.lsX = 0.0;
                returnInput.lsY = 1.0;
                returnInput.b = true;
              }
            }
          } else {
            if (characterSelections[p] == 0) { //is marth
              if ((Math.abs(closest.x - cpu.phys.pos.x) <= 20 && closest.y - cpu.phys.pos.y > 30) || closest.y - cpu.phys
                .pos.y > 60) {
                returnInput.lsY = 1.0;
                returnInput.b = true;
              } //else moves towards ledge
            }
            if (characterSelections[p] == 2) { //is fox
              if ((Math.abs(closest.y - cpu.phys.pos.y) <= 10) && (Math.abs(closest.x - cpu.phys.pos.x) >= 30 && Math.abs(
                  closest.x - cpu.phys.pos.x) <= 77)) { //can side-b?
                randomSeed = Math.floor((Math.random() * 10) + 1);
                if (randomSeed <= 4) {
                  returnInput.lsY = 0.0;
                  returnInput.lsX = 1 * Math.sign(closest.x - cpu.phys.pos.x);
                  returnInput.b = true;
                  return returnInput;
                }
                /* else if (randomSeed <= 4) {
                					//returnInput.lsX = 0.0;
                					//returnInput.lsY = 1.0;
                					//returnInput.b = true;
                				}*/
              }
              if (closest.y - cpu.phys.pos.y >= 40 || Math.abs(closest.x - cpu.phys.pos.x) >= 50) {
                returnInput.lsX = 0.0;
                returnInput.lsY = 1.0;
                returnInput.b = true;
              }
            }
          }
        }
      }
      if (characterSelections[p] == 2 && returnInput.lsY == 1.0) {
        returnInput.lsX = 0.0;
      }
    } else {
      //hi
    }
    return returnInput;
  }
