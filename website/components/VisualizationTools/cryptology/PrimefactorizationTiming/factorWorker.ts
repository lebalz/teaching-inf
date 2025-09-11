self.onmessage = function (e: MessageEvent<{ n: string }>) {
    const prod = BigInt(e.data.n);
    const t0 = performance.now();
    let n = 2n;
    const factors: string[] = [];
    while (n < prod) {
        const r = prod / n;
        if (prod % n === 0n) {
            factors.push(n.toString());
            factors.push(r.toString());
            break;
        }
        if (n === 2n) {
            n++;
        } else {
            n += 2n;
        }
    }
    const elapsed = performance.now() - t0;

    postMessage({ factors, elapsed });
};
