function forEachReverse<T>(arr: T[], callback: (el: T, i: number, arr: T[]) => void) {
    const length = arr.length
    const [rbegin, rend] = [length - 1, -1]

    for (let i = rbegin; i !== rend; --i) {
        callback(arr[i], i, arr)
    }
}

export {
    forEachReverse,
}
