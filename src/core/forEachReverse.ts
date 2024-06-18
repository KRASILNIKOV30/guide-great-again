function forEachReverse<T>(arr: T[], withBounds: boolean, callback: (el: T, i: number, arr: T[]) => void) {
    const [rbegin, rend] = withBounds
        ? [arr.length - 1, 0]
        : [arr.length - 2, 1]

    for (let i = rbegin; i !== rend; --i) {
        callback(arr[i], i, arr)
    }
}

export {
    forEachReverse,
}
