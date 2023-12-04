attribute vec2 a_coordinates;
attribute vec2 a_textureCoordinates;
uniform mat3 u_matrix;
uniform mat3 u_projectionMatrix;
varying vec2 v_textureCoordinates;
void main() {
    gl_Position = vec4((u_projectionMatrix * u_matrix * vec3(a_coordinates, 0)).xy, 0.0, 1.0);
    v_textureCoordinates = a_textureCoordinates;
}