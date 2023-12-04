import { ShaderProgram } from "src/graphics/ShaderProgram";
import { Texture2D } from "src/graphics/Texture2D";

const canvasElement = document.createElement("canvas");

canvasElement.style.margin = "0";
canvasElement.style.padding = "0";
canvasElement.style.display = "block";
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
document.querySelector("body")?.append(canvasElement);

const gl = canvasElement.getContext("webgl");

if (!gl) {
    throw new Error("WebGL not supported");
}

window.addEventListener("resize", () => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);
});


(async () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const texture = await Texture2D.fromUrl(gl, "cubetexture.png");
    const vertShaderSource = await fetch("./shaders/basic.vert.glsl").then((value) => value.text());
    const fragShaderSource = await fetch("./shaders/basic.frag.glsl").then((value) => value.text());

    const shaderProgram = new ShaderProgram(gl, vertShaderSource, fragShaderSource);
    shaderProgram.use();

    const coordinatesAttributeLocation = shaderProgram.getAttributeLocation("a_coordinates");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-50, -50, 50, -50, -50, 50, -50, 50, 50, -50, 50, 50];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(coordinatesAttributeLocation);
    gl.vertexAttribPointer(coordinatesAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordAttributeLocation = shaderProgram.getAttributeLocation("a_textureCoordinates");
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    // const textureCoordinates = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
    const textureCoordinates = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1 ,0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing

    shaderProgram.setMatrix3("u_matrix", [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    shaderProgram.setMatrix3("u_projectionMatrix", [2 / gl.canvas.width, 0, 0, 0, -2 / gl.canvas.height, 0, -1, 1, 1]);
    texture.bind();
    shaderProgram.setInteger("u_texture", 0);

    window.requestAnimationFrame(update);
})();

function update() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(update);
}

// function tMat3(x: number, y: number): number[] {
//     return [1, 0, 0, 0, 1, 0, x, y, 1];
// }

// function rMat3(angle: number): number[] {
//     const c = Math.cos(angle);
//     const s = Math.sin(angle);
//     return [c, -s, 0, s, c, 0, 0, 0, 1];
// }

// function sMat3(x: number, y: number): number[] {
//     return [x, 0, 0, 0, y, 0, 0, 0, 1];
// }
