import {Vec2D} from "../main/util/Vec2D";
import {dotProd, scalarProd, norm} from "main/linAlg";

const magicAngle = Math.PI/6;
const maximumCollisionDetectionPasses = 15;
const cornerPushoutMethod = "h"; // corners only push out horizontally
export const additionalOffset = 0.00001;

function getXOrYCoord(vec, xOrY) {
  if (xOrY === 0) {
    return vec.x;
  }
  else {
    return vec.y;
  }
};

function turn(number, counterclockwise = true) {
  if (counterclockwise) {
    if (number === 3) {
      return 0;
    }
    else { 
      return number+1;
    }
  }
  else {
    if (number === 0) {
      return 3;
    }
    else {
      return number-1;
    }
  }
};

function pushoutMethodFromType(wallType) {
  switch (wallType) {
    case "c": // ceiling
    case "g": // ground
    case "p": // platform
      return "v"; // vertical pushback
      break;
    case "l": // left wall
    case "r": // right wall
    default:
      return "h"; // horizontal pushback
      break;
  }
}

function firstNonFalse( list ) {
  if (list === null || list === undefined || list.length < 1) {
    return false;
  }
  else {
    const [head, ...tail] = list;
    if ( head === false ) {
      return firstNonFalse(tail);
    }
    else {
      return head;
    }
  }
};


// for stages to have connected grounds/platforms, they need to provide a 'connectednessFunction'
// input of a connectedness function: [type, index ], side
// type is either "g" (ground) or "p" (platform),
// index is the index of that surface in the stage's list of surfaces (grounds or platforms depending on type)
// side is either "l" (left) or "r" (right)
// given such an input, the function should return which ground/platform is connected to that side of the given ground/platform,
// in the format [ newType, newIndex ],
// or return 'false' if the ground/platform is not connected on that side to any other ground/platform

// here I am constructing a 'connectednessFunction' from the data of chains of connected grounds/platforms
// if 'connectednessFunction' is not supplied, it is assumed that no grounds/platforms are connected to any other grounds/platforms
export function connectednessFromChains(label, side, isLoopThenChains) {
  return firstNonFalse ( isLoopThenChains.map( (isLoopThenChain) => searchThroughChain(label, side, isLoopThenChain[1], isLoopThenChain[0]) ));
};

function searchThroughChain(label, side, chain, isLoop, current = false) {
  if (chain === null || chain === undefined || chain.length < 1) {
    return false;
  }
  else {
    const lg = chain.length;
    const [head, ...tail] = chain;
    const last = chain[lg-1];
    if (isLoop) {
      switch(side) {
        case "l":
          if (head[0] === label[0] && head[1] === label[1] ) {
            return last;
          }
          else {
            return searchThroughChain(label, side, tail, false, head);
          }
          break;
        case "r":
          if (last[0] === label[0] && last[1] === label[1]) {
            return head;
          }
          else {
            return searchThroughChain(label, side, chain, false);
          }
          break;
      }
    }
    else {
      switch(side) {
        case "l":
          if (head[0] === label[0] && head[1] === label[1] ) {
            return current;
          }
          else {
            return (searchThroughChain(label, side, tail, false, head));
          }
          break;
        case "r":
          if (head[0] === label[0] && head[1] === label[1]) {
            if (chain[1] === null || chain[1] === undefined) {
              return false;
            }
            else {
              return chain[1];
            }
          }
          else {
            return (searchThroughChain(label, side, tail, false));
          }
          break;
      }
    }
  }
};

// returns true if the vector is moving into the wall, false otherwise
function movingInto (vec, wallTopOrRight, wallBottomOrLeft, wallType) {
  let sign = 1;
  switch (wallType) {
    case "l": // left wall
    case "g": // ground
    case "b":
    case "d":
    case "p": // platform
      sign = -1;
      break;
    default: // right wall, ceiling, ceiling-wall hybrids
      break;
  }
  // const outwardsWallNormal = new Vec2D ( sign * (wallTopOrRight.y - wallBottomOrLeft.y), sign*( wallBottomOrLeft.x-wallTopOrRight.x )  );
  // return ( dotProd ( vec, outwardsWallNormal ) < 0 );
  return (  ( dotProd ( vec, new Vec2D ( sign * (wallTopOrRight.y - wallBottomOrLeft.y), sign*( wallBottomOrLeft.x-wallTopOrRight.x )  ) ) < 0) );
};

// returns true if point is to the right of a "left" wall, or to the left of a "right" wall,
// and false otherwise
function isOutside (point, wallTopOrRight, wallBottomOrLeft, wallType) {
  //const vec = new Vec2D ( point.x - wallBottom.x, point.y - wallBottom.y );
  //return ( !movingInto(vec, wallTop, wallBottom, wallType ) );
  return ( !movingInto(new Vec2D ( point.x - wallBottomOrLeft.x, point.y - wallBottomOrLeft.y ), wallTopOrRight, wallBottomOrLeft, wallType ) );
};

function extremePoint(wall, extreme) {
  const  v1 = wall[0];
  const  v2 = wall[1];
  switch (extreme) {
    case "u":
    case "t":
      if (v2.y < v1.y) {
        return v1;
      }
      else {
        return v2;
      }
      break;
    case "d":
    case "b":
      if (v2.y > v1.y) {
        return v1;
      }
      else {
        return v2;
      }
      break;
    case "l":
      if (v2.x > v1.x) {
        return v1;
      }
      else {
        return v2;
      }
      break;
    case "r":
      if (v2.x < v1.x) {
        return v1;
      }
      else {
        return v2;
      }
    default:
      console.log( "error in 'extremePoint': invalid parameter "+extreme+", not up/top/down/bottom/left/right");
  }
};


function lineAngle( line ) { // returns angle of line from the positive x axis, in radians, from 0 to pi
  const v1 = line[0];
  const v2 = line[1];
  const theta = Math.atan2( v2.y - v1.y, v2.x - v1.x  );
  if (theta < 0) {
    return (theta + Math.PI);
  }
  else {
    return theta;
  }
};

// say line1 passes through the two points p1 = (x1,y1), p2 = (x2,y2)
// and line2 by the two points p3 = (x3,y3) and p4 = (x4,y4)
// this function returns the parameter t, such that p3 + t*(p4-p3) is the intersection point of the two lines
// please ensure this function is not called on parallel lines
function coordinateInterceptParameter (line1, line2) {
  //const x1 = line1[0].x;
  //const x2 = line1[1].x;
  //const x3 = line2[0].x;
  //const x4 = line2[1].x;
  //const y1 = line1[0].y;
  //const y2 = line1[1].y;
  //const y3 = line2[0].y;
  //const y4 = line2[1].y;
  //const t = ( (x1-x3)*(y2-y1) + (x1-x2)*(y1-y3) ) / ( (x4-x3)*(y2-y1) + (x2-x1)*(y3-y4) );
  //return t;
  return ( (    line1[0].x-line2[0].x)*(line1[1].y-line1[0].y) 
             + (line1[0].x-line1[1].x)*(line1[0].y-line2[0].y) ) 
          / (  (line2[1].x-line2[0].x)*(line1[1].y-line1[0].y) 
             + (line1[1].x-line1[0].x)*(line2[0].y-line2[1].y) );
};

// find the intersection of two lines
// please ensure this function is not called on parallel lines
export function coordinateIntercept (line1, line2) {
  const t = coordinateInterceptParameter(line1, line2);
  return ( new Vec2D( line2[0].x + t*(line2[1].x - line2[0].x ), line2[0].y + t*(line2[1].y - line2[0].y ) ) );
};

// orthogonally projects a point onto a line
// line is given by two points it passes through
function orthogonalProjection(point, line) {
  const line0 = line[0];
  const [line0x,line0y] = [line0.x, line0.y];
  // turn everything into relative coordinates with respect to the point line[0]
  const pointVec = new Vec2D ( point.x - line0x, point.y - line0y);
  const lineVec  = new Vec2D ( line[1].x - line0x, line[1].y - line0y);
  // renormalise line vector
  const lineNorm = norm(lineVec);
  const lineElem = scalarProd( 1/lineNorm, lineVec);
  // vector projection calculation
  const factor = dotProd(pointVec, lineElem);
  const projVec = scalarProd(factor, lineElem);
  // back to absolute coordinates by adding the coordinates of line[0]
  return (new Vec2D(projVec.x + line0x,projVec.y + line0y));
};

// solves the quadratic equation a0 + a1 x + a2 x^2 = 0
// uses the sign to choose the solution
// do not call this function with parameter a2 = 0
function solveQuadraticEquation (a0, a1, a2, sign = 1) {
  const disc = a1*a1 - 4*a0*a2;
  if (disc < 0) {
    //console.log("error in function 'solveQuadraticEquation': negative discriminant");
    return false;
  }
  else {
    return ((-a1 + sign* Math.sqrt(disc)) / (2 * a2) );
  }
}

// in this function, we are considering a line that is sweeping,
// from the initial line 'line1' passing through the two points p1 = (x1,y1), p2 = (x2,y2)
// to the final line 'line2' passing through the two points p3 = (x3,y3) and p4 = (x4,y4)
// there are two sweeping parameters: 
//   't', which indicates how far along each line we are
//   's', which indicates how far we are sweeping between line1 and line2
// for instance:
//  s=0 means we are on line1,
//  s=1 means we are on line2,
//  t=0 means we are on the line between p1 and p3,
//  t=1 means we are on the line between p2 and p4
// this function returns a specific value for each of t and s,
// which correspond to when the swept line hits the origin O (at coordinates (0,0))
// if either of the parameters is not between 0 and 1, this function instead returns 'false'
// see '/doc/linesweep.png' for a visual representation of the situation
function lineSweepParameters( line1, line2, flip = false) {
  let sign = 1;
  if (flip) {
    sign = -1;
  }
  const x1 = line1[0].x;
  const x2 = line1[1].x;
  const x3 = line2[0].x;
  const x4 = line2[1].x;
  const y1 = line1[0].y;
  const y2 = line1[1].y;
  const y3 = line2[0].y;
  const y4 = line2[1].y;

  const a0 = x2*y1 - x1*y2;
  const a1 = x4*y1 - 2*x2*y1 + 2*x1*y2 - x3*y2 + x2*y3 - x1*y4;
  const a2 = x2*y1 - x4*y1 - x1*y2 + x3*y2 - x2*y3 + x4*y3 + x1*y4 - x3*y4;

  // s satisfies the equation:   a0 + a1*s + a2*s^2 = 0
  let s = -1; // initialise s

  if ( Math.abs( a0*a0*a2/(a1*a1) ) < 0.0001 ) {
    s = - a0 / a1;
  }
  else {
    s = solveQuadraticEquation( a0, a1, a2, sign );
    if (s === false) {
      return false; // non-real parameters
    }
  }
  const t = (s*(x1-x3) - x1) / ( x2-x1 + s*( x1-x2-x3+x4 ));

  if (s < 0 || s > 1 || t < 0 || t > 1 || s === Infinity || t === Infinity || isNaN(s) || isNaN(t)) {
    return false;
  }
  else {
    return [t,s];
  }
};


function edgeSweepingCheck( ecb1Same, ecb1Other, ecbpSame, ecbpOther, other, position, counterclockwise, corner, wallType) {

  // the relevant ECB edge, that might collide with the corner, is the edge between ECB points 'same' and 'other'
  let interiorECBside = "l";   
  if (counterclockwise === false) {
    interiorECBside = "r";    
  }

  if (!isOutside ( corner, ecbpSame, ecbpOther, interiorECBside) && isOutside ( corner, ecb1Same, ecb1Other, interiorECBside) ) {

    let [t,s] = [0,0];
  
    // we sweep a line,
    // starting from the relevant ECB1 edge, and ending at the relevant ECBp edge,
    // and figure out where this would intersect the corner
    
    // first we recenter everything around the corner,
    // as the 'lineSweepParameters' function calculates collision with respect to the origin
  
    const recenteredECB1Edge = [ new Vec2D( ecb1Same.x  - corner.x, ecb1Same.y  - corner.y )
                               , new Vec2D( ecb1Other.x - corner.x, ecb1Other.y - corner.y ) ];
    const recenteredECBpEdge = [ new Vec2D( ecbpSame.x  - corner.x, ecbpSame.y  - corner.y )
                               , new Vec2D( ecbpOther.x - corner.x, ecbpOther.y - corner.y ) ];
  
    // in the line sweeping, some tricky orientation checks show that a minus sign is required precisely in the counterclockwise case
    // this is what the third argument to 'lineSweepParameters' corresponds to
    const lineSweepResult = lineSweepParameters( recenteredECB1Edge, recenteredECBpEdge, counterclockwise);
    
    if (! (lineSweepResult === false) ) {
      [t,s] = lineSweepResult;
      let newPosition = false; // initialising

      let additionalPushout = additionalOffset; // additional pushout
      switch(other) {
        case 1:
        case 2:
          additionalPushout = -additionalOffset;
          break;
        default:
          break;
      }

      switch (cornerPushoutMethod) {
        case "v": // vertical pushout
          const yIntersect = coordinateIntercept( [ ecbpSame, ecbpOther ], [ corner, new Vec2D( corner.x, corner.y+1 ) ]);
          newPosition = new Vec2D( position.x , position.y + corner.y-yIntersect.y + additionalPushout);
          break;
        case "h": // horizontal pushout
        default:
          const xIntersect = coordinateIntercept( [ ecbpSame, ecbpOther ], [ corner, new Vec2D( corner.x+1, corner.y ) ]);
          newPosition = new Vec2D( position.x + corner.x - xIntersect.x + additionalPushout, position.y);
          break;
      }
      console.log("'edgeSweepingCheck': collision, relevant edge of ECB has moved across "+wallType+" corner. Sweeping parameter s="+s+".");
      return ( [false, newPosition, s] ); // s is the sweeping parameter, t just moves along the edge
            //  ^^^^ false because colliding at a corner never counts as 'touching' for the purpose of the physics
    }
    else {
      console.log("'edgeSweepingCheck': no edge collision, relevant edge of ECB does not cross "+wallType+" corner.");
      return false;
    }
  }
  else {
    console.log("'edgeSweepingCheck': no edge collision, "+wallType+" corner did not switch relevant ECB edge sides.");
    return false;
  }
};


function pushoutHorizontally ( wall, wallType, wallIndex, stage, line) {
  const wallRight = extremePoint(wall, "r");
  const wallLeft  = extremePoint(wall, "l");
  const xIntersect = coordinateIntercept(wall, line).x;
  const wallAngle = lineAngle(wall);

  if ( xIntersect > wallRight.x ) {

    let dir = "r";
    if ( ( wallAngle < Math.PI ) !== (wallType === "r") ) { // xor operation
      dir = "l";
    } 
    const nextWallRightTypeAndIndex = connectednessFromChains( [wallType, wallIndex] , dir, stage.connected);
    if (nextWallRightTypeAndIndex === false || ! (nextWallRightTypeAndIndex[0] === wallType)) {
      return wallRight.x;
    }
    else {
      if (wallType === "r") {
        const nextWallRRight = stage.wallR[ nextWallRightTypeAndIndex[1] ];
        if (extremePoint(nextWallRRight, "r").x <= wallRight.x ) {
          return wallRight.x;
        }
        else {
          return pushoutHorizontally( nextWallRRight , "r", nextWallRightTypeAndIndex[1], stage, line);
        }
      }
      else if (wallType === "l") {
        const nextWallLRight = stage.wallL[ nextWallRightTypeAndIndex[1] ];
        if (extremePoint(nextWallLRight, "r").x <= wallRight.x ) {
          return wallRight.x;
        }
        else {
          return pushoutHorizontally( nextWallLRight, "l", nextWallRightTypeAndIndex[1], stage, line);
        }
      }
      else {
        console.log("error in 'pushoutHorizontally': neither 'left' nor 'right' wall provided.");
      }
    }
  }
  else if ( xIntersect < wallLeft.x ) {
    let dir = "l";
    if ( ( wallAngle < Math.PI ) !== (wallType === "r") ) { // xor operation
      dir = "r";
    } 
    const nextWallLeftTypeAndIndex = connectednessFromChains( [wallType, wallIndex] , dir, stage.connected);
    if (nextWallLeftTypeAndIndex === false || ! (nextWallLeftTypeAndIndex[0] === wallType) ) {
      return wallLeft.x;
    }
    else {
      if (wallType === "r") {
        const nextWallRLeft = stage.wallR[ nextWallLeftTypeAndIndex[1] ];
        if (extremePoint(nextWallRLeft, "l").x >= wallLeft.x) {
          return wallLeft.x;
        }
        else {
          return pushoutHorizontally( nextWallRLeft, "r", nextWallLeftTypeAndIndex[1], stage, line);
        }
      }
      else if (wallType === "l") {
        const nextWallLLeft = stage.wallL[ nextWallLeftTypeAndIndex[1] ];
        if (extremePoint(nextWallLLeft, "l").x >= wallLeft.x ) {
          return wallLeft.x;
        }
        else {
          return pushoutHorizontally( nextWallLLeft, "l", nextWallLeftTypeAndIndex[1], stage, line);
        }
      }
      else {
        console.log("error in 'pushoutHorizontally': neither 'left' nor 'right' wall provided.");
      }
    }
  }
  else {
    return xIntersect;
  }
};



function pushoutVertically ( wall, wallType, wallIndex, stage, line) {
  const wallTop    = extremePoint(wall, "t");
  const wallBottom = extremePoint(wall, "b");
  const yIntersect = coordinateIntercept(wall, line).y;
  const wallAngle = lineAngle(wall);

  if ( yIntersect > wallTop.y ) {

    let dir = "r";
    if ( ( wallAngle < Math.PI ) !== (wallType === "c") ) { // xor operation
      dir = "l";
    } 

    const nextWallAboveTypeAndIndex = connectednessFromChains( [wallType, wallIndex] , dir, stage.connected);
    if (nextWallAboveTypeAndIndex === false || ! (nextWallAboveTypeAndIndex[0] === wallType)) {
      return wallTop.y;
    }
    else {
      if (wallType === "c") {
        const nextCeilingAbove = stage.ceiling[ nextWallAboveTypeAndIndex[1] ];
        if (extremePoint(nextCeilingAbove, "t").y <= wallTop.y ) {
          return wallTop.y;
        }
        else {
          return pushoutVertically( nextCeilingAbove , "c", nextWallAboveTypeAndIndex[1], stage, line);
        }
      }
      else if (wallType === "g") {
        const nextGroundAbove = stage.ground[ nextWallAboveTypeAndIndex[1] ];
        if (extremePoint(nextGroundAbove, "t").x <= wallTop.y ) {
          return wallTop.y;
        }
        else {
          return pushoutVertically( nextGroundAbove, "g", nextWallAboveTypeAndIndex[1], stage, line);
        }
      }
      else if (wallType === "p") {
        const nextPlatformAbove = stage.platform[ nextWallAboveTypeAndIndex[1] ];
        if (extremePoint(nextPlatformAbove, "t").x <= wallTop.y ) {
          return wallTop.y;
        }
        else {
          return pushoutVertically( nextPlatformAbove, "p", nextWallAboveTypeAndIndex[1], stage, line);
        }
      }
      else {
        console.log("error in 'pushoutVertically': surface is not one of 'ground', 'ceiling' or 'platform'.");
      }
    }
  }
  else if ( yIntersect < wallBottom.y ) {
    let dir = "l";
    if ( ( wallAngle < Math.PI ) !== (wallType === "c") ) { // xor operation
      dir = "r";
    }
    const nextWallBelowTypeAndIndex = connectednessFromChains( [wallType, wallIndex] , dir, stage.connected);
    if (nextWallBelowTypeAndIndex === false || ! (nextWallBelowTypeAndIndex[0] === wallType)) {
      return wallBottom.y;
    }
    else {
      if (wallType === "c") {
        const nextCeilingBelow = stage.ceiling[ nextWallBelowTypeAndIndex[1] ];
        if (extremePoint(nextCeilingBelow, "b").y >= wallBottom.y ) {
          return wallBottom.y;
        }
        else {
          return pushoutVertically( nextCeilingBelow , "c", nextWallBelowTypeAndIndex[1], stage, line);
        }
      }
      else if (wallType === "g") {
        const nextGroundBelow = stage.ground[ nextWallBelowTypeAndIndex[1] ];
        if (extremePoint(nextGroundBelow, "b").y >= wallBottom.y ) {
          return wallBottom.y;
        }
        else {
          return pushoutVertically( nextGroundBelow, "g", nextWallBelowTypeAndIndex[1], stage, line);
        }
      }
      else if (wallType === "p") {
        const nextPlatformBelow = stage.platform[ nextWallBelowTypeAndIndex[1] ];
        if (extremePoint(nextPlatformBelow, "b").y <= wallBottom.y ) {
          return wallBottom.y;
        }
        else {
          return pushoutVertically( nextPlatformBelow, "p", nextWallBelowTypeAndIndex[1], stage, line);
        }
      }
      else {
        console.log("error in 'pushoutVertically': surface is not one of 'ground', 'ceiling' or 'platform'.");
      }
    }
  }
  else {
    return yIntersect;
  }
};

function pointSweepingCheck ( wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, stage, xOrY, ecb1Point, ecbpPoint, position ){

  // TODO the following is here as a placeholder until the vertical pushout method gets changed
  const wallTop    = extremePoint(wall, "t");
  const wallBottom = extremePoint(wall, "b");

  const s = coordinateInterceptParameter (wall, [ecb1Point,ecbpPoint]); // need to put wall first

  if (s > 1 || s < 0 || isNaN(s) || s === Infinity) {
    console.log("'pointSweepingCheck': no collision, sweeping parameter outside of allowable range, with "+wallType+" surface.");
    return false; // no collision
  }
  else {
    const intersection = new Vec2D (ecb1Point.x + s*(ecbpPoint.x-ecb1Point.x), ecb1Point.y + s*(ecbpPoint.y-ecb1Point.y));
    if (getXOrYCoord(intersection, xOrY) > getXOrYCoord(wallTopOrRight, xOrY) || getXOrYCoord(intersection, xOrY) < getXOrYCoord(wallBottomOrLeft, xOrY)) {
      console.log("'pointSweepingCheck': no collision, intersection point outside of "+wallType+" surface.");
      return false; // no collision
    }
    else {
      let newPosition = false; // initialising

      let additionalPushout = additionalOffset; // additional pushout
      switch(wallType) {
        case "l":
        case "c":
          additionalPushout = -additionalOffset;
          break;
        default:
          break;
      }

      switch (pushoutMethodFromType(wallType)){
        case "v": // vertical pushout
          const yPushout = pushoutVertically (wall, wallType, wallIndex, stage, [ecbpPoint, new Vec2D( ecbpPoint.x , ecbpPoint.y -1) ]);
          newPosition = new Vec2D( position.x, position.y + yPushout - ecbpPoint.y + additionalPushout );
          break;
        case "h": // horizontal pushout
        default:
          const xPushout = pushoutHorizontally ( wall, wallType, wallIndex, stage, [ecbpPoint, new Vec2D( ecbpPoint.x-1, ecbpPoint.y) ]);
          newPosition = new Vec2D( position.x + xPushout - ecbpPoint.x + additionalPushout, position.y);
          break;
      }
      let touchingWall = wallType;
      if (getXOrYCoord(newPosition, xOrY) < getXOrYCoord(wallBottomOrLeft, xOrY) || getXOrYCoord(newPosition, xOrY) > getXOrYCoord(wallTopOrRight, xOrY) ) {
        touchingWall = false;
      }
      console.log("'pointSweepingCheck': collision, crossing relevant ECB point, "+wallType+" surface. Sweeping parameter s="+s+".");
      return ( [touchingWall, newPosition, s] );
    }
  }
};

// ecbp : projected ECB
// ecb1 : old ECB
// function return type: either false (no collision) or a triple [touchingWall, proposed new player position, sweeping parameter]
// touchingWall is either false, or the walltype, indicating whether the player is still touching that wall after the transformation
// the sweeping parameter s corresponds to the location of the collision, between ECB1 and ECBp
// terminology in the comments: a wall is a segment with an inside and an outside,
// which is contained in an infinite line, extending both ways, which also has an inside and an outside
function findCollision (ecbp, ecb1, position, wall, wallType, wallIndex, stage) {

  const wallTop    = extremePoint(wall, "t");
  const wallBottom = extremePoint(wall, "b");
  const wallLeft   = extremePoint(wall, "l");
  const wallRight  = extremePoint(wall, "r");

  const wallAngle = lineAngle(wall); // angle with the horizontal, between 0 and pi

  // right wall by default
  let wallTopOrRight = wallTop;
  let wallBottomOrLeft = wallBottom;
  let extremeWall = wallRight;
  let extremeSign = 1;
  let same = 3;
  let opposite = 1;
  let xOrY = 1; // y by default
  let isPlatform = false;
  let flip = false;

  let other = 0; // this will be calculated later, not in the following switch statement
  let alsoCheckTop = true; // whether to separately also check the top point for collision
                           // this is only important for left/right walls that are quite close to horizontal
  switch(wallType) {
    case "l": // left wall
      same = 1;
      opposite = 3;
      flip = true;
      extremeWall = wallLeft;
      extremeSign = -1;
      break;
    case "p": // platform
      isPlatform = true;
    case "g": // ground
    case "b":
    case "d":
      same = 0;
      opposite = 2;
      wallTopOrRight  = wallRight;
      wallBottomOrLeft = wallLeft;
      extremeWall = wallTop;
      xOrY = 0;
      flip = true;
      alsoCheckTop = false;
      break;
    case "c": // ceiling
    case "t":
    case "u":
      same = 2;
      opposite = 0;
      wallTopOrRight  = wallRight;
      wallBottomOrLeft = wallLeft;
      extremeSign = -1;
      extremeWall = wallBottom;
      xOrY = 0;
      alsoCheckTop = false;
      break;
    default: // right wall by default
      break;
  }


  // first check if player ECB was even near the wall
  if (    (ecbp[0].y > wallTop.y    && ecb1[0].y > wallTop.y   ) // player ECB stayed above the wall
       || (ecbp[2].y < wallBottom.y && ecb1[2].y < wallBottom.y) // played ECB stayed below the wall
       || (ecbp[3].x > wallRight.x  && ecb1[3].x > wallRight.x ) // player ECB stayed to the right of the wall
       || (ecbp[1].x < wallLeft.x   && ecb1[1].x < wallLeft.x  ) // player ECB stayed to the left of the wall
     ) {
    console.log("'findCollision': no collision, ECB not even near "+wallType+" surface.");
    return false;
  }
  else if (   !isOutside ( ecb1[opposite], wallTopOrRight, wallBottomOrLeft, wallType ) &&
            ( !isOutside ( ecb1[0]       , wallRight     , wallLeft        , "c"      ) && alsoCheckTop ) ) {
    console.log("'findCollision': no collision, ECB1 fully on other side of "+wallType+" surface.");
    return false;
  }
  else {

    // if the surface is a platform, and the bottom ECB point is below the platform, we shouldn't do anything
    if ( isPlatform ) {
      if ( !isOutside ( ecb1[same], wallTopOrRight, wallBottomOrLeft, wallType )) {
        console.log("'findCollision': no collision, bottom ECB1 point was below platform.");
        return false;
      }
    }

    // -------------------------------------------------------------------------------------------------------------------------------------------------------
    // now, we check whether the ECB is colliding on an edge, and not a vertex

    // first, figure out which is the relevant ECB edge that could collide at the corner
    // we know that one of the endpoints of this edge is the same-side ECB point of the wall,
    // we are left to find the other, which we'll call 'other'


    let edgeCase = false;
    let counterclockwise = true; // whether (same ECB point -> other ECB point) is counterclockwise or not
    let corner = false; // no value for now
    let closestEdgeCollision = false; // false for now

    // case 1
    if ( getXOrYCoord(ecb1[same], xOrY) > getXOrYCoord(wallTopOrRight, xOrY) ) {
      counterclockwise = !flip;
      other = turn(same, counterclockwise);
      if ( getXOrYCoord(ecbp[other], xOrY) < getXOrYCoord(wallTopOrRight, xOrY) ) { 
        edgeCase = true;
        corner = wallTopOrRight;
      }
    }

    // case 2
    else if ( getXOrYCoord(ecb1[same], xOrY) < getXOrYCoord(wallBottomOrLeft, xOrY) ) {
      counterclockwise = flip;
      other = turn(same, counterclockwise);
      if ( getXOrYCoord(ecbp[other], xOrY) > getXOrYCoord(wallBottomOrLeft, xOrY) ) { 
        edgeCase = true;
        corner = wallBottomOrLeft;
      }
    }

    let edgeSweepResult = false;
    let otherEdgeSweepResult = false;
    
    if (edgeCase) {
      // the relevant ECB edge, that might collide with the corner, is the edge between ECB points 'same' and 'other'
      let interiorECBside = "l";
      if (counterclockwise === false) {
        interiorECBside = "r";    
      }

      if (!isOutside ( corner, ecbp[same], ecbp[other], interiorECBside) && isOutside ( corner, ecb1[same], ecb1[other], interiorECBside) ) {
        edgeSweepResult = edgeSweepingCheck( ecb1[same], ecb1[other], ecbp[same], ecbp[other], other, position, counterclockwise, corner, wallType);
      }
    }

    if (alsoCheckTop) { // TODO should also check whether we are in an edge case
      let otherCounterclockwise = false; // whether ( same ECB point -> top ECB point) is counterclockwise
      let otherCorner = wallRight;
      if (wallType === "l") {
        otherCounterclockwise = true;
        otherCorner = wallLeft;
      }

      let otherInteriorECBside = "l";
      if (otherCounterclockwise === false) {
        otherInteriorECBside = "r";
      }

      if ( !isOutside(corner, ecbp[same], ecbp[2], otherInteriorECBside) && isOutside ( corner, ecb1[same], ecb1[2], otherInteriorECBside) ) {
        otherEdgeSweepResult = edgeSweepingCheck( ecb1[same], ecb1[2], ecbp[same], ecbp[2], 2, position, otherCounterclockwise, otherCorner, wallType);
      }
    }

    // if only one of the two ECB edges (same-other / same-top) collided, take that one
    if (edgeSweepResult === false) {
      if (! ( otherEdgeSweepResult === false ) ) {
        closestEdgeCollision = otherEdgeSweepResult;
      }
    }
    else if (otherEdgeSweepResult === false) {
      if (! (edgeSweepResult === false)) {
        closestEdgeCollision = edgeSweepResult;
      }
    }
    // otherwise choose the collision with smallest sweeping parameter
    else if ( otherEdgeSweepResult[2] > edgeSweepResult[2] ) {
      closestEdgeCollision = edgeSweepResult;
    }
    else {
      closestEdgeCollision = otherEdgeSweepResult;
    }
    

    // end of edge case checking
    // -------------------------------------------------------------------------------------------------------------------------------------------------------

    let sameCrossing = false;
    let topCrossing = false;
    let closestPointCollision = false;

    let yOrX = 0;
    if (xOrY === 0) {
      yOrX = 1;
    }
        
    if (  isOutside ( ecb1[same], wallTopOrRight, wallBottomOrLeft, wallType ) && 
         !isOutside ( ecbp[same], wallTopOrRight, wallBottomOrLeft, wallType ) &&
         !( extremeSign * getXOrYCoord(ecbp[same], yOrX) > extremeSign * getXOrYCoord(extremeWall, yOrX) )) { 
        // third conjunct checks whether the surface can actually push the point out at all or not
      sameCrossing = true;
    }
    else if (alsoCheckTop){ 
      if (  isOutside ( ecb1[2], wallRight, wallLeft, "c" ) && 
           !isOutside ( ecbp[2], wallRight, wallLeft, "c" ) &&
           !( extremeSign * ecbp[2].x > extremeSign * extremeWall.x) ) {
          // ditto
        topCrossing = true;
      }
    }
          
    let samePointSweepResult = false;
    let topPointSweepResult = false;
    // sweeping checks
    if (sameCrossing === true ) {
      samePointSweepResult = pointSweepingCheck ( wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, stage
                                                , xOrY, ecb1[same], ecbp[same], position );
    }
    if (topCrossing === true ) {
      topPointSweepResult = pointSweepingCheck ( wall, wallType, wallIndex, wallRight, wallLeft, stage
                                               , 0, ecb1[2], ecbp[2], position );
    }

    // if only one of the two ECB points (same/top) collided, take that one
    if (samePointSweepResult === false) {
      closestPointCollision =  topPointSweepResult;
    }
    else if (topPointSweepResult === false) {
      closestPointCollision = samePointSweepResult;
    }
    // otherwise choose the collision with smallest sweeping parameter
    else if ( topPointSweepResult[2] > samePointSweepResult[2] ) {
      closestPointCollision = samePointSweepResult;
    }
    else {
      closestPointCollision = topPointSweepResult;
    }
    
  
    let [finalCollision, finalCollisionType] = [false,false];

    // if we have only one collision type (point/edge), take that one
    if (closestEdgeCollision === false ) {
      finalCollision = closestPointCollision;
      finalCollisionType = "point";
    }
    else if (closestPointCollision === false) {
      finalCollision = closestEdgeCollision;
      finalCollisionType = "edge";
    }
    // otherwise choose the collision with smallest sweeping parameter
    else if (closestEdgeCollision[2] > closestPointCollision[2]) {
      finalCollision = closestPointCollision;
      finalCollisionType = "point";
    }
    else {
      finalCollision = closestEdgeCollision;
      finalCollisionType = "edge";
    }

    if (finalCollision === false) {
      console.log("'findCollision': sweeping determined no collision with surface of type "+wallType+".");
    }
    else {
      console.log("'findCollision': "+finalCollisionType+" collision with surface of type "+wallType+" and sweeping parameter s="+finalCollision[2]+".");
    }
    return finalCollision;

  }
};


// this function loops over all walls/surfaces it is provided, calculating the collision offsets that each ask for,
// and at each iteration returning the smallest possible offset (i.e. collision with smallest sweeping parameter)
// a 'wallAndThenWallTypeAndIndex' is of the form '[wall, [wallType, index]]'
// where "index" is the index of the wall in the list of walls of that type in the stage
// this function returns a 'maybeCenterAndTouchingType'
// which is one of the following three options: 
//          option 1: 'false'                              (no collision) 
//          option 2: '[newPosition, false, s]'            (collision, but no longer touching) 
//          option 3: '[newPosition, wallTypeAndIndex, s]' (collision, still touching wall with given type and index)
// s is the sweeping parameter
function loopOverWalls( ecbp, ecb1, position, wallAndThenWallTypeAndIndexs, oldMaybeCenterAndTouchingType, stage, passNumber ) {
  console.log("'loopOverWalls' pass number "+passNumber+".");
  let newCollisionHappened = false;
  const suggestedMaybeCenterAndTouchingTypes = [false]; // initialise list of new collisions
  if (passNumber > maximumCollisionDetectionPasses) {
    //console.log('collision detection giving up, cannot resolve collisions');
    return oldMaybeCenterAndTouchingType;
  }
  else { 
    const collisionData = wallAndThenWallTypeAndIndexs.map( 
                                             // [  [ touchingWall, position, s ]  , touchingType ]
              (wallAndThenWallTypeAndIndex)  => [ findCollision (ecbp, ecb1, position, wallAndThenWallTypeAndIndex[0]
                                                                , wallAndThenWallTypeAndIndex[1][0], wallAndThenWallTypeAndIndex[1][1]
                                                                , stage )
                                                , wallAndThenWallTypeAndIndex[1] ]);
    for (let i = 0; i < collisionData.length; i++) {
      if (collisionData[i][0] === false) { // option 1: no collision
      }
      else if (collisionData[i][0][0] === false) { // option 2: collision, but no longer touching
        newCollisionHappened = true;
        suggestedMaybeCenterAndTouchingTypes.push( [collisionData[i][0][1], false, collisionData[i][0][2] ] );
      }
      else { // option 3: collision, still touching wall with given type and index)
        newCollisionHappened = true;
        suggestedMaybeCenterAndTouchingTypes.push( [collisionData[i][0][1], collisionData[i][1], collisionData[i][0][2] ]);
      }
    }
    if (newCollisionHappened) {
      const newMaybeCenterAndTouchingType = closestCenterAndTouchingType(suggestedMaybeCenterAndTouchingTypes);
      const vec = new Vec2D( newMaybeCenterAndTouchingType[0].x - position.x, newMaybeCenterAndTouchingType[0].y - position.y);
      const newecbp = moveECB (ecbp, vec);
      return (loopOverWalls ( newecbp, ecb1, newMaybeCenterAndTouchingType[0]
                            , wallAndThenWallTypeAndIndexs
                            , newMaybeCenterAndTouchingType 
                            , stage
                            , passNumber+1 
                            ) );
    }
    else {
      return oldMaybeCenterAndTouchingType;
    }
  }
};

// finds the maybeCenterAndTouchingType collision with smallest sweeping parameter
// recall that a 'maybeCenterAndTouchingType' is given by one of the following three options: 
//          option 1: 'false'                              (no collision) 
//          option 2: '[newPosition, false, s]             (collision, but no longer touching) 
//          option 3: '[newPosition, wallTypeAndIndex, s]' (collision, still touching wall with given type and index)
// s is the sweeping parameter
function closestCenterAndTouchingType(maybeCenterAndTouchingTypes) {
  let newMaybeCenterAndTouchingType = false;
  let start = -1;
  const l = maybeCenterAndTouchingTypes.length;

  // start by looking for the first possible new position
  for (let i = 0; i < l; i++) {
    if (maybeCenterAndTouchingTypes[i] === false ) {
      // option 1: do nothing
    }
    else {
      // options 2 or 3: we have found a possible new position
      newMaybeCenterAndTouchingType = maybeCenterAndTouchingTypes[i];
      start = i+1;
      break;
    }
  }
  if ( newMaybeCenterAndTouchingType === false || start > l) {
    // no possible new positions were found in the previous loop
    return false;
  }
  else {
    // options 2 or 3: possible new positions, choose the one with smallest sweeping parameter
    for (let j = start; j < l; j++) {
      if (maybeCenterAndTouchingTypes[j] === false ) {
        // option 1: no new position proposed
        // do nothing
      }
      // otherwise, compare sweeping parameters
      else if (maybeCenterAndTouchingTypes[j][2] < newMaybeCenterAndTouchingType[2]) {
        // next proposed position has smaller sweeping parameter, so use it instead
        newMaybeCenterAndTouchingType = maybeCenterAndTouchingTypes[j];
      }
      else {
        // discard the next proposed position
      }
    }
    return newMaybeCenterAndTouchingType;
  }
};


function moveECB (ecb, vec) {
  return ( [ new Vec2D (ecb[0].x+vec.x,ecb[0].y+vec.y)
           , new Vec2D (ecb[1].x+vec.x,ecb[1].y+vec.y)
           , new Vec2D (ecb[2].x+vec.x,ecb[2].y+vec.y)
           , new Vec2D (ecb[3].x+vec.x,ecb[3].y+vec.y) ] );
};

export function squashDownECB (ecb, factor) {
  return ( [ ecb[0]
           , new Vec2D ( factor * (ecb[1].x-ecb[0].x) + ecb[0].x , factor * (ecb[1].y-ecb[0].y) + ecb[0].y )
           , new Vec2D ( ecb[2].x                                , factor * (ecb[2].y-ecb[0].y) + ecb[0].y )
           , new Vec2D ( factor * (ecb[3].x-ecb[0].x) + ecb[0].x , factor * (ecb[3].y-ecb[0].y) + ecb[0].y ) ] );
};

// finds the smallest value t of the list with t > min, t <= max
// returns false if none are found
function findSmallestWithin(list, min, max, smallestSoFar = false) {
  if (list === null || list === undefined || list.length < 1) {
    return smallestSoFar;
  }
  else {
    const [head, ...tail] = list;
    if (head === false) {
      return findSmallestWithin(tail, min, max, smallestSoFar);
    }
    else if (head > min && head <= max) {
      if (smallestSoFar === false) {
        return findSmallestWithin(tail, min, max, head);
      }
      else if (head > smallestSoFar) {
        return findSmallestWithin(tail, min, max, smallestSoFar);
      }
      else {
        return findSmallestWithin(tail, min, max, head);
      }
    }
    else {
      return findSmallestWithin(tail, min, max, smallestSoFar);
    }
  }
};


export function groundedECBSquashFactor( ecb, ceilings ) {
  const ceilingYValues = ceilings.map ( (ceil) => {
    if (ecb[0].x < ceil[0].x || ecb[0].x > ceil[1].x) {
      return false;
    } 
    else {
      return coordinateIntercept( [ ecb[0], ecb[2] ] , ceil).y;
    }
  } );
  const lowestCeilingYValue = findSmallestWithin(ceilingYValues, ecb[0].y, ecb[2].y);
  if (lowestCeilingYValue === false) {
    return false;
  }
  else {
    return ( (lowestCeilingYValue - ecb[0].y) / (ecb[2].y - ecb[0].y) );
  }
};

export function getNewMaybeCenterAndTouchingType(ecbp, ecb1, position, wallAndThenWallTypeAndIndexs, stage) {
  // start at loop number 1, with no collisions given
  return loopOverWalls(ecbp, ecb1, position, wallAndThenWallTypeAndIndexs, false, stage, 1 );
};
