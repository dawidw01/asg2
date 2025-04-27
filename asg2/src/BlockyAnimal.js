// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
}`;


// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}`;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // prevent lag and improve performance
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  gl.enable(gl.DEPTH_TEST);

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Global Variables related to UI
let g_globalAngle = 0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_isMouseDown = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

let BASE_YELLOW_ANGLE = 45;

// arms animation
let g_upperArmAngle = 45;
let g_lowerArmAngle = 0;
let g_upperArmAnimation = false;
let g_lowerArmAnimation = false;

// global animation
let g_headAnimation = 0;
let g_leftLegAnimation = 0;
let g_rightLegAnimation = 0;
let g_leftFootAnimation = 0;
let g_rightFootAnimation = 0;
let g_globalAnimation = true;

// poke animation
let g_pokeAnimation = false;
let g_jumpHeight = 0;

// setup actions for HTML UI elements
function addActionsForHtmlUI() {

  // upper arm animation
  document.getElementById('animationUpperArmOffButton').onclick = function () { g_upperArmAnimation = false; };
  document.getElementById('animationUpperArmOnButton').onclick = function () { g_upperArmAnimation = true; };

  // lower arm animation
  document.getElementById('animationLowerArmOffButton').onclick = function () { g_lowerArmAnimation = false; };
  document.getElementById('animationLowerArmOnButton').onclick = function () { g_lowerArmAnimation = true; };

  // global animation
  document.getElementById('animationGlobalOnButton').onclick = function () { g_globalAnimation = true; };
  document.getElementById('animationGlobalOffButton').onclick = function () { g_globalAnimation = false; };

  // Size Slider Events
  document.getElementById('upperArmSlide').addEventListener('mousemove', function () { g_upperArmAngle = this.value; renderScene(); });
  document.getElementById('lowerArmSlide').addEventListener('mousemove', function () { g_lowerArmAngle = this.value; renderScene(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; g_globalAngleY = 0; renderScene(); });
}


function main() {

  // setup canvas and gl variables
  setupWebGL();

  // setup gsl shader programs and connect variables
  connectVariablesToGSL();

  // setup actions for HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = mousedown;

  canvas.onmousemove = mousemove;

  canvas.onmouseup = mouseup;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // renderScene();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {

  // Print some debug information so we know we are running
  g_seconds = performance.now() / 1000.0 - g_startTime;

  // update animation angles
  updateAnimationAngles();

  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function mousedown(ev) {
  if (ev.shiftKey) {
    g_pokeAnimation = g_pokeAnimation ? false : true;
    if (g_pokeAnimation) {
      document.getElementById('pokeText').style.display = 'block';;
    }
    else {
      document.getElementById('pokeText').style.display = 'none';
    }
  }

  g_isMouseDown = true;
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;
}

function mouseup(ev) {
  g_isMouseDown = false;
}

function mousemove(ev) {
  if (g_isMouseDown) {
    let deltaX = ev.clientX - g_lastMouseX;
    let deltaY = ev.clientY - g_lastMouseY;

    g_globalAngleY += deltaX * 0.5; // horizontal rotation
    g_globalAngleX += deltaY * 0.5; // vertical tilt

    // Clamp vertical rotation to avoid flipping over
    if (g_globalAngleX > 90) g_globalAngleX = 90;
    if (g_globalAngleX < -90) g_globalAngleX = -90;

    // Keep horizontal rotation within 0–360 degrees (optional, for neatness)
    g_globalAngleY = (g_globalAngleY + 360) % 360;

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    renderScene(); // update scene immediately
  }
}

function updateAnimationAngles() {
  if (g_pokeAnimation) {
    // Poke animation crazy movement
    g_upperArmAngle = BASE_YELLOW_ANGLE + 80 * Math.sin(g_seconds * 10);
    g_lowerArmAngle = 30 * Math.sin(g_seconds * 12);
    g_headAnimation = 20 * Math.sin(g_seconds * 8);
    g_leftLegAnimation = 30 * Math.sin(g_seconds * 6);
    g_rightLegAnimation = -30 * Math.sin(g_seconds * 6);
    g_leftFootAnimation = 15 * Math.sin(g_seconds * 7);
    g_rightFootAnimation = -15 * Math.sin(g_seconds * 7);

    // jump height
    g_jumpHeight = 0.2 * Math.abs(Math.sin(g_seconds * 10)); // Nice bouncing
  }
  // simple animation
  else {
    if (g_upperArmAnimation) {
      g_upperArmAngle = (45 * Math.sin(g_seconds)) + BASE_YELLOW_ANGLE;
    }
    if (g_lowerArmAnimation) {
      g_lowerArmAngle = (-10 * Math.sin(3 * g_seconds));
    }

    if (g_globalAnimation) {
      g_headAnimation = 10 * Math.sin(g_seconds * 2);
      g_leftLegAnimation = 20 * Math.sin(g_seconds);
      g_rightLegAnimation = -20 * Math.sin(g_seconds);
      g_leftFootAnimation = 10 * Math.sin(g_seconds * 1.5);
      g_rightFootAnimation = -10 * Math.sin(g_seconds * 1.5);
    }
    else {
      g_headAnimation = 0;
      g_leftLegAnimation = 0;
      g_rightLegAnimation = 0;
      g_leftFootAnimation = 0;
      g_rightFootAnimation = 0;
    }
    // No jumping during normal animation
    g_jumpHeight = 0;
  }
}

function renderScene() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngle + g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var M = new Matrix4();

  // Apply jump upwards
  M.translate(0, g_jumpHeight, 0);

  // Chest Body
  var body = new Cube();
  M.translate(-0.15, -0.1, 0.4);
  M.rotate(-30, 1, 0, 0);
  M.scale(0.4, 0.4, 0.2);
  body.drawCube(M, [0.77, 0.38, 0.06, 1.0]); // Orangish Brown

  var bodyMatrix = new Matrix4(M); // Save body transform


  // Head
  var head = new Pentagon();
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, 1.0, 0); // Move to top of chest
  M.rotate(g_headAnimation, 1, 0, 1);
  M.scale(0.5, 0.5, 0.5); // Smaller head
  head.drawPentagon(M, [1.0, 0.3, 0.0, 1.0]);

  //Left arm
  var leftArmUpper = new Cube();
  M = new Matrix4(bodyMatrix);
  M.translate(-0.25, 0.5, 0.0); // Move to left shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var leftArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  leftArmUpper.drawCube(M, [0.63, 0.29, 0.01, 1.0]); // Deep Orange

  var leftArmLower = new Cube();
  M = new Matrix4(leftArmUpperMatrix);
  M.translate(0.0, -0.7, 0.0); // Move to elbow
  M.rotate(-g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var leftArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  leftArmLower.drawCube(M, [0.63, 0.29, 0.01, 1.0]); // Deep Orange

  var leftHand = new Cube();
  M = new Matrix4(leftArmLowerMatrix);
  M.translate(0.0, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  leftHand.drawCube(M, [0.36, 0.25, 0.20, 1.0]); // Dark Brown

  // right Arm
  var rightArmUpper = new Cube();
  M = new Matrix4(bodyMatrix);
  M.translate(1.1, 0.5, 0.0); // Move to right shoulder
  M.rotate(g_upperArmAngle, 1, 0, 0); // Rotate at shoulder
  var rightArmUpperMatrix = new Matrix4(M);
  M.scale(0.15, 0.9, 0.5); // Upper arm size
  rightArmUpper.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  var rightArmLower = new Cube();
  M = new Matrix4(rightArmUpperMatrix);
  M.translate(0.03, -0.7, 0.0); // Move to elbow
  M.rotate(g_lowerArmAngle, 1, 0, 0); // Rotate at elbow
  var rightArmLowerMatrix = new Matrix4(M);
  M.scale(0.12, 0.6, 0.4); // Lower arm size
  rightArmLower.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  var rightHand = new Cube();
  M = new Matrix4(rightArmLowerMatrix);
  M.translate(0.02, -0.15, 0.0); // Move to wrist
  M.scale(0.1, 0.1, 0.3); // Hand size
  rightHand.drawCube(M, [0.36, 0.25, 0.20, 1.0]);

  //left leg
  var leftLegUpper = new Cube();
  M = new Matrix4(bodyMatrix);
  M.translate(0.25, -0.4, 0); // Move to left hip
  M.rotate(g_leftLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  leftLegUpper.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  var leftFoot = new Cube();
  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_leftFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  leftFoot.drawCube(M, [0.36, 0.25, 0.20, 1.0]);

  //right leg
  var rightLegUpper = new Cube();
  M = new Matrix4(bodyMatrix);
  M.translate(0.6, -0.4, 0.0); // Move to right hip
  M.rotate(g_rightLegAnimation, 1, 0, 0);
  M.scale(0.15, 0.3, 0.15); // Upper leg size
  rightLegUpper.drawCube(M, [0.63, 0.29, 0.01, 1.0]);

  var rightFoot = new Cube();
  M.translate(0.0, -0.4, -1); // Move to foot
  M.rotate(g_rightFootAnimation, 1, 0, 0);
  M.scale(1.0, 0.3, 1.5); // Foot size
  rightFoot.drawCube(M, [0.36, 0.25, 0.20, 1.0]);

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}