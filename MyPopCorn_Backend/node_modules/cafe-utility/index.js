'use strict'
Object.defineProperty(exports, '__esModule', { value: !0 }),
    (exports.Vector =
        exports.Cache =
        exports.Assertions =
        exports.Strings =
        exports.Types =
        exports.Objects =
        exports.Dates =
        exports.Promises =
        exports.Numbers =
        exports.System =
        exports.Arrays =
        exports.Random =
        exports.Binary =
        exports.Optional =
            void 0)
async function invertPromise(n) {
    return new Promise((t, e) => n.then(e, t))
}
async function raceFulfilled(n) {
    return invertPromise(Promise.all(n.map(invertPromise)))
}
async function runInParallelBatches(n, t = 1) {
    const e = splitByCount(n, t),
        r = [],
        o = e.map(async i => {
            for (const s of i) r.push(await s())
        })
    return await Promise.all(o), r
}
async function sleepMillis(n) {
    return new Promise(t =>
        setTimeout(() => {
            t(!0)
        }, n)
    )
}
function shuffle(n, t = Math.random) {
    for (let e = n.length - 1; e > 0; e--) {
        const r = Math.floor(t() * (e + 1)),
            o = n[e]
        ;(n[e] = n[r]), (n[r] = o)
    }
    return n
}
function onlyOrThrow(n) {
    if (n.length === 1) return n[0]
    throw Error(`Expected exactly one element, actual: ${n.length}`)
}
function onlyOrNull(n) {
    return n.length === 1 ? n[0] : null
}
function firstOrNull(n) {
    return n.length > 0 ? n[0] : null
}
function firstOrThrow(n) {
    if (!n.length) throw Error('Received empty array')
    return n[0]
}
function initializeArray(n, t) {
    const e = []
    for (let r = 0; r < n; r++) e.push(t(r))
    return e
}
function rotate2DArray(n) {
    const t = []
    for (let e = 0; e < n[0].length; e++) {
        t.push([])
        for (let r = 0; r < n.length; r++) t[e].push(n[r][e])
    }
    return t
}
function initialize2DArray(n, t, e) {
    const r = []
    for (let o = 0; o < n; o++) {
        r.push([])
        for (let i = 0; i < t; i++) r[o].push(e)
    }
    return r
}
function containsShape(n, t, e, r) {
    if (e < 0 || r < 0 || r + t[0].length > n[0].length || e + t.length > n.length) return !1
    for (let o = 0; o < t.length; o++)
        for (let i = 0; i < t[o].length; i++) if (t[o][i] !== void 0 && n[e + o][r + i] !== t[o][i]) return !1
    return !0
}
function pickRandomIndices(n, t, e = Math.random) {
    return shuffle(range(0, n.length - 1), e).slice(0, t)
}
function pluck(n, t) {
    return n.map(e => e[t])
}
function makeSeededRng(n) {
    let t = n,
        e = 3405648695,
        r = 3735928559
    return function () {
        return (t += e), (e ^= t << 7), (t *= r), (r ^= t << 13), (t ^= e ^ r), (t >>> 0) / 4294967296
    }
}
function intBetween(n, t, e = Math.random) {
    return Math.floor(e() * (t - n + 1)) + n
}
function floatBetween(n, t, e = Math.random) {
    return e() * (t - n) + n
}
function signedRandom() {
    return Math.random() * 2 - 1
}
function containsPoint(n, t, e) {
    return t >= n.x && t < n.x + n.width && e >= n.y && e < n.y + n.height
}
function randomPoint(n, t, e, r = Math.random) {
    let o, i
    do (o = intBetween(0, n - 1, r)), (i = intBetween(0, t - 1, r))
    while (e && containsPoint(e, o, i))
    return [o, i]
}
function chance(n, t = Math.random) {
    return t() < n
}
function pick(n, t = Math.random) {
    return n[Math.floor(n.length * t())]
}
function pickMany(n, t, e = Math.random) {
    if (t > n.length) throw new Error(`Count (${t}) is greater than array length (${n.length})`)
    return pickRandomIndices(n, t, e).map(o => n[o])
}
function pickManyUnique(n, t, e, r = Math.random) {
    if (t > n.length) throw new Error(`Count (${t}) is greater than array length (${n.length})`)
    const o = []
    for (; o.length < t; ) {
        const i = pick(n, r)
        o.some(s => e(s, i)) || o.push(i)
    }
    return o
}
function pickGuaranteed(n, t, e, r, o, i = Math.random) {
    const s = n.filter(u => u !== t && u !== e),
        c = []
    for (t !== null && c.push(t); s.length && c.length < r; ) {
        const u = exports.Random.intBetween(0, s.length - 1, i)
        o(s[u], c) && c.push(s[u]), s.splice(u, 1)
    }
    return shuffle(c, i), { values: c, indexOfGuaranteed: t !== null ? c.indexOf(t) : -1 }
}
function last(n) {
    if (!n.length) throw Error('Received empty array')
    return n[n.length - 1]
}
function pipe(n, t, e) {
    return e(t.reduce((r, o) => o(r), n))
}
function makePipe(n, t) {
    return e => pipe(e, n, t)
}
function pickWeighted(n, t, e) {
    if ((isUndefined(e) && (e = Math.random()), n.length !== t.length)) throw new Error('Array length mismatch')
    let r = t.reduce((i, s) => i + s, 0)
    const o = e * r
    for (let i = 0; i < n.length - 1; i++) if (((r -= t[i]), o >= r)) return n[i]
    return last(n)
}
function sortWeighted(n, t, e = Math.random) {
    const r = t.map(i => e() * i),
        o = []
    for (let i = 0; i < n.length; i++) o.push([n[i], r[i]])
    return o.sort((i, s) => s[1] - i[1]).map(i => i[0])
}
function getDeep(n, t) {
    if (n == null) return null
    const e = t.split('.')
    let r = n
    for (const o of e) {
        if (r[o] === null || r[o] === void 0) return null
        r = r[o]
    }
    return r
}
function setDeep(n, t, e) {
    const r = t.split(/\.|\[/)
    let o = n
    for (let i = 0; i < r.length; i++) {
        const s = r[i],
            c = i < r.length - 1 && r[i + 1].includes(']'),
            f = s.includes(']') ? s.replace(/\[|\]/g, '') : s
        if (i === r.length - 1) return (o[f] = e), e
        isObject(o[f]) || (c ? (o[f] = []) : (o[f] = {})), (o = o[f])
    }
    return e
}
function incrementDeep(n, t, e = 1) {
    const r = getDeep(n, t) || 0
    return setDeep(n, t, r + e), r
}
function ensureDeep(n, t, e) {
    return getDeep(n, t) || setDeep(n, t, e)
}
function deleteDeep(n, t) {
    const e = beforeLast(t, '.'),
        r = afterLast(t, '.')
    if (!e || !r) return
    const o = getDeep(n, e)
    delete o[r]
}
function replaceDeep(n, t, e) {
    const r = getDeep(n, t)
    if (!r) throw new Error("Key '" + t + "' does not exist.")
    return setDeep(n, t, e), r
}
function getFirstDeep(n, t, e) {
    for (const r of t) {
        const o = getDeep(n, r)
        if (o) return o
    }
    if (e) {
        const r = Object.values(n)
        if (r.length) return r[0]
    }
    return null
}
async function forever(n, t, e) {
    for (;;) {
        try {
            await n()
        } catch (r) {
            e && e('Error in forever', r)
        }
        await sleepMillis(t)
    }
}
function asMegabytes(n) {
    return n / 1024 / 1024
}
function convertBytes(n) {
    return n >= 1024 * 1024 * 1024
        ? (n / 1024 / 1024 / 1024).toFixed(3) + ' GB'
        : n >= 1024 * 1024
        ? (n / 1024 / 1024).toFixed(3) + ' MB'
        : n >= 1024
        ? (n / 1024).toFixed(3) + ' KB'
        : n + ' B'
}
function hexToRgb(n) {
    const t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(n.toLowerCase())
    if (!t) throw new Error('Invalid hex color: ' + n)
    return [parseInt(t[1], 16), parseInt(t[2], 16), parseInt(t[3], 16)]
}
function rgbToHex(n) {
    return '#' + n.map(t => t.toString(16).padStart(2, '0')).join('')
}
function haversineDistanceToMeters(n, t, e, r) {
    const i = (n * Math.PI) / 180,
        s = (e * Math.PI) / 180,
        c = ((e - n) * Math.PI) / 180,
        u = ((r - t) * Math.PI) / 180,
        f = Math.sin(c / 2) * Math.sin(c / 2) + Math.cos(i) * Math.cos(s) * Math.sin(u / 2) * Math.sin(u / 2)
    return 6371e3 * (2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f)))
}
function roundToNearest(n, t) {
    return Math.round(n / t) * t
}
function formatDistance(n) {
    return n > 1e3
        ? (n / 1e3).toFixed(0) + ' km'
        : n >= 500
        ? roundToNearest(n, 100) + ' m'
        : n >= 100
        ? roundToNearest(n, 50) + ' m'
        : roundToNearest(n, 10) + ' m'
}
function isObject(n, t = !0) {
    return !n ||
        (t && !isUndefined(n._readableState)) ||
        (t &&
            n.constructor &&
            (n.constructor.isBuffer ||
                n.constructor.name == 'Uint8Array' ||
                n.constructor.name === 'ArrayBuffer' ||
                n.constructor.name === 'ReadableStream'))
        ? !1
        : typeof n == 'object'
}
function isStrictlyObject(n) {
    return isObject(n) && !Array.isArray(n)
}
function isEmptyArray(n) {
    return Array.isArray(n) && n.length === 0
}
function isEmptyObject(n) {
    return isStrictlyObject(n) && Object.keys(n).length === 0
}
function isUndefined(n) {
    return typeof n > 'u'
}
function isFunction(n) {
    return Object.prototype.toString.call(n) === '[object Function]'
}
function isString(n) {
    return Object.prototype.toString.call(n) === '[object String]'
}
function isNumber(n) {
    return typeof n == 'number' && isFinite(n)
}
function isBoolean(n) {
    return n === !0 || n === !1
}
function isDate(n) {
    return Object.prototype.toString.call(n) === '[object Date]'
}
function isBlank(n) {
    return !isString(n) || n.trim().length === 0
}
function isId(n) {
    return isNumber(n) && Number.isInteger(n) && n >= 1
}
function isIntegerString(n) {
    return isString(n) && n.match(/^-?\d+$/) !== null
}
function isHexString(n) {
    return isString(n) && n.match(/^(0x)?[0-9a-f]+$/i) !== null
}
const symbols = '!@#$%^&*()_+-=[]{}|;:<>?,./',
    symbolsArray = '!@#$%^&*()_+-=[]{}|;:<>?,./'.split(''),
    lowercaseAlphabet = 'abcdefghijklmnopqrstuvwxyz',
    uppercaseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numericAlphabet = '1234567890',
    alphanumericAlphabet = lowercaseAlphabet + uppercaseAlphabet + numericAlphabet,
    richAsciiAlphabet = alphanumericAlphabet + symbols,
    unicodeTestingAlphabet = [
        '\u2014',
        '\\',
        '\u6771',
        '\u4EAC',
        '\u90FD',
        '\u{1D586}',
        '\u{1D587}',
        '\u{1D588}',
        '\u{1F47E}',
        '\u{1F647}',
        '\u{1F481}',
        '\u{1F645}',
        '\u16A0',
        '\u16C7',
        '\u16BB',
        '\u16E6'
    ],
    hexAlphabet = '0123456789abcdef'
function randomLetterString(n, t = Math.random) {
    let e = ''
    for (let r = 0; r < n; r++) e += lowercaseAlphabet[Math.floor(t() * lowercaseAlphabet.length)]
    return e
}
function randomAlphanumericString(n, t = Math.random) {
    let e = ''
    for (let r = 0; r < n; r++) e += alphanumericAlphabet[Math.floor(t() * alphanumericAlphabet.length)]
    return e
}
function randomRichAsciiString(n, t = Math.random) {
    let e = ''
    for (let r = 0; r < n; r++) e += richAsciiAlphabet[Math.floor(t() * richAsciiAlphabet.length)]
    return e
}
function randomUnicodeString(n, t = Math.random) {
    let e = ''
    for (let r = 0; r < n; r++) e += unicodeTestingAlphabet[Math.floor(t() * unicodeTestingAlphabet.length)]
    return e
}
function searchHex(n, t) {
    const e = new RegExp(`[0-9a-f]{${t}}`, 'i'),
        r = n.match(e)
    return r ? r[0] : null
}
function searchSubstring(n, t, e = symbolsArray) {
    const r = splitAll(n, e)
    for (const o of r) if (t(o)) return o
    return null
}
function randomHexString(n, t = Math.random) {
    let e = ''
    for (let r = 0; r < n; r++) e += hexAlphabet[Math.floor(t() * hexAlphabet.length)]
    return e
}
function asString(n) {
    if (isBlank(n)) throw new TypeError('Expected string, got: ' + n)
    return n
}
function asSafeString(n) {
    if (
        !asString(n)
            .split('')
            .every(t => t === '_' || isLetterOrDigit(t))
    )
        throw new TypeError('Expected safe string, got: ' + n)
    return n
}
function asNumber(n) {
    if (isNumber(n)) return n
    if (!isString(n) || !n.match(/^-?\d+(\.\d+)?$/)) throw new TypeError('Expected number, got: ' + n)
    return parseFloat(n)
}
function asInteger(n) {
    return asNumber(n) | 0
}
function asBoolean(n) {
    if (n === 'true') return !0
    if (n === 'false') return !1
    if (!isBoolean(n)) throw new TypeError('Expected boolean, got: ' + n)
    return n
}
function asDate(n) {
    if (!isDate(n)) throw new TypeError('Expected date, got: ' + n)
    return n
}
function asNullableString(n) {
    return isBlank(n) ? null : n
}
function asEmptiableString(n) {
    if (!isString(n)) throw new TypeError('Expected string, got: ' + n)
    return n
}
function asId(n) {
    if (isId(n)) return n
    const t = parseInt(n, 10)
    if (!isId(t)) throw new TypeError('Expected id, got: ' + n)
    return t
}
function asTime(n) {
    if (!isString(n)) throw new TypeError('Expected time, got: ' + n)
    const t = n.split(':')
    if (t.length !== 2) throw new TypeError('Expected time, got: ' + n)
    const e = parseInt(t[0], 10),
        r = parseInt(t[1], 10)
    if (!isNumber(e) || !isNumber(r) || e < 0 || e > 23 || r < 0 || r > 59)
        throw new TypeError('Expected time, got: ' + n)
    return `${String(e).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
function asArray(n) {
    if (!Array.isArray(n)) throw new TypeError('Expected array, got: ' + n)
    return n
}
function asObject(n) {
    if (!isStrictlyObject(n)) throw new TypeError('Expected object, got: ' + n)
    return n
}
function asNullableObject(n) {
    return n === null ? null : asObject(n)
}
function asNumericDictionary(n) {
    const t = asObject(n),
        e = Object.keys(t),
        r = Object.values(t)
    if (!e.every(isString) || !r.every(isNumber)) throw new TypeError('Expected numeric dictionary, got: ' + n)
    return t
}
function isUrl(n) {
    return isString(n) && n.match(/^https?:\/\/.+/) !== null
}
function asUrl(n) {
    if (!isUrl(n)) throw new TypeError('Expected url, got: ' + n)
    return n
}
function isNullable(n, t) {
    return isUndefined(t) || t === null ? !0 : n(t)
}
function asNullable(n, t) {
    return t === null || isUndefined(t) ? null : n(t)
}
function enforceObjectShape(n, t) {
    for (const [e, r] of Object.entries(t)) if (!r(n[e])) throw TypeError(`${e} in value does not exist or match shape`)
    for (const e of Object.keys(n)) if (!t[e]) throw TypeError(`${e} exists in value but not in shape`)
    return !0
}
function enforceArrayShape(n, t) {
    return n.every(e => enforceObjectShape(e, t))
}
function represent(n, t = 'json', e = 0) {
    if (isObject(n, !1)) {
        if (e > 1) return '[object Object]'
        if (t === 'json') {
            if (Array.isArray(n)) {
                const o = n.map(i => represent(i, 'json', e + 1))
                return e === 0 ? JSON.stringify(o) : o
            }
            const r = {}
            n.message && (r.message = represent(n.message, 'json', e + 1))
            for (const [o, i] of Object.entries(n)) r[o] = represent(i, 'json', e + 1)
            return e === 0 ? JSON.stringify(r) : r
        } else if (t === 'key-value') {
            const r = Object.keys(n)
            return (
                n.message && !r.includes('message') && r.unshift('message'),
                r.map(o => `${o}=${JSON.stringify(represent(n[o], 'json', e + 1))}`).join(' ')
            )
        }
    }
    return isUndefined(n) && (n = 'undefined'), e === 0 ? JSON.stringify(n) : n
}
function expandError(n, t) {
    if (isString(n)) return n
    const e = Object.keys(n)
    n.message && !e.includes('message') && e.push('message')
    const r = e.map(o => `${o}: ${n[o]}`).join('; ')
    return t && n.stack
        ? r +
              `
` +
              n.stack
        : r
}
function deepMergeInPlace(n, t) {
    if (isStrictlyObject(n) && isStrictlyObject(t))
        for (const e in t)
            isStrictlyObject(t[e])
                ? (n[e] || (n[e] = {}), deepMergeInPlace(n[e], t[e]))
                : Array.isArray(t[e])
                ? (n[e] = [...t[e]])
                : ((t[e] !== null && t[e] !== void 0) || n[e] === null || n[e] === void 0) && (n[e] = t[e])
    return n
}
function deepMerge2(n, t) {
    const e = {}
    return deepMergeInPlace(e, n), deepMergeInPlace(e, t), e
}
function deepMerge3(n, t, e) {
    const r = {}
    return deepMergeInPlace(r, n), deepMergeInPlace(r, t), deepMergeInPlace(r, e), r
}
function zip(n, t) {
    const e = {}
    for (const r of n) for (const o of Object.keys(r)) e[o] ? (e[o] = t(e[o], r[o])) : (e[o] = r[o])
    return e
}
function zipSum(n) {
    return zip(n, (t, e) => t + e)
}
function pushToBucket(n, t, e) {
    n[t] || (n[t] = []), n[t].push(e)
}
function unshiftAndLimit(n, t, e) {
    for (n.unshift(t); n.length > e; ) n.pop()
}
function atRolling(n, t) {
    let e = t % n.length
    return e < 0 && (e += n.length), n[e]
}
function pushAll(n, t) {
    Array.prototype.push.apply(n, t)
}
function unshiftAll(n, t) {
    Array.prototype.unshift.apply(n, t)
}
async function mapAllAsync(n, t) {
    const e = []
    for (const r of n) e.push(await t(r))
    return e
}
function glue(n, t) {
    const e = []
    for (let r = 0; r < n.length; r++) e.push(n[r]), r < n.length - 1 && (isFunction(t) ? e.push(t()) : e.push(t))
    return e
}
function asEqual(n, t) {
    if (n !== t) throw Error(`Expected [${n}] to equal [${t}]`)
    return [n, t]
}
function asTrue(n) {
    if (n !== !0) throw Error(`Expected [true], got: [${n}]`)
    return n
}
function asTruthy(n) {
    if (!n) throw Error(`Expected truthy value, got: [${n}]`)
    return n
}
function asFalse(n) {
    if (n !== !1) throw Error(`Expected [false], got: [${n}]`)
    return n
}
function asFalsy(n) {
    if (n) throw Error(`Expected falsy value, got: [${n}]`)
    return n
}
function asEither(n, t) {
    if (!t.includes(n)) throw Error(`Expected any of [${t.join(', ')}], got: [${n}]`)
    return n
}
function scheduleMany(n, t) {
    for (let e = 0; e < n.length; e++) {
        const r = n[e],
            o = t[e],
            i = Math.max(0, o.getTime() - Date.now())
        setTimeout(r, i)
    }
}
function interpolate(n, t, e) {
    return n + (t - n) * e
}
function sum(n) {
    return n.reduce((t, e) => t + e, 0)
}
function average(n) {
    return n.reduce((t, e) => t + e, 0) / n.length
}
function median(n) {
    const t = [...n].sort((r, o) => r - o),
        e = Math.floor(t.length / 2)
    return t.length % 2 === 0 ? (t[e] + t[e - 1]) / 2 : t[e]
}
function getDistanceFromMidpoint(n, t) {
    return n - (t - 1) / 2
}
function range(n, t) {
    const e = []
    for (let r = n; r <= t; r++) e.push(r)
    return e
}
function includesAny(n, t) {
    return t.some(e => n.includes(e))
}
function isChinese(n) {
    return /^[\u4E00-\u9FA5]+$/.test(n)
}
function slugify(n, t = () => !1) {
    return n
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split('')
        .map(e => (/[a-z0-9]/.test(e) || t(e) ? e : '-'))
        .join('')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}
function camelToTitle(n) {
    return capitalize(n.replace(/([A-Z])/g, ' $1'))
}
function slugToTitle(n) {
    return n.split('-').map(capitalize).join(' ')
}
function slugToCamel(n) {
    return decapitalize(n.split('-').map(capitalize).join(''))
}
function joinHumanly(n, t = ', ', e = ' and ') {
    return !n || !n.length
        ? ''
        : n.length === 1
        ? n[0]
        : n.length === 2
        ? `${n[0]}${e}${n[1]}`
        : `${n.slice(0, n.length - 1).join(t)}${e}${n[n.length - 1]}`
}
function surroundInOut(n, t) {
    return t + n.split('').join(t) + t
}
function enumify(n) {
    return slugify(n).replace(/-/g, '_').toUpperCase()
}
function getFuzzyMatchScore(n, t) {
    if (t.length === 0) return 0
    const e = n.toLowerCase(),
        r = t.toLowerCase()
    return n === t
        ? 1e4
        : e.startsWith(r)
        ? 1e4 - n.length
        : e.includes(r)
        ? 5e3 - n.length
        : new RegExp('.*' + r.split('').join('.*') + '.*').test(e)
        ? 1e3 - n.length
        : 0
}
function sortByFuzzyScore(n, t) {
    return n.filter(e => getFuzzyMatchScore(e, t)).sort((e, r) => getFuzzyMatchScore(r, t) - getFuzzyMatchScore(e, t))
}
function escapeHtml(n) {
    return n.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
const htmlEntityMap = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&gt;': '>', '&lt;': '<' }
function decodeHtmlEntities(n) {
    let t = n
        .replace(/&#(\d+);/g, (e, r) => String.fromCharCode(r))
        .replace(/&#x(\d+);/g, (e, r) => String.fromCharCode(parseInt(r, 16)))
    for (const [e, r] of Object.entries(htmlEntityMap)) t = t.replaceAll(e, r)
    return t
}
function before(n, t) {
    const e = n.indexOf(t)
    return e === -1 ? null : n.slice(0, e)
}
function after(n, t) {
    const e = n.indexOf(t)
    return e === -1 ? null : n.slice(e + t.length)
}
function beforeLast(n, t) {
    const e = n.lastIndexOf(t)
    return e === -1 ? null : n.slice(0, e)
}
function afterLast(n, t) {
    const e = n.lastIndexOf(t)
    return e === -1 ? null : n.slice(e + t.length)
}
function betweenWide(n, t, e) {
    const r = beforeLast(n, e)
    return r ? after(r, t) : null
}
function betweenNarrow(n, t, e) {
    const r = after(n, t)
    return r ? before(r, e) : null
}
function splitOnce(n, t, e = !1) {
    const r = e ? n.lastIndexOf(t) : n.indexOf(t)
    return r === -1 ? (e ? [null, n] : [n, null]) : [n.slice(0, r), n.slice(r + t.length)]
}
function splitAll(n, t) {
    let e = [n]
    for (const r of t) e = e.flatMap(o => o.split(r))
    return e.filter(r => r)
}
function getExtension(n) {
    const t = last(n.split(/\\|\//g)),
        e = t.lastIndexOf('.', t.length - 1)
    return e <= 0 ? '' : t.slice(e + 1)
}
function getBasename(n) {
    const t = last(n.split(/\\|\//g)),
        e = t.lastIndexOf('.', t.length - 1)
    return e <= 0 ? t : t.slice(0, e)
}
function normalizeEmail(n) {
    let [t, e] = n.split('@')
    t = t.replaceAll('.', '').toLowerCase()
    const [r] = t.split('+')
    if (!r || !e || e.indexOf('.') === -1 || e.indexOf('.') === e.length - 1) throw new Error('Invalid email')
    return `${r}@${e.toLowerCase()}`
}
function normalizeFilename(n) {
    const t = getBasename(n),
        e = getExtension(n)
    return e ? `${t}.${e}` : t
}
function parseFilename(n) {
    const t = getBasename(n),
        e = getExtension(n)
    return { basename: t, extension: e, filename: e ? `${t}.${e}` : t }
}
function randomize(n, t = Math.random) {
    return n.replace(/\{(.+?)\}/g, (e, r) => pick(r.split('|'), t))
}
function expand(n) {
    const t = /\{(.+?)\}/,
        e = n.match(t)
    if (!e || !e.index) return [n]
    const r = e[1].split(','),
        o = n.slice(0, e.index),
        i = n.slice(e.index + e[0].length)
    let s = []
    for (const c of r) {
        const u = expand(o + c + i)
        s = s.concat(u)
    }
    return s
}
function shrinkTrim(n) {
    return n.replace(/\s+/g, ' ').replace(/\s$|^\s/g, '')
}
function capitalize(n) {
    return n.charAt(0).toUpperCase() + n.slice(1)
}
function decapitalize(n) {
    return n.charAt(0).toLowerCase() + n.slice(1)
}
function isLetter(n) {
    if (!n) return !1
    const t = n.charCodeAt(0)
    return (t >= 65 && t <= 90) || (t >= 97 && t <= 122)
}
function isDigit(n) {
    if (!n) return !1
    const t = n.charCodeAt(0)
    return t >= 48 && t <= 57
}
function isLetterOrDigit(n) {
    return isLetter(n) || isDigit(n)
}
const wordBreakCharacters = ` 
	\r.,?!:;"'\`(){}[]~@#$%^&*-+=|<>/\\`.split('')
function isWordBreakCharacter(n) {
    return wordBreakCharacters.includes(n)
}
function isValidObjectPathCharacter(n) {
    return isLetterOrDigit(n) || n === '.' || n === '[' || n === ']' || n === '_'
}
function insertString(n, t, e, r, o) {
    return n.slice(0, t) + r + n.slice(t, t + e) + o + n.slice(t + e)
}
function indexOfRegex(n, t, e = 0) {
    const r = t.exec(n.slice(e))
    return r ? { index: r.index, match: r[0] } : null
}
function lineMatches(n, t, e = !0) {
    if (!e) return t.every(o => (o instanceof RegExp ? o.test(n) : n.indexOf(o, 0) !== -1))
    let r = 0
    for (const o of t)
        if (o instanceof RegExp) {
            const i = indexOfRegex(n, o, r)
            if (!i) return !1
            r = i.index + i.match.length
        } else {
            const i = n.indexOf(o, r)
            if (i === -1) return !1
            r = i + o.length
        }
    return !0
}
function linesMatchInOrder(n, t, e = !0) {
    let r = 0
    for (const o of t) {
        let i = !1
        for (; !i && r < n.length; ) lineMatches(n[r], o, e) && (i = !0), r++
        if (!i) return !1
    }
    return !0
}
function csvEscape(n) {
    return n.match(/"|,/) ? `"${n.replace(/"/g, '""')}"` : n
}
function indexOfEarliest(n, t, e = 0) {
    let r = -1
    for (const o of t) {
        const i = n.indexOf(o, e)
        i !== -1 && (r === -1 || i < r) && (r = i)
    }
    return r
}
function indexOfWordBreak(n, t = 0) {
    for (let e = t; e < n.length; e++) if (isWordBreakCharacter(n[e])) return e
    return -1
}
function indexOfHashtag(n, t = 0) {
    for (let e = t; e < n.length; e++) if (n[e] === '#' && isLetterOrDigit(n[e + 1])) return e
    return -1
}
function lastIndexOfBefore(n, t, e = 0) {
    return n.slice(0, e).lastIndexOf(t)
}
function findWeightedPair(n, t = 0, e = '{', r = '}') {
    let o = 1
    for (let i = t; i < n.length; i++)
        if (n.slice(i, i + r.length) === r) {
            if (--o === 0) return i
        } else n.slice(i, i + e.length) === e && o++
    return -1
}
function extractBlock(n, t) {
    const e = t.wordBoundary
        ? indexOfEarliest(
              n,
              [
                  `${t.opening} `,
                  `${t.opening}
`
              ],
              t.start || 0
          )
        : n.indexOf(t.opening, t.start || 0)
    if (e === -1) return null
    const r = findWeightedPair(n, e + t.opening.length, t.opening, t.closing)
    return r === -1 ? null : t.exclusive ? n.slice(e + t.opening.length, r) : n.slice(e, r + t.closing.length)
}
function extractAllBlocks(n, t) {
    const e = []
    let r = t.wordBoundary
        ? indexOfEarliest(
              n,
              [
                  `${t.opening} `,
                  `${t.opening}
`
              ],
              t.start || 0
          )
        : n.indexOf(t.opening, t.start || 0)
    for (;;) {
        if (r === -1) return e
        const o = extractBlock(n, Object.assign(Object.assign({}, t), { start: r }))
        if (!o) return e
        e.push(o),
            (r = t.wordBoundary
                ? indexOfEarliest(
                      n,
                      [
                          `${t.opening} `,
                          `${t.opening}
`
                      ],
                      r + o.length
                  )
                : n.indexOf(t.opening, r + o.length))
    }
}
function replaceBlocks(n, t, e) {
    let r = 0
    for (;;) {
        const o = exports.Strings.extractBlock(n, Object.assign(Object.assign({}, e), { start: r }))
        if (!o) return n
        const i = t(o)
        ;(r = n.indexOf(o, r) + i.length), (n = n.replace(o, i))
    }
}
function splitFormatting(n, t) {
    const e = []
    let r = 0
    for (; r < n.length; ) {
        const o = n.indexOf(t, r)
        if (o === -1) {
            e.push({ string: n.slice(r), symbol: null })
            break
        }
        const i = n.indexOf(t, o + t.length)
        if ((o > r && i !== -1 && e.push({ string: n.slice(r, o), symbol: null }), i === -1)) {
            e.push({ string: n.slice(r), symbol: null })
            break
        }
        e.push({ string: n.slice(o + t.length, i), symbol: t }), (r = i + t.length)
    }
    return e
}
function splitHashtags(n) {
    const t = []
    let e = 0
    for (; e < n.length; ) {
        const r = indexOfHashtag(n, e)
        if (r === -1) {
            t.push({ string: n.slice(e), symbol: null })
            break
        }
        const o = indexOfWordBreak(n, r + 1)
        if (o === -1) {
            t.push({ string: n.slice(e, r), symbol: null }), t.push({ string: n.slice(r + 1), symbol: '#' })
            break
        }
        r > e && t.push({ string: n.slice(e, r), symbol: null }),
            t.push({ string: n.slice(r + 1, o), symbol: '#' }),
            (e = o)
    }
    return t
}
function splitUrls(n) {
    const t = []
    let e = 0
    for (; e < n.length; ) {
        const r = indexOfEarliest(n, ['http://', 'https://'], e)
        if (r === -1) {
            t.push({ string: n.slice(e), symbol: null })
            break
        }
        const o = indexOfEarliest(
            n,
            [
                ' ',
                `
`
            ],
            r
        )
        if (o === -1) {
            r > e && t.push({ string: n.slice(e, r), symbol: null }), t.push({ string: n.slice(r), symbol: 'http' })
            break
        }
        r > e && t.push({ string: n.slice(e, r), symbol: null }),
            t.push({ string: n.slice(r, o), symbol: 'http' }),
            (e = o)
    }
    return t
}
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
function base64ToUint8Array(n) {
    let t = 0
    n.charAt(n.length - 1) === '=' && (t++, n.charAt(n.length - 2) === '=' && t++)
    const e = (n.length * 6) / 8 - t,
        r = new Uint8Array(e)
    let o = 0,
        i = 0
    for (; o < n.length; ) {
        const s = BASE64_CHARS.indexOf(n.charAt(o++)),
            c = BASE64_CHARS.indexOf(n.charAt(o++)),
            u = BASE64_CHARS.indexOf(n.charAt(o++)),
            f = BASE64_CHARS.indexOf(n.charAt(o++)),
            l = (s << 2) | (c >> 4),
            a = ((c & 15) << 4) | (u >> 2),
            h = ((u & 3) << 6) | f
        ;(r[i++] = l), i < e && (r[i++] = a), i < e && (r[i++] = h)
    }
    return r
}
function uint8ArrayToBase64(n) {
    let t = '',
        e = 0
    for (let r = 0; r < n.length; r += 3) {
        const o = n[r],
            i = n[r + 1],
            s = n[r + 2],
            c = o >> 2,
            u = ((o & 3) << 4) | (i >> 4),
            f = ((i & 15) << 2) | (s >> 6),
            l = s & 63
        ;(t += BASE64_CHARS[c] + BASE64_CHARS[u]),
            r + 1 < n.length ? (t += BASE64_CHARS[f]) : e++,
            r + 2 < n.length ? (t += BASE64_CHARS[l]) : e++
    }
    return e && (t += e === 1 ? '=' : '=='), t
}
function hexToUint8Array(n) {
    n.startsWith('0x') && (n = n.slice(2))
    const t = n.length / 2,
        e = new Uint8Array(t)
    for (let r = 0; r < t; r++) {
        const o = parseInt(n.slice(r * 2, r * 2 + 2), 16)
        e[r] = o
    }
    return e
}
function uint8ArrayToHex(n) {
    return Array.from(n)
        .map(t => t.toString(16).padStart(2, '0'))
        .join('')
}
function route(n, t) {
    const e = n.split('/').filter(i => i),
        r = t.split('/').filter(i => i)
    if (e.length !== r.length) return null
    const o = {}
    for (let i = 0; i < e.length; i++) {
        const s = e[i]
        if (s.startsWith(':')) o[s.slice(1)] = r[i]
        else if (s !== r[i]) return null
    }
    return o
}
function explodeReplace(n, t, e) {
    const r = []
    for (const o of e) o !== t && r.push(n.replace(t, o))
    return r
}
function generateVariants(n, t, e, r = Math.random) {
    const o = exports.Arrays.shuffle(
            t.map(s => ({
                variants: exports.Arrays.shuffle(
                    s.variants.map(c => c),
                    r
                ),
                avoid: s.avoid
            })),
            r
        ),
        i = []
    for (const s of o) {
        const c = s.variants.filter(f => f !== s.avoid),
            u = c.find(f => n.includes(f))
        if (u && (pushAll(i, explodeReplace(n, u, c)), i.length >= e)) break
    }
    if (i.length < e)
        for (const s of o) {
            const c = s.variants.find(u => n.includes(u))
            if (c && (pushAll(i, explodeReplace(n, c, s.variants)), i.length >= e)) break
        }
    return i.slice(0, e)
}
function hashCode(n) {
    let t = 0
    for (let e = 0; e < n.length; e++) (t = (t << 5) - t + n.charCodeAt(e)), (t |= 0)
    return t
}
function replaceWord(n, t, e, r = !1) {
    const o = new RegExp(r ? `(?<=\\s|^)${t}(?=\\s|$)` : `\\b${t}\\b`, 'g')
    return n.replace(o, e)
}
function replacePascalCaseWords(n, t) {
    const e = /\b[A-Z][a-zA-Z0-9]*\b/g
    return n.replace(e, r => (r.toUpperCase() === r ? r : t(r)))
}
function stripHtml(n) {
    return n.replace(/<[^>]*>/g, '')
}
function breakLine(n) {
    const t = n.lastIndexOf(' ')
    if (t === -1) return { line: n, rest: '' }
    const e = n.slice(0, t),
        r = n.slice(t + 1)
    return { line: e, rest: r }
}
function measureTextWidth(n, t = {}) {
    return [...n].reduce((e, r) => e + (t[r] || 1), 0)
}
function toLines(n, t, e = {}) {
    const r = []
    let o = '',
        i = 0
    for (let s = 0; s < n.length; s++) {
        const c = n[s],
            u = e[c] || 1
        if (((o += c), (i += u), i > t)) {
            const { line: f, rest: l } = breakLine(o)
            r.push(f),
                (o = l),
                (i = l
                    .split('')
                    .map(a => e[a] || 1)
                    .reduce((a, h) => a + h, 0))
        }
    }
    return o && r.push(o), r
}
function levenshteinDistance(n, t) {
    const e = []
    for (let r = 0; r <= n.length; r++) e[r] = [r]
    for (let r = 0; r <= t.length; r++) e[0][r] = r
    for (let r = 1; r <= n.length; r++)
        for (let o = 1; o <= t.length; o++) {
            const i = n[r - 1] === t[o - 1] ? 0 : 1
            e[r][o] = Math.min(e[r - 1][o] + 1, e[r][o - 1] + 1, e[r - 1][o - 1] + i)
        }
    return e[n.length][t.length]
}
function containsWord(n, t) {
    return new RegExp(`\\b${t}\\b`).test(n)
}
function containsWords(n, t, e) {
    return e === 'any' ? t.some(r => containsWord(n, r)) : t.every(r => containsWord(n, r))
}
function parseHtmlAttributes(n) {
    const t = {},
        e = n.match(/([a-z\-]+)="([^"]+)"/g)
    if (e)
        for (const r of e) {
            const [o, i] = splitOnce(r, '=')
            t[o] = i.slice(1, i.length - 1)
        }
    return t
}
function readNextWord(n, t, e = []) {
    let r = ''
    for (; t < n.length && (isLetterOrDigit(n[t]) || e.includes(n[t])); ) r += n[t++]
    return r
}
function resolveVariables(n, t, e = '$', r = ':') {
    for (const o in t) n = resolveVariableWithDefaultSyntax(n, o, t[o], e, r)
    return (n = resolveRemainingVariablesWithDefaults(n)), n
}
function resolveVariableWithDefaultSyntax(n, t, e, r = '$', o = ':') {
    if (e === '') return n
    let i = n.indexOf(`${r}${t}`)
    for (; i !== -1; ) {
        if (n[i + t.length + 1] === o)
            if (n[i + t.length + 2] === o) n = n.replace(`${r}${t}${o}${o}`, e)
            else {
                const c = readNextWord(n, i + t.length + 2, ['_'])
                n = n.replace(`${r}${t}${o}${c}`, e)
            }
        else n = n.replace(`${r}${t}`, e)
        i = n.indexOf(`${r}${t}`, i + e.length)
    }
    return n
}
function resolveRemainingVariablesWithDefaults(n, t = '$', e = ':') {
    let r = n.indexOf(t)
    for (; r !== -1; ) {
        const o = readNextWord(n, r + 1)
        if (n[r + o.length + 1] === e)
            if (n[r + o.length + 2] === e) n = n.replace(`${t}${o}${e}${e}`, '')
            else {
                const s = readNextWord(n, r + o.length + 2)
                n = n.replace(`${t}${o}${e}${s}`, s)
            }
        r = n.indexOf(t, r + 1)
    }
    return n
}
function resolveMarkdownLinks(n, t) {
    let e = n.indexOf('](')
    for (; e !== -1; ) {
        const r = lastIndexOfBefore(n, '[', e),
            o = n.indexOf(')', e)
        if (r !== -1 && o !== -1) {
            const [i, s] = n.slice(r + 1, o).split(']('),
                c = t(i, s)
            n = n.slice(0, r) + c + n.slice(o + 1)
        }
        e = n.indexOf('](', e + 1)
    }
    return n
}
function toQueryString(n, t = !0) {
    const e = Object.entries(n)
        .filter(([r, o]) => o != null)
        .map(([r, o]) => `${r}=${encodeURIComponent(o)}`)
        .join('&')
    return e ? (t ? '?' : '') + e : ''
}
function parseQueryString(n) {
    const t = {},
        e = n.split('&')
    for (const r of e) {
        const [o, i] = r.split('=')
        o && i && (t[o] = decodeURIComponent(i))
    }
    return t
}
function hasKey(n, t) {
    return Object.prototype.hasOwnProperty.call(n, t)
}
function selectMax(n, t) {
    let e = null,
        r = -1 / 0
    for (const [o, i] of Object.entries(n)) {
        const s = t(i)
        s > r && ((r = s), (e = o))
    }
    return e ? [e, n[e]] : null
}
function reposition(n, t, e, r) {
    const o = n.find(s => s[t] === e),
        i = n.find(s => s[t] === e + r)
    o && i ? ((o[t] = e + r), (i[t] = e)) : o && (o[t] = e + r),
        n.sort((s, c) => asNumber(s[t]) - asNumber(c[t])),
        n.forEach((s, c) => (s[t] = c + 1))
}
function unwrapSingleKey(n) {
    const t = Object.keys(n)
    if (t.length === 1) return n[t[0]]
    throw new Error('Expected object to have a single key')
}
function buildUrl(n, t, e) {
    return joinUrl(n, t) + toQueryString(e || {})
}
function parseCsv(n, t = ',', e = '"') {
    const r = []
    let o = '',
        i = !1
    const s = n.split('')
    for (const c of s) c === t && !i ? (r.push(o), (o = '')) : c === e && ((!o && !i) || i) ? (i = !i) : (o += c)
    return r.push(o), r
}
function humanizeProgress(n) {
    return `[${Math.floor(n.progress * 100)}%] ${humanizeTime(n.deltaMs)} out of ${humanizeTime(
        n.totalTimeMs
    )} (${humanizeTime(n.remainingTimeMs)} left) [${Math.round(n.baseTimeMs)} ms each]`
}
async function waitFor(n, t, e) {
    for (let r = 0; r < e; r++) {
        try {
            if (await n()) return !0
        } catch {}
        r < e - 1 && (await sleepMillis(t))
    }
    return !1
}
function filterAndRemove(n, t) {
    const e = []
    for (let r = n.length - 1; r >= 0; r--) t(n[r]) && e.push(n.splice(r, 1)[0])
    return e
}
function cloneWithJson(n) {
    return JSON.parse(JSON.stringify(n))
}
function unixTimestamp(n) {
    return Math.ceil((n || Date.now()) / 1e3)
}
function isoDate(n) {
    return (n || new Date()).toISOString().slice(0, 10)
}
function dateTimeSlug(n) {
    return (n || new Date()).toISOString().slice(0, 19).replace(/T|:/g, '-')
}
function fromUtcString(n) {
    const t = new Date(n)
    return new Date(t.getTime() - t.getTimezoneOffset() * 6e4)
}
function fromMillis(n) {
    return new Date(n)
}
function createTimeDigits(n) {
    return String(Math.floor(n)).padStart(2, '0')
}
function humanizeTime(n) {
    const t = Math.floor(n / 36e5)
    n = n % 36e5
    const e = Math.floor(n / 6e4)
    n = n % 6e4
    const r = Math.floor(n / 1e3)
    return t
        ? `${createTimeDigits(t)}:${createTimeDigits(e)}:${createTimeDigits(r)}`
        : `${createTimeDigits(e)}:${createTimeDigits(r)}`
}
function absoluteDays(n) {
    return Math.floor((isDate(n) ? n.getTime() : n) / 864e5)
}
const DefaultTimestampTranslations = {
    today: (n, t) => createTimeDigits(n) + ':' + createTimeDigits(t),
    yesterday: () => 'Yesterday',
    monday: () => 'Mon',
    tuesday: () => 'Tue',
    wednesday: () => 'Wed',
    thursday: () => 'Thu',
    friday: () => 'Fri',
    saturday: () => 'Sat',
    sunday: () => 'Sun',
    weeks: n => `${n}w`
}
function getTimestamp(n, t) {
    const e = new Date(t?.now || Date.now()),
        r = t?.translations || DefaultTimestampTranslations,
        o = isDate(n) ? n : new Date(n)
    if (absoluteDays(e) === absoluteDays(o)) return r.today(o.getUTCHours(), o.getUTCMinutes(), o.getUTCHours() > 12)
    if (absoluteDays(e) - absoluteDays(o) === 1) return r.yesterday()
    const i = getDayInfoFromDate(o)
    return absoluteDays(e) - absoluteDays(o) < 7
        ? r[i.day]()
        : r.weeks(Math.round((e.getTime() - o.getTime()) / 6048e5))
}
const DefaultAgoTranslations = {
    now: () => 'A few seconds ago',
    seconds: n => `${n} seconds ago`,
    minutes: n => `${n} minutes ago`,
    hours: n => `${n} hours ago`,
    days: n => `${n} days ago`,
    weeks: n => `${n} weeks ago`
}
function getAgo(n, t) {
    const e = t?.now || Date.now(),
        r = t?.translations || DefaultAgoTranslations,
        o = exports.Types.isDate(n) ? n.getTime() : n
    let i = (e - o) / 1e3
    return i < 10
        ? r.now()
        : i < 120
        ? r.seconds(Math.floor(i))
        : ((i /= 60),
          i < 120
              ? r.minutes(Math.floor(i))
              : ((i /= 60),
                i < 48
                    ? r.hours(Math.floor(i))
                    : ((i /= 24), i < 14 ? r.days(Math.floor(i)) : ((i /= 7), r.weeks(Math.floor(i))))))
}
function countCycles(n, t, e) {
    var r, o, i
    const c = ((r = e?.now) !== null && r !== void 0 ? r : Date.now()) - n,
        u = Math.floor(c / t),
        f =
            t / ((o = e?.precision) !== null && o !== void 0 ? o : 1) -
            Math.ceil((c % t) / ((i = e?.precision) !== null && i !== void 0 ? i : 1))
    return { cycles: u, remaining: f }
}
const throttleTimers = {}
function throttle(n, t) {
    return !throttleTimers[n] || Date.now() > throttleTimers[n] ? ((throttleTimers[n] = Date.now() + t), !0) : !1
}
const timeUnits = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }
function timeSince(n, t, e) {
    return (
        (t = isDate(t) ? t.getTime() : t), (e = e ? (isDate(e) ? e.getTime() : e) : Date.now()), (e - t) / timeUnits[n]
    )
}
function getProgress(n, t, e, r) {
    r || (r = Date.now())
    const o = t / e,
        i = r - n,
        s = i / t,
        c = s * e,
        u = c - i
    return { deltaMs: i, progress: o, baseTimeMs: s, totalTimeMs: c, remainingTimeMs: u }
}
const dayNumberIndex = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
}
function mapDayNumber(n) {
    return { zeroBasedIndex: n, day: dayNumberIndex[n] }
}
function getDayInfoFromDate(n) {
    return mapDayNumber(n.getDay())
}
function getDayInfoFromDateTimeString(n) {
    return getDayInfoFromDate(new Date(n))
}
function seconds(n) {
    return n * 1e3
}
function minutes(n) {
    return n * 6e4
}
function hours(n) {
    return n * 36e5
}
const dateUnits = [
    ['ms', 1],
    ['milli', 1],
    ['millis', 1],
    ['millisecond', 1],
    ['milliseconds', 1],
    ['s', 1e3],
    ['sec', 1e3],
    ['second', 1e3],
    ['seconds', 1e3],
    ['m', 6e4],
    ['min', 6e4],
    ['minute', 6e4],
    ['minutes', 6e4],
    ['h', 36e5],
    ['hour', 36e5],
    ['hours', 36e5],
    ['d', 864e5],
    ['day', 864e5],
    ['days', 864e5],
    ['w', 6048e5],
    ['week', 6048e5],
    ['weeks', 6048e5]
]
function makeDate(n) {
    const t = parseFloat(n)
    if (isNaN(t)) throw Error('makeDate got NaN for input')
    const e = n.replace(/^-?[0-9.]+/, '').trim(),
        r = dateUnits.findIndex(o => o[0] === e.toLowerCase())
    return r === -1 ? t : t * dateUnits[r][1]
}
function getPreLine(n) {
    return n.replace(/ +/g, ' ').replace(/^ /gm, '')
}
const tinyCache = {}
async function getCached(n, t, e) {
    const r = Date.now(),
        o = tinyCache[n]
    if (o && o.validUntil > r) return o.value
    const i = await e(),
        s = r + t
    return (tinyCache[n] = { value: i, validUntil: s }), i
}
function joinUrl(...n) {
    return n
        .filter(t => t)
        .join('/')
        .replace(/(?<!:)\/+/g, '/')
}
function replaceBetweenStrings(n, t, e, r, o = !0) {
    const i = n.indexOf(t),
        s = n.indexOf(e, i + t.length)
    if (i === -1 || s === -1) throw Error('Start or end not found')
    return o ? n.substring(0, i + t.length) + r + n.substring(s) : n.substring(0, i) + r + n.substring(s + e.length)
}
function describeMarkdown(n) {
    let t = 'p'
    n.startsWith('#')
        ? ((t = 'h1'), (n = n.slice(1).trim()))
        : n.startsWith('-') && ((t = 'li'), (n = n.slice(1).trim()))
    const e = n[0] === n[0].toUpperCase(),
        r = /[.?!]$/.test(n),
        o = /:$/.test(n)
    return { type: t, isCapitalized: e, hasPunctuation: r, endsWithColon: o }
}
function isBalanced(n, t = '(', e = ')') {
    let r = 0,
        o = 0
    for (; o < n.length; )
        if ((n.startsWith(t, o) ? (r++, (o += t.length)) : n.startsWith(e, o) ? (r--, (o += e.length)) : o++, r < 0))
            return !1
    return t === e ? r % 2 === 0 : r === 0
}
function textToFormat(n) {
    n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    let t = n.length
    for (; (n = n.replace(/(\w+)[\s,']+\w+/g, '$1')), n.length !== t; ) t = n.length
    return (
        (n = n.replaceAll(/[A-Z][a-zA-Z0-9]*/g, 'A')),
        (n = n.replaceAll(/[a-z][a-zA-Z0-9]*/g, 'a')),
        (n = n.replaceAll(/[\u4E00-\u9FA5]+/g, 'Z')),
        n
    )
}
function sortObject(n) {
    const e = Object.keys(n).sort((o, i) => o.localeCompare(i)),
        r = {}
    for (const o of e) r[o] = sortAny(n[o])
    return r
}
function sortArray(n) {
    const t = []
    return (
        n
            .sort((e, r) => JSON.stringify(sortAny(e)).localeCompare(JSON.stringify(sortAny(r))))
            .forEach(e => t.push(sortAny(e))),
        t
    )
}
function sortAny(n) {
    return Array.isArray(n) ? sortArray(n) : isObject(n) ? sortObject(n) : n
}
function deepEquals(n, t) {
    return JSON.stringify(sortAny(n)) === JSON.stringify(sortAny(t))
}
function deepEqualsEvery(...n) {
    for (let t = 1; t < n.length; t++) if (!deepEquals(n[t - 1], n[t])) return !1
    return !0
}
function safeParse(n) {
    try {
        return JSON.parse(n)
    } catch {
        return null
    }
}
function createSequence() {
    let n = 0
    return { next: () => n++ }
}
function createOscillator(n) {
    let t = 0
    return { next: () => n[t++ % n.length] }
}
function createStatefulToggle(n) {
    let t
    return e => {
        const r = e === n && t !== n
        return (t = e), r
    }
}
function organiseWithLimits(n, t, e, r, o) {
    const i = {}
    for (const s of Object.keys(t)) i[s] = []
    ;(i[r] = []), o && (n = n.sort(o))
    for (const s of n) {
        const c = s[e],
            u = t[c] ? c : r
        i[u].length >= t[u] ? i[r].push(s) : i[u].push(s)
    }
    return i
}
function diffKeys(n, t) {
    const e = Object.keys(n),
        r = Object.keys(t)
    return { uniqueToA: e.filter(o => !r.includes(o)), uniqueToB: r.filter(o => !e.includes(o)) }
}
function pickRandomKey(n) {
    const t = Object.keys(n)
    return t[Math.floor(Math.random() * t.length)]
}
function mapRandomKey(n, t) {
    const e = pickRandomKey(n)
    return (n[e] = t(n[e])), e
}
function fromObjectString(n) {
    return (
        (n = n.replace(
            /\r\n/g,
            `
`
        )),
        (n = n.replace(/(\w+)\((.+)\)/g, (t, e, r) => `${e}(${r.replaceAll(',', '&comma;')})`)),
        (n = n.replace(/(,)(\s+})/g, '$2')),
        (n = n.replace(/\.\.\..+?,/g, '')),
        (n = n.replace(/({\s+)([a-zA-Z]\w+),/g, "$1$2: '$2',")),
        (n = n.replace(/(,\s+)([a-zA-Z]\w+),/g, "$1$2: '$2',")),
        (n = n.replace(/:(.+)\?(.+):/g, (t, e, r) => `: (${e.trim()} && ${r.trim()}) ||`)),
        (n = n.replace(/([a-zA-Z0-9]+)( ?: ?{)/g, '"$1"$2')),
        (n = n.replace(/([a-zA-Z0-9]+) ?: ?(.+?)(,|\n|})/g, (t, e, r, o) => `"${e}":"${r.trim()}"${o}`)),
        (n = n.replace(/("'|'")/g, '"')),
        (n = n.replaceAll('&comma;', ',')),
        JSON.parse(n)
    )
}
const thresholds = [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30, 1e9, 1e16, 1e18, 1e18, 1e18, 1e33],
    longNumberUnits = [
        'thousand',
        'million',
        'billion',
        'trillion',
        'quadrillion',
        'quintillion',
        'sextillion',
        'septillion',
        'octillion',
        'nonillion',
        'gwei',
        'bzz',
        'btc',
        'eth',
        'dai',
        'decillion'
    ],
    shortNumberUnits = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'O', 'N', 'gwei', 'bzz', 'eth', 'btc', 'dai', 'D']
function fromDecimals(n, t, e) {
    let r = n.length - t
    if (r <= 0) return '0.' + '0'.repeat(-r) + n + (e ? ' ' + e : '')
    let o = n.substring(0, r),
        i = n.substring(r)
    return o === '' && (o = '0'), o + '.' + i + (e ? ' ' + e : '')
}
function formatNumber(n, t) {
    var e, r
    const o = (e = t?.longForm) !== null && e !== void 0 ? e : !1,
        i = t?.unit ? ` ${t.unit}` : '',
        s = o ? longNumberUnits : shortNumberUnits,
        c = (r = t?.precision) !== null && r !== void 0 ? r : 1
    if (n < thresholds[0]) return `${n}${i}`
    for (let u = 0; u < thresholds.length - 1; u++)
        if (n < thresholds[u + 1]) return `${(n / thresholds[u]).toFixed(c)}${o ? ' ' : ''}${s[u]}${i}`
    return `${(n / thresholds[thresholds.length - 1]).toFixed(c)}${o ? ' ' : ''}${s[thresholds.length - 1]}${i}`
}
function makeNumber(n) {
    const t = parseFloat(n)
    if (isNaN(t)) throw Error('makeNumber got NaN for input')
    const e = n.replace(/^-?[0-9.]+/, '').trim(),
        r = shortNumberUnits.findIndex(o => o.toLowerCase() === e.toLowerCase())
    return r === -1 ? t : t * thresholds[r]
}
function clamp(n, t, e) {
    return n < t ? t : n > e ? e : n
}
function increment(n, t, e) {
    const r = n + t
    return r > e ? e : r
}
function decrement(n, t, e) {
    const r = n - t
    return r < e ? e : r
}
function runOn(n, t) {
    return t(n), n
}
function ifPresent(n, t) {
    n && t(n)
}
function mergeArrays(n, t) {
    const e = Object.keys(t)
    for (const r of e) Array.isArray(t[r]) && Array.isArray(n[r]) && pushAll(n[r], t[r])
}
function empty(n) {
    return n.splice(0, n.length), n
}
function removeEmptyArrays(n) {
    for (const t of Object.keys(n))
        (isEmptyArray(n[t]) || (Array.isArray(n[t]) && n[t].every(e => e == null))) && delete n[t]
    return n
}
function removeEmptyValues(n) {
    for (const t of Object.entries(n))
        (isUndefined(t[1]) || t[1] === null || (isString(t[1]) && isBlank(t[1]))) && delete n[t[0]]
    return n
}
function filterObjectKeys(n, t) {
    const e = {}
    for (const [r, o] of Object.entries(n)) t(r) && (e[r] = o)
    return e
}
function filterObjectValues(n, t) {
    const e = {}
    for (const [r, o] of Object.entries(n)) t(o) && (e[r] = o)
    return e
}
function mapObject(n, t) {
    const e = {}
    for (const r of Object.entries(n)) e[r[0]] = t(r[1])
    return e
}
async function rethrow(n, t) {
    try {
        return await n()
    } catch {
        throw t
    }
}
function setSomeOnObject(n, t, e) {
    typeof e < 'u' && e !== null && (n[t] = e)
}
function setSomeDeep(n, t, e, r) {
    const o = getDeep(e, r)
    typeof o > 'u' || o === null || setDeep(n, t, o)
}
function flip(n) {
    const t = {}
    for (const [e, r] of Object.entries(n)) t[r] = e
    return t
}
function getAllPermutations(n) {
    const t = Object.keys(n),
        e = t.map(c => n[c].length),
        r = e.reduce((c, u) => (c *= u))
    let o = 1
    const i = [1]
    for (let c = 0; c < e.length - 1; c++) (o *= e[c]), i.push(o)
    const s = []
    for (let c = 0; c < r; c++) {
        const u = {}
        for (let f = 0; f < t.length; f++) {
            const l = n[t[f]],
                a = Math.floor(c / i[f]) % l.length
            u[t[f]] = l[a]
        }
        s.push(u)
    }
    return s
}
function countTruthyValues(n) {
    return Object.values(n).filter(t => t).length
}
function getFlatNotation(n, t, e) {
    return n + (e ? '[' + t + ']' : (n.length ? '.' : '') + t)
}
function flattenInner(n, t, e, r, o) {
    if (!isObject(t)) return t
    for (const [i, s] of Object.entries(t)) {
        const c = getFlatNotation(e, i, r)
        Array.isArray(s)
            ? o
                ? flattenInner(n, s, c, !0, o)
                : (n[c] = s.map(u => flattenInner(Array.isArray(u) ? [] : {}, u, '', !1, o)))
            : isObject(s)
            ? flattenInner(n, s, c, !1, o)
            : (n[c] = s)
    }
    return n
}
function flatten(n, t = !1, e) {
    return flattenInner({}, n, e || '', !1, t)
}
function unflatten(n) {
    if (!isObject(n)) return n
    const t = Array.isArray(n) ? [] : {}
    for (const [e, r] of Object.entries(n))
        Array.isArray(r)
            ? setDeep(
                  t,
                  e,
                  r.map(o => unflatten(o))
              )
            : setDeep(t, e, r)
    return t
}
function match(n, t, e) {
    return t[n] ? t[n] : e
}
function indexArray(n, t) {
    const e = {}
    for (const r of n) {
        const o = t(r)
        e[o] = r
    }
    return e
}
function indexArrayToCollection(n, t) {
    const e = {}
    for (const r of n) {
        const o = t(r)
        e[o] || (e[o] = []), e[o].push(r)
    }
    return e
}
function splitBySize(n, t) {
    const e = []
    for (let r = 0; r < n.length; r += t) e.push(n.slice(r, r + t))
    return e
}
function splitByCount(n, t) {
    const e = Math.ceil(n.length / t),
        r = []
    for (let o = 0; o < n.length; o += e) r.push(n.slice(o, o + e))
    return r
}
function tokenizeByLength(n, t) {
    const e = [],
        r = Math.ceil(n.length / t)
    for (let o = 0; o < r; o++) e.push(n.slice(o * t, o * t + t))
    return e
}
function tokenizeByCount(n, t) {
    const e = Math.ceil(n.length / t)
    return tokenizeByLength(n, e)
}
function makeUnique(n, t) {
    return Object.values(indexArray(n, t))
}
function countUnique(n, t, e, r, o) {
    const i = t ? n.map(t) : n,
        s = {}
    for (const u of i) s[u] = (s[u] || 0) + 1
    const c = r ? sortObjectValues(s, o ? (u, f) => u[1] - f[1] : (u, f) => f[1] - u[1]) : s
    return e ? Object.keys(c) : c
}
function sortObjectValues(n, t) {
    return Object.fromEntries(Object.entries(n).sort(t))
}
function transformToArray(n) {
    const t = [],
        e = Object.keys(n),
        r = n[e[0]].length
    for (let o = 0; o < r; o++) {
        const i = {}
        for (const s of e) i[s] = n[s][o]
        t.push(i)
    }
    return t
}
function incrementMulti(n, t, e = 1) {
    for (const r of n) r[t] += e
}
function setMulti(n, t, e) {
    for (const r of n) r[t] = e
}
function group(n, t) {
    const e = []
    let r = []
    return (
        n.forEach((o, i) => {
            ;(i === 0 || !t(o, n[i - 1])) && ((r = []), e.push(r)), r.push(o)
        }),
        e
    )
}
function createBidirectionalMap() {
    return { map: new Map(), keys: [] }
}
function createTemporalBidirectionalMap() {
    return { map: new Map(), keys: [] }
}
function pushToBidirectionalMap(n, t, e, r = 100) {
    if (n.map.has(t)) {
        const o = n.keys.indexOf(t)
        n.keys.splice(o, 1)
    }
    if ((n.map.set(t, e), n.keys.push(t), n.keys.length > r)) {
        const o = n.keys.shift()
        o && n.map.delete(o)
    }
}
function unshiftToBidirectionalMap(n, t, e, r = 100) {
    if (n.map.has(t)) {
        const o = n.keys.indexOf(t)
        n.keys.splice(o, 1)
    }
    if ((n.map.set(t, e), n.keys.unshift(t), n.keys.length > r)) {
        const o = n.keys.shift()
        o && n.map.delete(o)
    }
}
function addToTemporalBidirectionalMap(n, t, e, r, o = 100) {
    pushToBidirectionalMap(n, t, { validUntil: Date.now() + r, data: e }, o)
}
function getFromTemporalBidirectionalMap(n, t) {
    const e = n.map.get(t)
    return e && e.validUntil > Date.now() ? e.data : null
}
function makeAsyncQueue(n = 1) {
    const t = [],
        e = []
    let r = 0
    async function o() {
        if (t.length > 0 && r < n) {
            r++
            const s = t.shift()
            try {
                s && (await s())
            } finally {
                if (--r === 0) for (; e.length > 0; ) e.shift()()
                o()
            }
        }
    }
    async function i() {
        return r
            ? new Promise(s => {
                  e.push(s)
              })
            : Promise.resolve()
    }
    return {
        enqueue(s) {
            t.push(s), o()
        },
        drain: i
    }
}
class Optional {
    constructor(t) {
        this.value = t
    }
    static of(t) {
        return new Optional(t)
    }
    static empty() {
        return new Optional(null)
    }
    map(t) {
        return new Optional(this.value ? t(this.value) : null)
    }
    ifPresent(t) {
        return this.value && t(this.value), this
    }
    orElse(t) {
        var e
        ;((e = this.value) !== null && e !== void 0) || t()
    }
}
exports.Optional = Optional
function findInstance(n, t) {
    const e = n.find(r => r instanceof t)
    return Optional.of(e)
}
function filterInstances(n, t) {
    return n.filter(e => e instanceof t)
}
function interleave(n, t) {
    const e = [],
        r = Math.max(n.length, t.length)
    for (let o = 0; o < r; o++) n[o] && e.push(n[o]), t[o] && e.push(t[o])
    return e
}
function toggle(n, t) {
    return n.includes(t) ? n.filter(e => e !== t) : [...n, t]
}
class Node {
    constructor(t) {
        ;(this.value = t), (this.children = [])
    }
}
function createHierarchy(n, t, e, r, o = !1) {
    const i = new Map(),
        s = []
    n.forEach(u => {
        const f = new Node(u)
        i.set(u[t], f)
    }),
        n.forEach(u => {
            const f = i.get(u[t])
            if (!f) return
            const l = u[e]
            if (l) {
                const a = i.get(l)
                a && a.children.push(f)
            } else s.push(f)
        })
    const c = u => {
        u.children.sort((f, l) => {
            const a = f.value[r],
                h = l.value[r]
            return o ? h - a : a - h
        }),
            u.children.forEach(c)
    }
    return s.forEach(c), s
}
function log2Reduce(n, t) {
    if (Math.log2(n.length) % 1 !== 0) throw new Error('Array length must be a power of 2')
    let e = [...n]
    for (; e.length > 1; ) {
        const r = []
        for (let o = 0; o < e.length; o += 2) {
            const i = e[o + 1]
            r.push(t(e[o], i))
        }
        e = r
    }
    return e[0]
}
function partition(n, t) {
    if (n.length % t !== 0) throw Error('Bytes length must be a multiple of size')
    const e = []
    for (let r = 0; r < n.length; r += t) e.push(n.subarray(r, r + t))
    return e
}
function concatBytes(...n) {
    const t = n.reduce((o, i) => o + i.length, 0),
        e = new Uint8Array(t)
    let r = 0
    return (
        n.forEach(o => {
            e.set(o, r), (r += o.length)
        }),
        e
    )
}
function isPng(n) {
    return n[0] === 137 && n[1] === 80 && n[2] === 78 && n[3] === 71
}
function isJpg(n) {
    return n[0] === 255 && n[1] === 216
}
function isWebp(n) {
    return n[8] === 87 && n[9] === 69 && n[10] === 66 && n[11] === 80
}
function isImage(n) {
    return isPng(n) || isJpg(n) || isWebp(n)
}
function numberToUint64LE(n) {
    const t = new ArrayBuffer(8)
    return new DataView(t).setBigUint64(0, BigInt(n), !0), new Uint8Array(t)
}
function uint64LEToNumber(n) {
    const t = new DataView(n.buffer)
    return Number(t.getBigUint64(0, !0))
}
function numberToUint64BE(n) {
    const t = new ArrayBuffer(8)
    return new DataView(t).setBigUint64(0, BigInt(n), !1), new Uint8Array(t)
}
function uint64BEToNumber(n) {
    const t = new DataView(n.buffer)
    return Number(t.getBigUint64(0, !1))
}
class Uint8ArrayReader {
    constructor(t) {
        ;(this.cursor = 0), (this.buffer = t)
    }
    read(t) {
        const e = this.buffer.subarray(this.cursor, this.cursor + t)
        return (this.cursor += t), e
    }
    max() {
        return this.buffer.length - this.cursor
    }
}
class Uint8ArrayWriter {
    constructor(t) {
        ;(this.buffer = t), (this.cursor = 0)
    }
    write(t) {
        const e = Math.min(this.max(), t.max())
        return this.buffer.set(t.read(e), this.cursor), (this.cursor += e), e
    }
    max() {
        return this.buffer.length - this.cursor
    }
}
class Chunk {
    constructor(t, e, r = 0) {
        ;(this.span = r), (this.writer = new Uint8ArrayWriter(new Uint8Array(t))), (this.hashFn = e)
    }
    build() {
        return concatBytes(numberToUint64LE(this.span), this.writer.buffer)
    }
    hash() {
        const t = log2Reduce(partition(this.writer.buffer, 32), this.hashFn)
        return this.hashFn(numberToUint64LE(this.span), t)
    }
}
function merkleStart(n, t) {
    return [new Chunk(n, t)]
}
async function merkleElevate(n, t, e) {
    await t(n[e]),
        n[e + 1] || n.push(new Chunk(n[e].writer.buffer.length, n[e].hashFn, n[e].span)),
        merkleAppend(n, n[e].hash(), t, e + 1),
        (n[e] = new Chunk(n[e].writer.buffer.length, n[e].hashFn))
}
async function merkleAppend(n, t, e, r = 0) {
    n[r].writer.max() === 0 && (await merkleElevate(n, e, r))
    const o = new Uint8ArrayReader(t)
    for (; o.max() !== 0; ) {
        const i = n[r].writer.write(o)
        if (r === 0) for (let s = 0; s < n.length; s++) n[s].span += i
        n[r].writer.max() === 0 && o.max() > 0 && (await merkleElevate(n, e, r))
    }
    return n
}
async function merkleFinalize(n, t, e = 0) {
    return n[e + 1] ? (await merkleElevate(n, t, e), merkleFinalize(n, t, e + 1)) : (await t(n[e]), n[e])
}
function tickPlaybook(n) {
    if (n.length === 0) return null
    const t = n[0]
    return (
        t.ttlMax ? --t.ttl <= 0 && n.shift() : (t.ttlMax = t.ttl),
        { progress: (t.ttlMax - t.ttl) / t.ttlMax, data: t.data }
    )
}
function getArgument(n, t, e, r) {
    const o = n.findIndex(c => c === `--${t}` || c.startsWith(`--${t}=`)),
        i = n[o]
    if (!i) return (e || {})[r || t || ''] || null
    if (i.includes('=')) return i.split('=')[1]
    const s = n[o + 1]
    return s && !s.startsWith('-') ? s : (e || {})[r || t || ''] || null
}
function getNumberArgument(n, t, e, r) {
    const o = getArgument(n, t, e, r)
    if (!o) return null
    try {
        return makeNumber(o)
    } catch {
        throw new Error(`Invalid number argument ${t}: ${o}`)
    }
}
function getBooleanArgument(n, t, e, r) {
    const o = n.some(u => u.endsWith('-' + t)),
        i = getArgument(n, t, e, r)
    if (!i && o) return !0
    if (!i && !o) return null
    const s = ['true', '1', 'yes', 'y', 'on'],
        c = ['false', '0', 'no', 'n', 'off']
    if (s.includes(i.toLowerCase())) return !0
    if (c.includes(i.toLowerCase())) return !1
    throw Error(`Invalid boolean argument ${t}: ${i}`)
}
function requireStringArgument(n, t, e, r) {
    const o = getArgument(n, t, e, r)
    if (!o) throw new Error(`Missing argument ${t}`)
    return o
}
function requireNumberArgument(n, t, e, r) {
    const o = requireStringArgument(n, t, e, r)
    try {
        return makeNumber(o)
    } catch {
        throw new Error(`Invalid argument ${t}: ${o}`)
    }
}
function bringToFrontInPlace(n, t) {
    const e = n[t]
    n.splice(t, 1), n.unshift(e)
}
function bringToFront(n, t) {
    const e = [...n]
    return bringToFrontInPlace(e, t), e
}
function addPoint(n, t) {
    return { x: n.x + t.x, y: n.y + t.y }
}
function subtractPoint(n, t) {
    return { x: n.x - t.x, y: n.y - t.y }
}
function multiplyPoint(n, t) {
    return { x: n.x * t, y: n.y * t }
}
function normalizePoint(n) {
    const t = Math.sqrt(n.x * n.x + n.y * n.y)
    return { x: n.x / t, y: n.y / t }
}
function pushPoint(n, t, e) {
    return { x: n.x + Math.cos(t) * e, y: n.y + Math.sin(t) * e }
}
function getDistanceBetweenPoints(n, t) {
    return Math.sqrt((n.x - t.x) ** 2 + (n.y - t.y) ** 2)
}
function filterCoordinates(n, t, e = 'row-first') {
    const r = []
    if (e === 'column-first')
        for (let o = 0; o < n.length; o++) for (let i = 0; i < n[0].length; i++) t(o, i) && r.push({ x: o, y: i })
    else for (let o = 0; o < n[0].length; o++) for (let i = 0; i < n.length; i++) t(i, o) && r.push({ x: i, y: o })
    return r
}
function isHorizontalLine(n, t, e) {
    var r, o
    return (
        ((r = n[t + 1]) === null || r === void 0 ? void 0 : r[e]) &&
        ((o = n[t - 1]) === null || o === void 0 ? void 0 : o[e]) &&
        !n[t][e - 1] &&
        !n[t][e + 1]
    )
}
function isVerticalLine(n, t, e) {
    var r, o
    return (
        n[t][e + 1] &&
        n[t][e - 1] &&
        !(!((r = n[t - 1]) === null || r === void 0) && r[e]) &&
        !(!((o = n[t + 1]) === null || o === void 0) && o[e])
    )
}
function isLeftmost(n, t, e) {
    var r
    return !(!((r = n[t - 1]) === null || r === void 0) && r[e])
}
function isRightmost(n, t, e) {
    var r
    return !(!((r = n[t + 1]) === null || r === void 0) && r[e])
}
function isTopmost(n, t, e) {
    return !n[t][e - 1]
}
function isBottommost(n, t, e) {
    return !n[t][e + 1]
}
function getCorners(n, t, e) {
    var r, o, i, s, c, u, f, l
    const a = []
    return n[t][e]
        ? isHorizontalLine(n, t, e) || isVerticalLine(n, t, e)
            ? []
            : (!(!((c = n[t - 1]) === null || c === void 0) && c[e - 1]) &&
                  isLeftmost(n, t, e) &&
                  isTopmost(n, t, e) &&
                  a.push({ x: t, y: e }),
              !(!((u = n[t + 1]) === null || u === void 0) && u[e - 1]) &&
                  isRightmost(n, t, e) &&
                  isTopmost(n, t, e) &&
                  a.push({ x: t + 1, y: e }),
              !(!((f = n[t - 1]) === null || f === void 0) && f[e + 1]) &&
                  isLeftmost(n, t, e) &&
                  isBottommost(n, t, e) &&
                  a.push({ x: t, y: e + 1 }),
              !(!((l = n[t + 1]) === null || l === void 0) && l[e + 1]) &&
                  isRightmost(n, t, e) &&
                  isBottommost(n, t, e) &&
                  a.push({ x: t + 1, y: e + 1 }),
              a)
        : (!((r = n[t - 1]) === null || r === void 0) && r[e] && n[t][e - 1] && a.push({ x: t, y: e }),
          !((o = n[t + 1]) === null || o === void 0) && o[e] && n[t][e - 1] && a.push({ x: t + 1, y: e }),
          !((i = n[t - 1]) === null || i === void 0) && i[e] && n[t][e + 1] && a.push({ x: t, y: e + 1 }),
          !((s = n[t + 1]) === null || s === void 0) && s[e] && n[t][e + 1] && a.push({ x: t + 1, y: e + 1 }),
          a)
}
function findCorners(n, t, e, r) {
    const o = [
        { x: 0, y: 0 },
        { x: e, y: 0 },
        { x: 0, y: r },
        { x: e, y: r }
    ]
    for (let i = 0; i < n.length; i++)
        for (let s = 0; s < n[0].length; s++) {
            const c = getCorners(n, i, s)
            for (const u of c) o.some(f => f.x === u.x && f.y === u.y) || o.push(u)
        }
    return o.map(i => ({ x: i.x * t, y: i.y * t }))
}
function findLines(n, t) {
    const e = filterCoordinates(n, (u, f) => n[u][f] === 0 && n[u][f + 1] !== 0, 'row-first').map(u =>
            Object.assign(Object.assign({}, u), { dx: 1, dy: 0 })
        ),
        r = filterCoordinates(n, (u, f) => n[u][f] === 0 && n[u][f - 1] !== 0, 'row-first').map(u =>
            Object.assign(Object.assign({}, u), { dx: 1, dy: 0 })
        ),
        o = filterCoordinates(
            n,
            (u, f) => {
                var l
                return n[u][f] === 0 && ((l = n[u - 1]) === null || l === void 0 ? void 0 : l[f]) !== 0
            },
            'column-first'
        ).map(u => Object.assign(Object.assign({}, u), { dx: 0, dy: 1 })),
        i = filterCoordinates(
            n,
            (u, f) => {
                var l
                return n[u][f] === 0 && ((l = n[u + 1]) === null || l === void 0 ? void 0 : l[f]) !== 0
            },
            'column-first'
        ).map(u => Object.assign(Object.assign({}, u), { dx: 0, dy: 1 }))
    e.forEach(u => u.y++), i.forEach(u => u.x++)
    const s = group([...o, ...i], (u, f) => u.x === f.x && u.y - 1 === f.y),
        c = group([...r, ...e], (u, f) => u.y === f.y && u.x - 1 === f.x)
    return [...s, ...c]
        .map(u => ({ start: u[0], end: last(u) }))
        .map(u => ({
            start: multiplyPoint(u.start, t),
            end: multiplyPoint(addPoint(u.end, { x: u.start.dx, y: u.start.dy }), t)
        }))
}
function getAngleInRadians(n, t) {
    return Math.atan2(t.y - n.y, t.x - n.x)
}
function getSortedRayAngles(n, t) {
    return t.map(e => getAngleInRadians(n, e)).sort((e, r) => e - r)
}
function getLineIntersectionPoint(n, t, e, r) {
    const o = (r.y - e.y) * (t.x - n.x) - (r.x - e.x) * (t.y - n.y)
    if (o === 0) return null
    let i = n.y - e.y,
        s = n.x - e.x
    const c = (r.x - e.x) * i - (r.y - e.y) * s,
        u = (t.x - n.x) * i - (t.y - n.y) * s
    return (
        (i = c / o),
        (s = u / o),
        i > 0 && i < 1 && s > 0 && s < 1 ? { x: n.x + i * (t.x - n.x), y: n.y + i * (t.y - n.y) } : null
    )
}
function raycast(n, t, e) {
    const r = [],
        o = pushPoint(n, e, 1e4)
    for (const i of t) {
        const s = getLineIntersectionPoint(n, o, i.start, i.end)
        s && r.push(s)
    }
    return r.length
        ? r.reduce((i, s) => {
              const c = getDistanceBetweenPoints(n, s),
                  u = getDistanceBetweenPoints(n, i)
              return c < u ? s : i
          })
        : null
}
function raycastCircle(n, t, e) {
    const o = getSortedRayAngles(n, e),
        i = []
    for (const s of o) {
        const c = raycast(n, t, s - 0.001),
            u = raycast(n, t, s + 0.001)
        c && i.push(c), u && i.push(u)
    }
    return i
}
;(exports.Binary = {
    hexToUint8Array,
    uint8ArrayToHex,
    base64ToUint8Array,
    uint8ArrayToBase64,
    log2Reduce,
    partition,
    concatBytes,
    merkleStart,
    merkleAppend,
    merkleFinalize,
    numberToUint64LE,
    uint64LEToNumber,
    numberToUint64BE,
    uint64BEToNumber
}),
    (exports.Random = { intBetween, floatBetween, chance, signed: signedRandom, makeSeededRng, point: randomPoint }),
    (exports.Arrays = {
        countUnique,
        makeUnique,
        splitBySize,
        splitByCount,
        index: indexArray,
        indexCollection: indexArrayToCollection,
        onlyOrThrow,
        onlyOrNull,
        firstOrThrow,
        firstOrNull,
        shuffle,
        initialize: initializeArray,
        initialize2D: initialize2DArray,
        rotate2D: rotate2DArray,
        containsShape,
        glue,
        pluck,
        pick,
        pickMany,
        pickManyUnique,
        pickWeighted,
        pickRandomIndices,
        pickGuaranteed,
        last,
        pipe,
        makePipe,
        sortWeighted,
        pushAll,
        unshiftAll,
        filterAndRemove,
        merge: mergeArrays,
        empty,
        pushToBucket,
        unshiftAndLimit,
        atRolling,
        group,
        createOscillator,
        organiseWithLimits,
        tickPlaybook,
        getArgument,
        getBooleanArgument,
        getNumberArgument,
        requireStringArgument,
        requireNumberArgument,
        bringToFront,
        bringToFrontInPlace,
        findInstance,
        filterInstances,
        interleave,
        toggle,
        createHierarchy
    }),
    (exports.System = { sleepMillis, forever, scheduleMany, waitFor, expandError }),
    (exports.Numbers = {
        make: makeNumber,
        sum,
        average,
        median,
        getDistanceFromMidpoint,
        clamp,
        range,
        interpolate,
        createSequence,
        increment,
        decrement,
        format: formatNumber,
        fromDecimals,
        asMegabytes,
        convertBytes,
        hexToRgb,
        rgbToHex,
        haversineDistanceToMeters,
        roundToNearest,
        formatDistance
    }),
    (exports.Promises = { raceFulfilled, invert: invertPromise, runInParallelBatches, makeAsyncQueue }),
    (exports.Dates = {
        getTimestamp,
        getAgo,
        countCycles,
        isoDate,
        throttle,
        timeSince,
        dateTimeSlug,
        unixTimestamp,
        fromUtcString,
        fromMillis,
        getProgress,
        humanizeTime,
        humanizeProgress,
        createTimeDigits,
        mapDayNumber,
        getDayInfoFromDate,
        getDayInfoFromDateTimeString,
        seconds,
        minutes,
        hours,
        make: makeDate
    }),
    (exports.Objects = {
        safeParse,
        deleteDeep,
        getDeep,
        setDeep,
        incrementDeep,
        ensureDeep,
        replaceDeep,
        getFirstDeep,
        deepMergeInPlace,
        deepMerge2,
        deepMerge3,
        mapAllAsync,
        cloneWithJson,
        sortObject,
        sortArray,
        sortAny,
        deepEquals,
        deepEqualsEvery,
        runOn,
        ifPresent,
        zip,
        zipSum,
        removeEmptyArrays,
        removeEmptyValues,
        flatten,
        unflatten,
        match,
        sort: sortObjectValues,
        map: mapObject,
        filterKeys: filterObjectKeys,
        filterValues: filterObjectValues,
        rethrow,
        setSomeOnObject,
        setSomeDeep,
        flip,
        getAllPermutations,
        countTruthyValues,
        transformToArray,
        setMulti,
        incrementMulti,
        createBidirectionalMap,
        createTemporalBidirectionalMap,
        pushToBidirectionalMap,
        unshiftToBidirectionalMap,
        addToTemporalBidirectionalMap,
        getFromTemporalBidirectionalMap,
        createStatefulToggle,
        diffKeys,
        pickRandomKey,
        mapRandomKey,
        fromObjectString,
        toQueryString,
        parseQueryString,
        hasKey,
        selectMax,
        reposition,
        unwrapSingleKey
    }),
    (exports.Types = {
        isFunction,
        isObject,
        isStrictlyObject,
        isEmptyArray,
        isEmptyObject,
        isUndefined,
        isString,
        isNumber,
        isBoolean,
        isDate,
        isBlank,
        isId,
        isIntegerString,
        isHexString,
        isUrl,
        isNullable,
        asString,
        asSafeString,
        asNumber,
        asInteger,
        asBoolean,
        asDate,
        asNullableString,
        asEmptiableString,
        asId,
        asTime,
        asArray,
        asObject,
        asNullableObject,
        asNumericDictionary,
        asUrl,
        asNullable,
        enforceObjectShape,
        enforceArrayShape,
        isPng,
        isJpg,
        isWebp,
        isImage
    }),
    (exports.Strings = {
        tokenizeByCount,
        tokenizeByLength,
        searchHex,
        searchSubstring,
        randomHex: randomHexString,
        randomLetter: randomLetterString,
        randomAlphanumeric: randomAlphanumericString,
        randomRichAscii: randomRichAsciiString,
        randomUnicode: randomUnicodeString,
        includesAny,
        slugify,
        enumify,
        escapeHtml,
        decodeHtmlEntities,
        after,
        afterLast,
        before,
        beforeLast,
        betweenWide,
        betweenNarrow,
        getPreLine,
        containsWord,
        containsWords,
        joinUrl,
        getFuzzyMatchScore,
        sortByFuzzyScore,
        splitOnce,
        splitAll,
        randomize,
        expand,
        shrinkTrim,
        capitalize,
        decapitalize,
        csvEscape,
        parseCsv,
        surroundInOut,
        getExtension,
        getBasename,
        normalizeEmail,
        normalizeFilename,
        parseFilename,
        camelToTitle,
        slugToTitle,
        slugToCamel,
        joinHumanly,
        findWeightedPair,
        extractBlock,
        extractAllBlocks,
        replaceBlocks,
        indexOfEarliest,
        lastIndexOfBefore,
        parseHtmlAttributes,
        readNextWord,
        resolveVariables,
        resolveVariableWithDefaultSyntax,
        resolveRemainingVariablesWithDefaults,
        isLetter,
        isDigit,
        isLetterOrDigit,
        isValidObjectPathCharacter,
        insert: insertString,
        indexOfRegex,
        lineMatches,
        linesMatchInOrder,
        represent,
        resolveMarkdownLinks,
        buildUrl,
        isChinese,
        replaceBetweenStrings,
        describeMarkdown,
        isBalanced,
        textToFormat,
        splitFormatting,
        splitHashtags,
        splitUrls,
        route,
        explodeReplace,
        generateVariants,
        hashCode,
        replaceWord,
        replacePascalCaseWords,
        stripHtml,
        breakLine,
        measureTextWidth,
        toLines,
        levenshteinDistance
    }),
    (exports.Assertions = { asEqual, asTrue, asTruthy, asFalse, asFalsy, asEither }),
    (exports.Cache = { get: getCached }),
    (exports.Vector = {
        addPoint,
        subtractPoint,
        multiplyPoint,
        normalizePoint,
        pushPoint,
        filterCoordinates,
        findCorners,
        findLines,
        raycast,
        raycastCircle,
        getLineIntersectionPoint
    })
