import { ShaderType } from "src/graphics/ShaderType";
import { Matrix3Array, Matrix4Array, Vertex2Array, Vertex3Array, Vertex4Array } from "src/math/types";

export class ShaderProgram {
    private readonly _program: WebGLProgram;
    private readonly _attributeLocations = new Map<string, number>();
    private readonly _uniformLocations = new Map<string, WebGLUniformLocation>();

    constructor(
        private readonly _gl: WebGLRenderingContext,
        vertexShaderSource: string,
        fragmentShaderSource: string,
    ) {
        const vertexShader = this._createShader(vertexShaderSource, ShaderType.VERTEX);
        const fragmentShader = this._createShader(fragmentShaderSource, ShaderType.FRAGMENT);
        const program = this._gl.createProgram();
        if (!program) {
            throw new Error("Failed to create program");
        }
        this._gl.attachShader(program, vertexShader);
        this._gl.attachShader(program, fragmentShader);
        this._gl.linkProgram(program);
        if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
            throw new Error(`Failed to link program: ${this._gl.getProgramInfoLog(program)}`);
        }
        this._program = program;
        this._detectAttributes();
        this._detectUniforms();
        this._gl.deleteShader(vertexShader);
        this._gl.deleteShader(fragmentShader);
    }

    public use(): void {
        this._gl.useProgram(this._program);
    }

    public getAttributeLocation(name: string): number {
        const location = this._attributeLocations.get(name);
        if (location === undefined) {
            throw new Error(`Attribute not found: ${name}`);
        }
        return location;
    }

    public setFloat(name: string, value: number): void {
        this._gl.uniform1f(this.getUniformLocation(name), value);
    }

    public setInteger(name: string, value: number): void {
        if (!Number.isInteger(value)) {
            throw new Error(`Value is not an integer: ${value}`);
        }
        this._gl.uniform1i(this.getUniformLocation(name), value);
    }

    public setVector2(name: string, value: Vertex2Array): void {
        this._gl.uniform2fv(this.getUniformLocation(name), value);
    }

    public setVector3(name: string, value: Vertex3Array): void {
        this._gl.uniform3fv(this.getUniformLocation(name), value);
    }

    public setVector4(name: string, value: Vertex4Array): void {
        this._gl.uniform4fv(this.getUniformLocation(name), value);
    }

    public setMatrix3(name: string, value: Matrix3Array): void {
        this._gl.uniformMatrix3fv(this.getUniformLocation(name), false, value);
    }

    public setMatrix4(name: string, value: Matrix4Array): void {
        this._gl.uniformMatrix4fv(this.getUniformLocation(name), false, value);
    }

    public getUniformLocation(name: string): WebGLUniformLocation {
        const location = this._uniformLocations.get(name);
        if (!location) {
            throw new Error(`Uniform not found: ${name}`);
        }
        return location;
    }

    private _createShader(source: string, type: ShaderType): WebGLShader {
        const shader = this._gl.createShader(type);
        if (!shader) {
            throw new Error("Failed to create shader");
        }
        this._gl.shaderSource(shader, source);
        this._gl.compileShader(shader);
        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            throw new Error(`Failed to compile shader: ${this._gl.getShaderInfoLog(shader)}`);
        }
        return shader;
    }

    private _detectAttributes(): void {
        const attributeCount = this._gl.getProgramParameter(this._program, this._gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attributeCount; i++) {
            const attributeInfo = this._gl.getActiveAttrib(this._program, i);
            if (!attributeInfo) {
                throw new Error("Failed to get attribute info");
            }
            const location = this._gl.getAttribLocation(this._program, attributeInfo.name);
            if (location === -1) {
                throw new Error(`Failed to get attribute location: ${attributeInfo.name}`);
            }
            this._attributeLocations.set(attributeInfo.name, location);
        }
    }

    private _detectUniforms(): void {
        const uniformCount = this._gl.getProgramParameter(this._program, this._gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformInfo = this._gl.getActiveUniform(this._program, i);
            if (!uniformInfo) {
                throw new Error("Failed to get uniform info");
            }
            const location = this._gl.getUniformLocation(this._program, uniformInfo.name);
            if (!location) {
                throw new Error(`Failed to get uniform location: ${uniformInfo.name}`);
            }
            this._uniformLocations.set(uniformInfo.name, location);
        }
    }
}
