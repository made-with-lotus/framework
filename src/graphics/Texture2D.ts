export class Texture2D {
    public readonly texture: WebGLTexture;

    constructor(
        private readonly _gl: WebGLRenderingContext,
        public readonly width: number,
        public readonly height: number,
        public readonly data: Uint8ClampedArray,
    ) {
        if (data.length !== width * height * 4) {
            throw new Error(`Expected data length to be ${width * height * 4}, but got ${data.length}`);
        }

        const texture = this._gl.createTexture();
        if (!texture) {
            throw new Error("Failed to create texture");
        }
        this.texture = texture;
        this.bind();
        this._gl.texImage2D(
            this._gl.TEXTURE_2D,
            0,
            this._gl.RGBA,
            width,
            height,
            0,
            this._gl.RGBA,
            this._gl.UNSIGNED_BYTE,
            data,
        );

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
    }

    public static async fromImage(gl: WebGLRenderingContext, image: HTMLImageElement): Promise<Texture2D> {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not create canvas context");
        }
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, image.width, image.height);
        return new Texture2D(gl, image.width, image.height, imageData.data);
    }

    public static async fromUrl(gl: WebGLRenderingContext, url: string): Promise<Texture2D> {
        const image = new Image();
        image.src = url;
        await image.decode();
        return Texture2D.fromImage(gl, image);
    }

    public bind(): void {
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this.texture);
    }
}