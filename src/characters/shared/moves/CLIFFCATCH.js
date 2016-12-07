import {playSounds, actionStates, turnOffHitboxes} from "physics/actionStateShortcuts";
import {characterSelections,  player} from "main/main";
import {Vec2D} from "main/util";
import {drawVfx} from "main/vfx/drawVfx";
import {activeStage} from "stages/activeStage";
export default {
  name : "CLIFFCATCH",
  canGrabLedge : false,
  canBeGrabbed : false,
  posOffset : [],
  landType : 0,
  init : function(p,input){
    player[p].actionState = "CLIFFCATCH";
    player[p].timer = 0;
    player[p].phys.cVel.x = 0;
    player[p].phys.cVel.y = 0;
    player[p].phys.kVel.x = 0;
    player[p].phys.kVel.y = 0;
    player[p].phys.thrownHitbox = false;
    player[p].phys.fastfalled = false;
    player[p].phys.doubleJumped = false;
    player[p].phys.jumpsUsed = 0;
    player[p].phys.intangibleTimer = 38;
    player[p].phys.ledgeHangTimer = 0;
    player[p].rotation = 0;
    player[p].rotationPoint = new Vec2D(0,0);
    player[p].colourOverlayBool = false;
    player[p].phys.chargeFrames = 0;
    player[p].phys.charging = false;
    turnOffHitboxes(p);
    drawVfx("cliffcatchspark",new Vec2D(activeStage.ledge[player[p].phys.onLedge][1]?activeStage.box[activeStage.ledge[player[p].phys.onLedge][0]].max.x:activeStage.box[activeStage.ledge[player[p].phys.onLedge][0]].min.x,activeStage.box[activeStage.ledge[player[p].phys.onLedge][0]].max.y),player[p].phys.face);
    actionStates[characterSelections[p]].CLIFFCATCH.main(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("CLIFFCATCH",p);
    if (!actionStates[characterSelections[p]].CLIFFCATCH.interrupt(p,input)){
      var x = activeStage.ledge[player[p].phys.onLedge][1]?activeStage.box[activeStage.ledge[player[p].phys.onLedge][0]].max.x:activeStage.box[activeStage.ledge[player[p].phys.onLedge][0]].min.x;
      var y = activeStage.box[activeStage.ledge[player[p].phys.onLedge][0]].max.y;
      player[p].phys.pos = new Vec2D(x+(actionStates[characterSelections[p]].CLIFFCATCH.posOffset[player[p].timer-1][0]+68.4)*player[p].phys.face,y+actionStates[characterSelections[p]].CLIFFCATCH.posOffset[player[p].timer-1][1]);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > frames[characterSelections[p]].CLIFFCATCH){
      actionStates[characterSelections[p]].CLIFFWAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};

