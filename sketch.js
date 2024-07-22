let wiggleShader;

let vertSrc = `
precision highp float;

attribute vec3 aPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vVertexColor;

uniform float time;
uniform float amplitude;

void main() {
  vec3 position = aPosition;

  // Add an offset per vertex to create a wave effect.
  position.y += amplitude * sin(time * 0.005 + position.x * 0.05);

  // Apply the transformations that have been set in p5
  vec4 viewModelPosition = uModelViewMatrix * vec4(position, 1.0);

  // Tell WebGL where the vertex should be drawn
  gl_Position = uProjectionMatrix * viewModelPosition;  

  // Pass along the color of the vertex to the fragment shader
  vVertexColor = aVertexColor;
}
`;

let fragSrc = `
precision highp float;

// Receive the vertex color from the vertex shader
varying vec4 vVertexColor;

void main() {
  // Color the pixel with the vertex color
  gl_FragColor = vVertexColor;
}
`;

let ribbon;
let amplitude = 100.0; // Adjust this value to modify the height of the wave

function setup() {
    // Create canvas
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.position(0, 0);
    canvas.style('z-index', '-1'); // Ensure canvas is behind other elements
    canvas.id('animationCanvas');

    wiggleShader = createShader(vertSrc, fragSrc);

    let startColor = color('#BCD979');
    let endColor = color('#9DAD6F');
    ribbon = buildGeometry(() => {
        noStroke();

        // Draw a ribbon of vertices
        beginShape(TRIANGLE_STRIP);
        let numPoints = 10;
        let waveWidth = width / 1; // Adjust this value to modify the width of the wave
        for (let currentPoint = 0; currentPoint < numPoints; currentPoint++) {
            let x = map(currentPoint, 0, numPoints - 1, -waveWidth, waveWidth);
            let y = 0;

            // Change color from red to blue along the ribbon
            fill(lerpColor(startColor, endColor, currentPoint / (numPoints - 1)));
            for (let z of [-200, 500]) {
                vertex(x, y, z);
            }
        }
        endShape();
    });

    describe('A wave-like ribbon that moves up and down over time');
}

function draw() {
    background(lerpColor(color('#BCD979'),color('#9DAD6F'), 1));

    noStroke();

    // Use the vertex shader we made. Try commenting out this line to see what
    // the ribbon looks like when we don't move it with the shader!
    shader(wiggleShader);

    // Pass the shader the current time so it can animate.
    wiggleShader.setUniform('time', millis());
    wiggleShader.setUniform('amplitude', amplitude); // Pass the amplitude to the shader

    // Draw the ribbon. The shader will distort and animate it.
    model(ribbon);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
