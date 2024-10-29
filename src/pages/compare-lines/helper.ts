const areIdenticalLines3D = (
    p1: [number, number, number],
    d1: [number, number, number],
    p2: [number, number, number],
    d2: [number, number, number],
    epsilon = 1e-10
): boolean => {
    const [x1, y1, z1] = d1;
    const [x2, y2, z2] = d2;

    const crossProduct = [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];

    const areDirectionVectorsParallel =
        Math.abs(crossProduct[0]) < epsilon &&
        Math.abs(crossProduct[1]) < epsilon &&
        Math.abs(crossProduct[2]) < epsilon;

    if (!areDirectionVectorsParallel) {
        return false;
    }

    const difference = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

    const crossProductWithDifference = [
        difference[1] * d1[2] - difference[2] * d1[1],
        difference[2] * d1[0] - difference[0] * d1[2],
        difference[0] * d1[1] - difference[1] * d1[0]
    ];

    return (
        Math.abs(crossProductWithDifference[0]) < epsilon &&
        Math.abs(crossProductWithDifference[1]) < epsilon &&
        Math.abs(crossProductWithDifference[2]) < epsilon
    );
};
export default areIdenticalLines3D;
