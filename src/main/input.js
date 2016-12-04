/*eslint-disable*/

import {
  inverseMatrix,
  multMatVect
} from "main/linAlg";
import {Vec2D} from "main/characters";
import {keyMap} from 'settings';
import {
  showDebug, gameMode, frameByFrame, mType, currentPlayers, pause, frameAdvance, playing, player, startGame,
  endGame
  , interpretPause
  , keys
  , setFrameByFrame
} from "./main";


export class Input {
static inputs = [];
  static button = Input.getButtonMap();

  static  axis = Input.getAxisMap();
  static a = false;
  static b = false;
  static  x = false;
  static  y = false;
  static  z = false;
  static  r = false;
  static  l = false;
  static  s = false;
  static  du = false;
  static  dr = false;
  static  dd = false;
  static  dl = false;
  static  lsX = 0;
  static  lsY = 0;
  static  csX = 0;
  static  csY = 0;
  static  lA = 0;
  static  rA = 0;
  static  rawX = 0;
  static  rawY = 0;

  static lStickAxis = [new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0,
    0), new Vec2D(0, 0), new Vec2D(0, 0)];
   static rawlStickAxis = [new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(
    0, 0), new Vec2D(0, 0), new Vec2D(0, 0)];
   static cStickAxis = [new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0, 0), new Vec2D(0,
    0), new Vec2D(0, 0), new Vec2D(0, 0)];
   static lAnalog = [0, 0, 0, 0, 0, 0, 0, 0];
   static rAnalog = [0, 0, 0, 0, 0, 0, 0, 0];
   static s = [false, false, false, false, false, false, false, false];
   static z = [false, false, false, false, false, false, false, false];
   static a = [false, false, false, false, false, false, false, false];
   static b = [false, false, false, false, false, false, false, false];
   static x = [false, false, false, false, false, false, false, false];
   static y = [false, false, false, false, false, false, false, false];
   static r = [false, false, false, false, false, false, false, false];
   static l = [false, false, false, false, false, false, false, false];
   static dpadleft = [false, false, false, false, false, false, false];
   static dpaddown = [false, false, false, false, false, false, false];
   static dpadright = [false, false, false, false, false, false, false];
   static dpadup = [false, false, false, false, false, false, false];

  static  attemptingControllerReset = [false, false, false, false];
  //   a  b  x  y  z  r   l   s  du  dr  dd  dl  lsX  lsY  csX  csY  lA  rA
  static mayflashMap = [1, 2, 0, 3, 7, 5, 4, 9, 12, 13, 14, 15, 0, 1, 5, 2, 3, 4]; // ID 0, Mayflash Wii U 4-way adapter, NEXILUX adapter
  static vJoyMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 9, 10, 0, 1, 3, 4, 2, 5]; // ID 1, vJoy
  static raphnetV2_9Map = [4, 3, 2, 1, 7, 6, 5, 0, 8, 10, 9, 11, 0, 1, 3, 4, 5, 6]; // ID 2, raphnet v.2.9 N64 adapter
  static xbox360Map = [0, 1, 2, 3, 5, 7, 6, 9, 12, 15, 13, 14, 0, 1, 2, 3, 6, 7]; // ID 3, Xbox 360 (XInput Standard Gamepad)
  static tigergameMap = [0, 1, 2, 3, 6, 5, 4, 7, 11, 9, 10, 8, 0, 1, 2, 3, 5, 4]; // ID 4, TigerGame 3-in-1 adapter
  static retrolinkMap = [2, 3, 1, 0, 6, 5, 4, 9, 10, 11, 8, 7, 0, 1, 2, 5, 3, 4]; // ID 5, Retrolink adapter
  static raphnetV3_2Map = [0, 1, 7, 8, 2, 5, 4, 3, 10, 13, 11, 12, 0, 1, 3, 4, 5, 2]; // ID 6, Raphnet v 3.2,3.3
  static brookMap = [0, 1, 2, 3, 4, 10, 11, 8, 12, 15, 13, 14, 0, 1, 2, 5, 3, 4]; // ID 7, Brook adapter (d-pad values might be wrong, user had broken d-pad)
  static ps4Map = [1, 0, 2, 3, 5, 7, 6, 9, 12, 15, 13, 14, 0, 1, 2, 5, 3, 4]; // ID 8, PS4 controller
  static rockx360Map = [0, 1, 2, 3, 5, 4, 4, 7, 12, 15, 13, 14, 0, 1, 3, 4, 2, 5]; // ID 9, Rock Candy Xbox 360 controller (d-pad are axes not buttons; axes to be confirmed)
  //   a  b  x  y  z  r   l   s  du  dr  dd  dl  lsX  lsY  csX  csY  lA  rA
// ID number 10 reserved for keyboard
  static  controllerMaps = [Input.mayflashMap, Input.vJoyMap, Input.raphnetV2_9Map, Input.xbox360Map, Input.tigergameMap, Input.retrolinkMap, Input.raphnetV3_2Map, Input.brookMap, Input.ps4Map, Input.rockx360Map];

  static nullInput = Input.inputData();

  static keyboardMap = [
    [102, 186],
    [101, 76],
    [100, 75],
    [104, 79],
    [103, 73],
    [105, 80],
    [107, 192, 222],
    [109, 219], 71, 78, 66, 86
  ];

  static customCenters = {
    ls: new Vec2D(0, 0),
    cs: new Vec2D(0, 0),
    l: 0,
    r: 0
  };

  static  custcent = [Input.customCenters, Input.customCenters, Input.customCenters, Input.customCenters];

  static controllerIDMap = () => {
    let idMap = new Map();

// ID 0, Mayflash Wii-U adapter & variants
    idMap.set("Mayflash", 0); // Mayflash 4 port, ID: MAYFLASH GameCube Controller Adapter
    idMap.set("0079-1843", 0);

    idMap.set("NEXILUX", 0); // NEXILUX GAMECUBE Controller Adapter
    idMap.set("0079-1845", 0);

    idMap.set("Wii U GameCube Adapter", 0); // Mayflash 4 port on Linux, no vendor/product ID?

    idMap.set("USB GamePad", 0); // Mayflash 2 port, ID: USB GamePad, TODO: should check vendor & product
    idMap.set("1a34-f705", 0);

// ID 1, vJoy
    idMap.set("vJoy", 1);
    idMap.set("1234-bead", 1);

// ID 2, raphnet n64 adapter, version 2.9 (and below?)
    idMap.set("GC/N64 to USB, v2.", 2);
    idMap.set("GC/N64 to USB v2.", 2);
    idMap.set("289b-000c", 2);

// ID 3, XBOX 360 or XInput standard gamepad
    idMap.set("Microsoft Controller", 3); // XBOX 360 & XBOX One controllers
    idMap.set("XBOX 360", 3); // ID: Xbox 360 Controller
    idMap.set("Microsoft X-Box One", 3); // ID: Microsoft X-Box One pad
    idMap.set("XInput", 3);
    idMap.set("Standard Gamepad", 3);
    idMap.set("045e-02d1", 3);

    idMap.set("Wireless 360 Controller", 3); // XBOX 360 controller on Mac
    idMap.set("045e-028e", 3);

// ID 4, TigerGame 3-in-1 adapter
    idMap.set("TigerGame", 4); // ID: TigerGame XBOX+PS2+GC Game Controller Adapter
    idMap.set("0926-2526", 4);

// ID 5, Retrolink adapter
    idMap.set("Generic USB Joystick", 5); // ID: Generic USB Joystick, TODO: should check ID and vendor...
    idMap.set("0079-0006", 5);

// ID 6, raphnet n64 adapter, version 3.0 and above
    idMap.set("GC/N64 to USB v3.", 6); // "v3.2" and "v3.3"
    idMap.set("GC/N64 to USB, v3.", 6);
    idMap.set("289b-001d", 6);

// ID 7, Brook adapter
    idMap.set("Wii U GameCube Controller Adapter", 7);
    idMap.set("0e8f-0003", 7);

// ID 8, PS4 controller
    idMap.set("Wireless Controller", 8); // should check ID and vendor...
    idMap.set("054c-05c4", 8);

// ID 9, Rock Candy Xbox 360 controller
    idMap.set("Performance Designed Products Rock Candy Gamepad for Xbox 360", 8);
    idMap.set("0e6f-011f", 8);

    return idMap;
//--END OF CONTROLLER IDs-------------------------------------
  };

  static controllerNameFromIDnumber = {
    0: "Mayflash Wii-U adapter",

    1: "vJoy",

    2: "raphnet v2.9 N64 adapter",

    3: "Xbox 360 compatible controller",

    4: "TigerGame 3-in-1",

    5: "Retrolink adapter",

    6: "raphnet v3.2+ N64 adapter",

    7: "Brook adapter",

    8: "PS4 controller",

    9: "Xbox 360 (Rock Candy) controller"

  };


  static  steps = 80;
  static  deadzoneConst = 0.28;
  static  leniency = 10;

  static  meleeOrig = 128;
  static  meleeMin = Input.meleeOrig - (Input.steps + Input.leniency); // lowest  0 -- 255 input the controller will give
  static  meleeMax = Input.meleeOrig + (Input.steps + Input.leniency); // highest 0 -- 255 input the controller will give

  static  input = Input.makeNullInputs();


  constructor(owner) {
    if(owner) {
      Input.setGlobalInputs(owner, this);
    }
    return this;
  }

  static getAxisMap() {
    return {
      "lsX": 12, // left analog stick left/right
      "lsY": 13, // left analog stick up/down
      "csX": 14, // c-stick left/right
      "csY": 15, // c-stick up/down
      "lA": 16, // L button analog sensor
      "rA": 17  // R button analog sensor
    };
  }

  static getButtonMap() {
    return {
      "a": 0,
      "b": 1,
      "x": 2,
      "y": 3,
      "z": 4,
      "r": 5,
      "l": 6,
      "s": 7,  // start
      "du": 8,  // d-pad up
      "dr": 9,  // d-pad right
      "dd": 10, // d-pad down
      "dl": 11  // d-pad left
    };
  }

  static makeNullInputs() {
    return [Input.inputData()
      , Input.inputData()
      , Input.inputData()
      , Input.inputData()
      , Input.inputData()
      , Input.inputData()
      , Input.inputData()
      , Input.inputData()
    ];
  }

  static inputData(list = [false, false, false, false, false, false, false, false, false, false, false, false, 0, 0, 0, 0, 0, 0, 0, 0]) {
    let btnmap = Input.getButtonMap();
    let axismap = Input.getAxisMap();
    return {
      a: list[btnmap["a"]],
      b: list[btnmap["b"]],
      x: list[btnmap["x"]],
      y: list[btnmap["y"]],
      z: list[btnmap["z"]],
      r: list[btnmap["r"]],
      l: list[btnmap["l"]],
      s: list[btnmap["s"]],
      du: list[btnmap["du"]],
      dr: list[btnmap["dr"]],
      dd: list[btnmap["dd"]],
      dl: list[btnmap["dl"]],
      lsX: list[axismap["lsX"]],
      lsY: list[axismap["lsY"]],
      csX: list[axismap["csX"]],
      csY: list[axismap["csY"]],
      lA: list[axismap["lA"]],
      rA: list[axismap["rA"]],
      rawX: list[18],
      rawY: list[19]
    }
  }


// should be able to move out the "frameByFrame" aspect of the following function
// it is only used to make z button mean "left trigger value = 0.35" + "A = true".
  static pollInputs(gameMode, frameByFrame, controllerType, playerSlot, controllerIndex, keys) {
    // input is the input for player i in the current frame
    let input = this.nullInput; // initialise with default values
    if (controllerType == 10) { // keyboard controls
      input = Input.pollKeyboardInputs(gameMode, frameByFrame, keys);
    }
    else {
      input = Input.pollGamepadInputs(gameMode, controllerType, playerSlot, controllerIndex, frameByFrame);
    }
    return input;
  }

  static pollKeyboardInputs(gameMode, frameByFrame, keys) {
    let input = this.nullInput; // initialise with default values

    let stickR = 1;
    let stickL = 1;
    let stickU = 1;
    let stickD = 1;
    if (gameMode == 3 || gameMode == 5) {
      stickR = keyMap.lstick.ranges[1];
      stickL = keyMap.lstick.ranges[2];
      stickU = keyMap.lstick.ranges[0];
      stickD = keyMap.lstick.ranges[3];
    }
    let lstickX = (keys[keyMap.lstick.right[0]] || keys[keyMap.lstick.right[1]]) ? ((keys[keyMap.lstick.left[0]] ||
    keys[keyMap.lstick.left[1]]) ? 0 : stickR) : ((keys[keyMap.lstick.left[0]] || keys[keyMap.lstick.left[1]]) ?
        -stickL : 0);
    let lstickY = (keys[keyMap.lstick.up[0]] || keys[keyMap.lstick.up[1]]) ? ((keys[keyMap.lstick.down[0]] || keys[
        keyMap.lstick.down[1]]) ? 0 : stickU) : ((keys[keyMap.lstick.down[0]] || keys[keyMap.lstick.down[1]]) ? -
        stickD : 0);

    let lAnalog = (keys[keyMap.shoulders.lAnalog[0]] || keys[keyMap.shoulders.lAnalog[1]]) ? keyMap.shoulders.ranges[
        0] : 0;
    let rAnalog = (keys[keyMap.shoulders.rAnalog[0]] || keys[keyMap.shoulders.rAnalog[1]]) ? keyMap.shoulders.ranges[
        1] : 0;
    if (gameMode == 3 || gameMode == 5) {
      for (var j = 0; j < 5; j++) {
        if (keys[keyMap.lstick.modifiers[j][0]]) {
          lstickX *= keyMap.lstick.modifiers[j][1];
          lstickY *= keyMap.lstick.modifiers[j][2];
        }
        if (keys[keyMap.shoulders.modifiers[j][0]]) {
          lAnalog *= keyMap.shoulders.modifiers[j][1];
          rAnalog *= keyMap.shoulders.modifiers[j][2];
        }
      }
    }
    lstickX = Math.sign(lstickX) * Math.min(1, Math.abs(lstickX));
    lstickY = Math.sign(lstickY) * Math.min(1, Math.abs(lstickY));
    lAnalog = Math.min(1, Math.abs(lAnalog));
    rAnalog = Math.min(1, Math.abs(rAnalog));

    let cstickX = (keys[keyMap.cstick.right[0]] || keys[keyMap.cstick.right[1]]) ? ((keys[keyMap.cstick.left[0]] ||
    keys[keyMap.cstick.left[1]]) ? 0 : 1) : ((keys[keyMap.cstick.left[0]] || keys[keyMap.cstick.left[1]]) ? -1 :
        0);
    let cstickY = (keys[keyMap.cstick.up[0]] || keys[keyMap.cstick.up[1]]) ? ((keys[keyMap.cstick.down[0]] || keys[
        keyMap.cstick.down[1]]) ? 0 : 1) : ((keys[keyMap.cstick.down[0]] || keys[keyMap.cstick.down[1]]) ? -1 : 0);

    input.lsX = lstickX;
    input.lsY = lstickY;
    input.rawX = lstickX;
    input.rawY = lstickY;
    input.csX = cstickX;
    input.csY = cstickY;
    input.lA = lAnalog;
    input.rA = rAnalog;
    input.s = keys[keyMap.s[0]] || keys[keyMap.s[1]];
    input.x = keys[keyMap.x[0]] || keys[keyMap.x[1]];
    input.a = keys[keyMap.a[0]] || keys[keyMap.a[1]];
    input.b = keys[keyMap.b[0]] || keys[keyMap.b[1]];
    input.y = keys[keyMap.y[0]] || keys[keyMap.y[1]];
    input.r = keys[keyMap.r[0]] || keys[keyMap.r[1]];
    input.l = keys[keyMap.l[0]] || keys[keyMap.l[1]];
    input.z = keys[keyMap.z[0]] || keys[keyMap.z[1]];
    input.dl = keys[keyMap.dl[0]];
    input.dd = keys[keyMap.dd[0]];
    input.dr = keys[keyMap.dr[0]];
    input.du = keys[keyMap.du[0]];

    if (input.l) {
      input.lA = 1;
    }
    if (input.r) {
      input.rA = 1;
    }

    if (!frameByFrame && gameMode != 4) { // not in target builder or frame by frame mode
      if (input.z) {
        input.lA = 0.35;
        input.a = true;
      }
    }

    return input;
  }

  static pollGamepadInputs(gameMode, controllerType, playerSlot, controllerIndex, frameByFrame) {
    let input = this.nullInput;

    let gamepad = navigator.getGamepads()[controllerIndex];

    function axisData(ax) {
      return Input.gpdaxis(gamepad, controllerType, ax);
    }

    function buttonData(but) {
      return Input.gpdbutton(gamepad, controllerType, but);
    }

    let lsXData = axisData("lsX");
    let lsYData = axisData("lsY");

    let lsticks = Input.scaleToMeleeAxes(lsXData, // x-axis data
        lsYData, // y-axis data
        controllerType,
        true, // true: deadzones
        Input.custcent[playerSlot].ls.x,  // x-axis "custom center" offset
        Input.custcent[playerSlot].ls.y); // y-axis "custom center" offset
    let csticks = Input.scaleToMeleeAxes(axisData("csX"),
        axisData("csY"),
        controllerType,
        true,
        Input.custcent[playerSlot].cs.x,
        Input.custcent[playerSlot].cs.y);
    let rawlsticks =
        Input.scaleToUnitAxes(lsXData,
            lsYData,
            controllerType,
            Input.custcent[playerSlot].ls.x,
            Input.custcent[playerSlot].ls.y);
    let lstickX = lsticks[0];
    let lstickY = lsticks[1];
    let cstickX = csticks[0];
    let cstickY = csticks[1];
    let rawstickX = rawlsticks[0];
    let rawstickY = rawlsticks[1];

    let lAnalog = 0;
    let rAnalog = 0;

    //----------------------------------------------------------------
    //-- Below: should be moved to inputs.js

    if (controllerType == 3) {
      lAnalog = Input.scaleToGCTrigger(buttonData("l").value, 0.2 - Input.custcent[playerSlot].l, 1); // shifted by +0.2
      rAnalog = Input.scaleToGCTrigger(buttonData("r").value, 0.2 - Input.custcent[playerSlot].r, 1); // shifted by +0.2
    }
    else if (controllerType == 2) {
      lAnalog = Input.scaleToGCTrigger(axisData("lA"), 0.867 - Input.custcent[playerSlot].l, -0.6); // shifted by +0.867, flipped
      rAnalog = Input.scaleToGCTrigger(axisData("rA"), 0.867 - Input.custcent[playerSlot].r, -0.6); // shifted by +0.867, flipped
    }
    else if (controllerType == 7) { //Brook adapter has no L/R analog information, just light presses
      lAnalog = gamepad.buttons[6].pressed ? 0.3 : 0;
      rAnalog = gamepad.buttons[7].pressed ? 0.3 : 0;
    }
    else {
      lAnalog = Input.scaleToGCTrigger(axisData("lA"), 0.867 - Input.custcent[playerSlot].l, 0.6); // shifted by +0.867
      rAnalog = Input.scaleToGCTrigger(axisData("rA"), 0.867 - Input.custcent[playerSlot].r, 0.6); // shifted by +0.867
    }

    //-- Above: should be moved to inputs.js
    //----------------------------------------------------------------


    //----------------------------------------------------------------
    //-- Below: should be moved to inputs.js

    if (controllerType == 3) {
      // FOR XBOX CONTROLLERS
      input.r = buttonData("r").value > 0.95 ? true : false;
      input.l = buttonData("l").value > 0.95 ? true : false;

      // 4 is lB, 5 is RB
      if (gamepad.buttons[4].pressed) {
        input.l = true;
      }
    } else if (controllerType == 9) { // Rock Candy controller
      input.r = axisData("rA").value > 0.95 ? true : false;
      input.l = axisData("lA").value > 0.95 ? true : buttonData("l").pressed;
    } else {
      input.r = buttonData("r").pressed;
      input.l = buttonData("l").pressed;
    }

    //-- Above: should be moved to inputs.js
    //----------------------------------------------------------------

    input.lsX = lstickX;
    input.lsY = lstickY;
    input.rawX = rawstickX;
    input.rawY = rawstickY;
    input.csX = cstickX;
    input.csY = cstickY;
    input.lA = lAnalog;
    input.rA = rAnalog;
    input.s = buttonData("s").pressed;
    input.x = buttonData("x").pressed;
    input.a = buttonData("a").pressed;
    input.b = buttonData("b").pressed;
    input.y = buttonData("y").pressed;
    input.z = buttonData("z").pressed;

    //----------------------------------------------------------------
    //-- Below: should be moved to inputs.js

    if (controllerType == 9) { // Rock Candy controller, parameters to be confirmed
      input.dl = gamepad.axes[6] < -0.5 ? true : false;
      input.dr = gamepad.axes[6] > 0.5 ? true : false;
      input.dd = gamepad.axes[7] > 0.5 ? true : false;
      input.du = gamepad.axes[7] < -0.5 ? true : false;
    }
    else {
      input.dl = buttonData("dl").pressed;
      input.dd = buttonData("dd").pressed;
      input.dr = buttonData("dr").pressed;
      input.du = buttonData("du").pressed;
    }

    //-- Above: should be moved to inputs.js
    //----------------------------------------------------------------

    if (input.l) {
      input.lA = 1;
    }
    if (input.r) {
      input.rA = 1;
    }
    if (!frameByFrame && gameMode != 4) { // not in target builder
      input.z = buttonData("z").pressed;
      if (input.z) {
        input.lA = 0.35;
        input.a = true;
      }
    }

    return input;
  }
  ;

// Checking gamepad inputs are well defined
  static gpdaxis(gpd, gpdID, ax) { // gpd.axes[n] but checking axis index is in range
    let number = this.controllerMaps[gpdID][axis[ax]];
    if (number > gpd.axes.length) {
      return 0;
    }
    else {
      const output = gpd.axes[number];
      if (output === null || output == undefined) {
        return 0;
      }
      else {
        return output;
      }
    }
  }

  static   gpdbutton(gpd, gpdID, but) { // gpd.buttons[n] but checking button index is in range
    let number = this.controllerMaps[gpdID][this.button[but]];
    if (number > gpd.buttons.length) {
      return false;
    }
    else {
      const output = gpd.buttons[number];
      if (output == null || output === undefined) {
        return false;
      }
      else {
        return output;
      }
    }
  }

  static  controllerIDNumberFromGamepadID(gamepadID) {
    var output = -1;
    for (var [possibleID, val] of Input.controllerIDMap.entries()) {
      let l = possibleID.length;
      if (gamepadID.toLowerCase().substring(0, l) === possibleID.toLowerCase()) {
        output = val;
        break;
      }
    }
    return output;
  }

  static fromCardinals([origx, origy], l, r, d, u) {
    return [[origx, origy], [l, origy], [r, origy], [origx, d], [origx, u]];
  }


// parameters for GC controller simulation
// the following function gives an approximation to the extreme raw axis data for a given controller
// of course, this varies between controllers, but this serves as a useful first approximation
// function output: [[origx, origy], [lx, ly], [rx, ry], [dx, dy], [ux, uy]]
  static axisDataFromIDNumber(number) {
    switch (number) {
      case 4 : // TigerGame 3-in-1
        return ( Input.fromCardinals([0.05, -0.05], -0.7, 0.85, 0.7, -0.85) );
        break;
      case 3: // XInput controllers
      case 8: // PS4 controller
      case 9: // Rock Candy Xbox 360 controller
        return ( Input.fromCardinals([0, 0], -1, 1, 1, -1) );
        break;
      default:
        return ( Input.fromCardinals([0, 0], -0.75, 0.75, 0.75, -0.75) );
    }
  }


// The following function renormalises axis input,
// so that corners (l = left, r = right, d=down, u=up) are mapped to the respective corners of the unit square.
// This function assumes that ALL coordinates have already been centered.
// Return type: [xnew,ynew]
  static renormaliseAxisInput([lx, ly], [rx, ry], [dx, dy], [ux, uy], [x, y]) {
    if ((x * ry - y * rx <= 0) && (x * uy - y * ux >= 0)) // quadrant 1
    {
      let invMat = inverseMatrix([
        [rx, ux],
        [ry, uy]
      ]);
      return multMatVect(invMat, [x, y]);
    } else if ((x * uy - y * ux <= 0) && (x * ly - y * lx >= 0)) // quadrant 2
    {
      let invMat = inverseMatrix([
        [-lx, ux],
        [-ly, uy]
      ]);
      return multMatVect(invMat, [x, y]);
    } else if ((x * ly - y * lx <= 0) && (x * dy - y * dx >= 0)) // quadrant 3
    {
      let invMat = inverseMatrix([
        [-lx, -dx],
        [-ly, -dy]
      ]);
      return multMatVect(invMat, [x, y]);
    } else // quadrant 4
    {
      let invMat = inverseMatrix([
        [rx, -dx],
        [ry, -dy]
      ]);
      return multMatVect(invMat, [x, y]);
    }
  }

  static toInterval(x) {
    if (x < -1) {
      return -1;
    }
    else if (x > 1) {
      return 1;
    }
    else {
      return x;
    }
  }

  // t = trigger input
  static scaleToGCTrigger(t, offset, scale) {
    let tnew = (t + offset) * scale;
    if (tnew > 1) {
      return 1;
    }
    else if (tnew < 0.3) {
      return 0;
    }
    else {
      return tnew;
    }
  }

// rescales -1 -- 0 -- 1 to min -- orig -- max, and rounds to nearest integer
  static discretise(x, min, orig, max) {
    if (x < 0) {
      return Math.round((x * (orig - min) + orig));
    }
    else if (x > 0) {
      return Math.round((x * (max - orig) + orig));
    }
    else {
      return orig;
    }
  };


// Rescales controller input to -1 -- 0 -- 1 in both axes
  static scaleToUnitAxes(x, y, number, customCenterX, customCenterY) { // number = gamepad ID number
    let [[origx, origy], [lx, ly], [rx, ry], [dx, dy], [ux, uy]] = Input.axisDataFromIDNumber(number);
    origx += customCenterX;
    origy += customCenterY;
    let [xnew, ynew] = Input.renormaliseAxisInput([lx - origx, ly - origy], [rx - origx, ry - origy], [dx - origx, dy - origy], [ux - origx, uy - origy], [x - origx, y - origy]);
    return [Input.toInterval(xnew), Input.toInterval(ynew)];
  };

// Rescales -1 -- 1 input to 0 -- 255 values to simulate a GC controller
  static scaleUnitToGCAxes(x, y) {
    let xnew = Input.discretise(x, meleeMin, meleeOrig, meleeMax);
    let ynew = Input.discretise(y, meleeMin, meleeOrig, meleeMax);
    return ([xnew, ynew]);
  };

// Rescales controller input to 0 -- 255 values to simulate a GC controller
  static scaleToGCAxes(x, y, number, customCenterX, customCenterY) {
    let [xnew, ynew] = Input.scaleToUnitAxes(x, y, number, customCenterX, customCenterY);
    return Input.scaleUnitToGCAxes(xnew, ynew);
  }


// ---------------------------------
// Melee input rescaling functions


// basic mapping from 0 -- 255 back to -1 -- 1 done by Melee
// boolean value: true = deadzones, false = no deadzones
  static axisRescale(x, orig = meleeOrig) {
    return (x - orig) / steps;
  };

  static unitRetract([x,y]) {
    let norm = Math.sqrt(x * x + y * y);
    if (norm < 1) {
      return ([x, y]);
    }
    else {
      return ( [x / norm, y / norm]);
    }
  };

  static meleeAxesRescale([x,y], bool) {
    let xnew = Input.axisRescale(x, meleeOrig, bool);
    let ynew = Input.axisRescale(y, meleeOrig, bool);
    let [xnew2, ynew2] = Input.unitRetract([xnew, ynew]);
    if (bool) {
      if (Math.abs(xnew2) < Input.deadzoneConst) {
        xnew2 = 0;
      }
      if (Math.abs(ynew2) < Input.deadzoneConst) {
        ynew2 = 0;
      }
    }
    return [xnew2, ynew2];
  }

  static meleeRound(x) {
    return Math.round(Input.steps * x) / steps;
  };


// this is the main input rescaling function
// it scales raw input data to the data Melee uses for the simulation
// number : controller ID, to rescale axes dependent on controller raw input
// bool == false means no deadzone, bool == true means deadzone
  static scaleToMeleeAxes(x, y, number, bool, customCenterX, customCenterY) {
    if (number === 0 || number == 4 || number === 5 || number === 7) { // gamecube controllers
      x = ( x - customCenterX + 1) * 255 / 2; // convert raw input to 0 -- 255 values in obvious way
      y = (-y + customCenterY + 1) * 255 / 2; // y incurs a sign flip
      //console.log("You are using raw GC controller data.");
    }
    else { // convert raw input to 0 -- 255 by GC controller simulation
      [x, y] = Input.scaleToGCAxes(x, y, number, customCenterX, customCenterY);
      //console.log("You are using GC controller simulation.");
    }
    return (Input.meleeAxesRescale([x, y], bool)).map(Input.meleeRound);
  };

// scales -1 -- 1 data to the data Melee uses for the simulation
// bool == false means no deadzone, bool == true means deadzone
  static meleeRescale(x, y, bool = false) {
    let [xnew, ynew] = Input.scaleUnitToGCAxes(x, y);
    return (Input.meleeAxesRescale([xnew, ynew], bool)).map(Input.meleeRound);
  }

  static showButton(i, but, bool) {
    if (bool) {
      $("#" + i + "button" + but).show();
    }
    else {
      $("#" + i + "button" + but).hide();
    }
  }

  static interpretInputs = function (i, active) {
   let input = Input.makeNullInputs();


    input[0] = Input.pollInputs(gameMode, frameByFrame, mType[i], i, currentPlayers[i], keys);

    pause[i][1] = pause[i][0];
    frameAdvance[i][1] = frameAdvance[i][0];

    if (mType[i] == 10) { // keyboard controls
      if (input[0].s || input[1].s) {
        pause[i][0] = true;
      } else {
        pause[i][0] = false
      }
      if (input[0].z || input[1].z) {
        frameAdvance[i][0] = true;
      } else {
        frameAdvance[i][0] = false
      }
      if (frameAdvance[i][0] && !frameAdvance[i][1] && !playing && gameMode != 4) {
        setFrameByFrame(true);
      }
      if (active) {
        if (input[0].dl && !input[1].dl) {
          player[i].showLedgeGrabBox ^= true;
        }
        if (input[0].dd && !input[1].dd) {
          player[i].showECB ^= true;
        }
        if (input[0].dr && !input[1].dr) {
          player[i].showHitbox ^= true;
        }
      }
      if ((input[0].a || input[1].a) && (input[0].l || input[1].l) && (input[0].r ||
          input[1].r) && (input[0].s || input[1].s)) {
        if (input[0].b || input[1].b) {
          startGame();
        }
        else {
          endGame();
        }
      }

      interpretPause(i);

      if (showDebug) {
        $("#lsAxisX" + i).empty().append(input[0].lsX.toFixed(4));
        $("#lsAxisY" + i).empty().append(input[0].lsY.toFixed(4));
        $("#csAxisX" + i).empty().append(input[0].csX.toFixed(4));
        $("#csAxisY" + i).empty().append(input[0].csY.toFixed(4));
        $("#lAnalog" + i).empty().append(input[0].lA.toFixed(4));
        $("#rAnalog" + i).empty().append(input[0].rA.toFixed(4));
      }
    }
    else { // gamepad controls

      if (input[0].a && input[0].l && input[0].r && input[0].s) {
        if (input[0].b) {
          startGame();
        }
        else {
          endGame();
        }
      }

      if (( input[0].s && !input[1].s) || input[0].du.pressed && gameMode == 5) {
        pause[i][0] = true;
      } else {
        pause[i][0] = false
      }
      if (input[0].z && !input[1].z) {
        frameAdvance[i][0] = true;
      } else {
        frameAdvance[i][0] = false
      }

      if (frameAdvance[i][0] && !frameAdvance[i][1] && !playing && gameMode != 4) {
        setFrameByFrame(true);
      }

      if (input[0].dl && !input[1].dl) {
        player[i].showLedgeGrabBox ^= true;
      }
      if (input[0].dd && !input[1].dd) {
        player[i].showECB ^= true;
      }
      if (input[0].dr && !input[1].dr) {
        player[i].showHitbox ^= true;
      }

      // Controller reset functionality
      if ((input[0].z || input[0].du) && input[0].x && input[0].y && !this.attemptingControllerReset[i]) {
        this.attemptingControllerReset[i] = true;
        setTimeout(() => {
          if (input[0].du && input[0].x && input[0].y) {
            Input.custcent[i].ls = new Vec2D(input[0].lsX, input[0].lsY);
            Input.custcent[i].cs = new Vec2D(input[0].lsX, input[0].lsY);
            Input.custcent[i].l = input[0].lA;
            Input.custcent[i].r = input[0].rA;
            console.log("Controller Reset!");
            $("#resetIndicator" + i).fadeIn(100);
            $("#resetIndicator" + i).fadeOut(500);
          }
          this.attemptingControllerReset[i] = false;
        }, 2000);
      }

      interpretPause(i);

      Input.showButton(i, 0, input[0].a);
      Input.showButton(i, 1, input[0].b);
      Input.showButton(i, 2, input[0].x);
      Input.showButton(i, 3, input[0].y);
      Input.showButton(i, 4, input[0].z);
      Input.showButton(i, 5, input[0].r);
      Input.showButton(i, 6, input[0].l);
      Input.showButton(i, 7, input[0].s);
      Input.showButton(i, 8, input[0].du);
      Input.showButton(i, 9, input[0].dr);
      Input.showButton(i, 10, input[0].dd);
      Input.showButton(i, 11, input[0].dl);

      if (showDebug) {
        $("#lsAxisX" + i).empty().append(input[0].lsX.toFixed(4));
        $("#lsAxisY" + i).empty().append(input[0].lsY.toFixed(4));
        $("#csAxisX" + i).empty().append(input[0].csX.toFixed(4));
        $("#csAxisY" + i).empty().append(input[0].csY.toFixed(4));
        $("#lAnalog" + i).empty().append(input[0].lA.toFixed(4));
        $("#rAnalog" + i).empty().append(input[0].rA.toFixed(4));
      }

    }


    return input;

  };


  static getPlayerInputs(i) {
    return Input.input[i];
  }

  static setPlayerInputs(index, val) {
    return Input.input[index] = val;
  }

  static setGlobalInputs(owner,val){
    Input.inputs[owner] = val;
  }
}

