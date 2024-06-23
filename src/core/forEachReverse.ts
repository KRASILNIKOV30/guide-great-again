function forEachReverse<T>(arr: T[], callback: (el: T, i: number, arr: T[]) => boolean) {
    const length = arr.length
    const [rbegin, rend] = [length - 1, -1]

    for (let i = rbegin; i > rend; --i) {
        if (!callback(arr[i], i, arr)) {
            break
        }
    }
}

function forEachCount<T>(arr: T[], count: number, callback: (el: T) => void) {
    const step = Math.max(Math.floor(arr.length / count), 1)

    for (let i = step; i < arr.length; i += step) {
        callback(arr[i])
    }
}

export {
    forEachReverse,
    forEachCount,
}
