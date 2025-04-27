class Cube {
    constructor() {
        this.type = 'cube';
    }

    drawCube(matrix, color) {
        var rgba = color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

        // Each face is made up of two triangles

        // Front face
        drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

        // Right face
        drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);
        drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 0, 1]);

        // Back face
        drawTriangle3D([1, 0, 1, 1, 1, 1, 0, 1, 1]);
        drawTriangle3D([1, 0, 1, 0, 1, 1, 0, 0, 1]);

        // Left face
        drawTriangle3D([0, 0, 1, 0, 1, 1, 0, 1, 0]);
        drawTriangle3D([0, 0, 1, 0, 1, 0, 0, 0, 0]);

        // Top face
        drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
        drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);

        // Bottom face
        drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);
        drawTriangle3D([0, 0, 0, 1, 0, 1, 0, 0, 1]);
    }
}
