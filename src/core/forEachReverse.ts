function forEachReverse<T>(arr: T[], callback: (el: T, i: number, arr: T[]) => void) {
    for (let i = arr.length - 1; i >= 0; --i) {
        callback(arr[i], i, arr)
    }
}

export {
    forEachReverse,
}