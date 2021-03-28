// Варіант 318

const X1_MIN = 20
const X1_MAX = 70
const X2_MIN = -15
const X2_MAX = 45
const X3_MIN = 20
const X3_MAX = 35


// <------------------- корисні функції ------------------>

const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
const Xcp_max = average([X1_MAX, X2_MAX, X3_MAX])
const Xcp_min = average([X1_MIN, X2_MIN, X3_MIN])

const y_rand = () => parseInt(Math.random() * (Xcp_max - Xcp_min), 10) + 200;
const sum = arr => arr.reduce((a, b) => a + b, 0)

// детермінант
const det = m =>
    m.length === 1 ?
        m[0][0] :
        m.length === 2 ?
            m[0][0] * m[1][1] - m[0][1] * m[1][0] :
            m[0].reduce((r, e, i) =>
                r + (-1) ** (i + 2) * e * det(m.slice(1).map(c =>
                    c.filter((_, j) => i !== j))), 0)

// <------------------- таблиця ------------------------------>
let Tab = {
    tab: [
        ["x1", "x2", "x3", "Y1", "Y2", "y3"],
        [X1_MIN, X2_MIN, X3_MIN, y_rand(), y_rand(), y_rand()],
        [X1_MIN, X2_MAX, X3_MAX, y_rand(), y_rand(), y_rand()],
        [X1_MAX, X2_MIN, X3_MAX, y_rand(), y_rand(), y_rand()],
        [X1_MAX, X2_MAX, X3_MIN, y_rand(), y_rand(), y_rand()],
    ],
    get_x_col: n => Tab.tab.slice(1).map(arr => arr[n - 1]),
    get_x_line: n => Tab.tab[n].slice(0, 3),
    get_y_col: n => Tab.tab.slice(1).map(arr => arr[n + 2]),
    get_y_line: n => Tab.tab[n].slice(3)
}

console.table(Tab.tab)

// Знайдемо середні значення функції відгуку за рядками:
let y_aver = [1, 2, 3, 4].map(i => average(Tab.get_y_line(i)))
let mx1 = average(Tab.get_x_col(1))
let mx2 = average(Tab.get_x_col(2))
let mx3 = average(Tab.get_x_col(3))

let my = average(y_aver)

let a1 = average(Tab.get_x_col(1).map((x, i) => x * y_aver[i]))
let a2 = average(Tab.get_x_col(2).map((x, i) => x * y_aver[i]))
let a3 = average(Tab.get_x_col(3).map((x, i) => x * y_aver[i]))

let a11 = average(Tab.get_x_col(1).map(x => x * x))
let a22 = average(Tab.get_x_col(2).map(x => x * x))
let a33 = average(Tab.get_x_col(3).map(x => x * x))

let a12 = average(Tab.get_x_col(1).map((x, i) => Tab.get_x_col(2)[i]))
let a13 = average(Tab.get_x_col(1).map((x, i) => Tab.get_x_col(3)[i]))
let a23 = average(Tab.get_x_col(2).map((x, i) => Tab.get_x_col(3)[i]))

let denominator = det([
    [1, mx1, mx2, mx3],
    [mx1, a11, a12, a13],
    [mx2, a12, a22, a23],
    [mx3, a13, a23, a33]
])

let B = {
    b0 : det([
        [my, mx1, mx2, mx3],
        [a1, a11, a12, a13],
        [a2, a12, a22, a23],
        [a3, a13, a23, a33]
    ]) / denominator,

    b1 : det([
        [1, my, mx2, mx3],
        [mx1, a1, a12, a13],
        [mx2, a2, a22, a23],
        [mx3, a3, a23, a33]
    ]) / denominator,

    b2 : det([
        [1, mx1, my, mx3],
        [mx1, a11, a1, a13],
        [mx2, a12, a2, a23],
        [mx3, a13, a3, a33]
    ]) / denominator,

    b3 : det([
        [1, mx1, mx2, my],
        [mx1, a11, a12, a1],
        [mx2, a12, a22, a2],
        [mx3, a13, a23, a3]
    ]) / denominator
}
// отримали рівняння регресії
console.log(`y = ${B.b0} + ${B.b1} * x1 + ${B.b2} * x2 + ${B.b3} * x3`)

// перевірка рівняння регресії
const y = n => sum(
    Tab.get_x_line(n)
    .map((x, i) => Object.values(B)[i + 1] * x))
    + Object.values(B)[0]

// таблиця порівняння значення факторів з матриці планування
// і порівняємо результат з середніми значеннями функції
// відгуку за рядками
console.log("перевірка рівняння регресії")
console.table([
    ["y1", "y2", "y3", "y4"],
    y_aver,
    [y(1), y(2), y(3), y(4)]
])

console.log("<------------ Перевірка однорідності дисперсії за критерієм Кохрена: ------------->")

// Знайдемо дисперсії по рядках:
const s = n => average(
    Tab.get_y_line(n)
    .map(y => (y - y_aver[n - 1]) * (y - y_aver[n - 1])))

const S = [1, 2, 3, 4].map(s)

const Gp = Math.max(...S) / sum(S)

// перевірка однорідності дисперсії
if (Gp < 0.7679) {
    console.log("Дисперсія однорідна")
} else {
    console.log("Дисперсія не однорідна")
}

console.log("<--------------- Далі оцінимо значимість коефіцієнтів регресії згідно критерію Стьюдента --->")
let S_b = Math.sqrt(average(S) / 12)

const T = {
    t0 : Math.abs(average([1, 1, 1, 1].map((x, i) => y_aver[i] * x)) / S_b),
    t1 : Math.abs(average([-1, -1, 1, 1].map((x, i) => y_aver[i] * x)) / S_b),
    t2 : Math.abs(average([-1, 1, -1, 1].map((x, i) => y_aver[i] * x)) / S_b),
    t3 : Math.abs(average([-1, 1, 1, -1].map((x, i) => y_aver[i] * x)) / S_b)
}

console.table(T)

// значимі коефіенти
const cof = (Object.keys(T).filter(k => T[k] > 2.306));
console.log(`Значимі коефіціенти: ${cof}`)

// творіння формули з значними коефіціентами
const y_ = n => sum(
    cof
    .map(t => parseInt(t.slice(1)))
    .map(i => B[`b${i}`] * (Tab.get_x_col(i)[n] | 1)))

const y__ = [y_(1), y_(2), y_(3), y_(4)]

console.table([
    ["y1^", "y2^", "y3^", "y4^"],
    y__
])

console.log("<------------------------------------ Критерій Фішера --------------------------->")

const d = cof.length

const S_ad = 3 / (4 - d) * sum(
    y__.map((y_, i) => {
        return (y_ - y_aver[i]) * (y_ - y_aver[i])
    }))

if (S_ad / S_b > 4.5) {
    console.log("рівняння регресії адекватно оригіналу" +
        " при рівні значимості 0.05")
} else {
    console.log(", рівняння регресії неадекватно оригіналу" +
        " при рівні значимості 0.05")
}

