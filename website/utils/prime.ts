const isPrime = (number: bigint): boolean => {
    if (number <= 3n) {
        return number > 1n;
    }

    if (number % 2n === 0n || number % 3n === 0n) {
        return false;
    }

    let boundary = sqrtBigInt(number);

    for (let idx = 5n; idx <= boundary; idx += 6n) {
        if (number % idx === 0n || number % (idx + 2n) === 0n) {
            return false;
        }
    }
    return true;
};

// Integer sqrt for bigint
const sqrtBigInt = (value: bigint): bigint => {
    if (value < 0n) throw new Error('sqrt only works on non-negative inputs');
    if (value < 2n) return value;
    let small = 0n,
        big = value,
        mid;
    while (small < big) {
        mid = (small + big) >> 1n;
        if (mid * mid > value) {
            big = mid;
        } else {
            small = mid + 1n;
        }
    }
    return small - 1n;
};

// Returns a random bigint in [min, max] inclusive
const randomBigInt = (min: bigint, max: bigint): bigint => {
    const range = max - min + 1n;
    let rnd = 0n;
    let bytes = (range.toString(2).length + 7) >> 3; // ceil(bits/8)
    let arr = new Uint8Array(bytes);
    let maxValue = (1n << BigInt(bytes * 8)) - 1n;

    do {
        crypto.getRandomValues(arr);
        rnd = BigInt('0x' + Array.from(arr, (x) => x.toString(16).padStart(2, '0')).join(''));
    } while (rnd > maxValue - (maxValue % range));
    return min + (rnd % range);
};

const randomPrime = (minInput: bigint, maxInput?: bigint): bigint | null => {
    let min = BigInt(minInput);
    let max = maxInput !== undefined ? BigInt(maxInput) : min;
    if (min > max) [min, max] = [max, min];

    const range = max - min + 1n;
    if (range <= 0n) return null;

    const randomNumber = randomBigInt(min, max);

    if (isPrime(randomNumber)) return randomNumber;

    let i = randomNumber - 1n;
    let j = randomNumber + 1n;
    while (i >= min && j <= max) {
        if (isPrime(i)) return i;
        if (isPrime(j)) return j;
        i -= 1n;
        j += 1n;
    }
    while (i >= min) {
        if (isPrime(i)) return i;
        i -= 1n;
    }
    while (j <= max) {
        if (isPrime(j)) return j;
        j += 1n;
    }

    return null;
};

export { isPrime, randomPrime };
