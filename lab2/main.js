let math = require('mathjs');

// <------------- Варіант 318 --------------->

const X1_MIN = 20
const X1_MAX = 70
const X2_MIN = -15
const X2_MAX = 45
const Y_MIN = -2880
//const Y_MAX = -2980

// <------------------- корисні функції ------------------>

y = () => parseInt(Math.random() * 100, 10) + Y_MIN;

// наші y
y_arr = () => [y(), y(), y(), y(), y()];

round = (x, m = 100) => Math.round(x * m) / m
average = arr => round(arr.reduce((a, b) => a + b, 0) / arr.length);

// дисперсія по рядку
dispersion = y_arr => {
    let average2 = average(y_arr);
    return average(y_arr.map(item => (item - average2) * (item - average2)));
}

// <----------------- будуємо вихідну таблицю -------------------->

let tab = [
    ["X1", "X2", "Y1", "Y2", "Y3", "Y4", "Y5", "Y_aver", "dispersion", '%'],
    [X1_MIN, X2_MIN, ...y_arr()],
    [X1_MAX, X2_MIN, ...y_arr()],
    [X1_MIN, X2_MAX, ...y_arr()]
]

// отримати масив y_arr
get_arr = (n) => tab[n].slice(2, 7)

// заповнюємо поле Y_aver
tab.slice(1).map((arr, i) => arr.push(average(get_arr(i + 1))))

// шукаємо дисперсію
tab.slice(1).map((arr, i) => arr.push(dispersion(get_arr(i + 1))))

// відсоток дисперсії
let dis_aver = [...tab.slice(1).map(arr => arr[8])].reduce((a, b) => a + b, 0)
tab.slice(1).map(arr => arr.push(round(arr[8] / dis_aver)))

// Кохрена
// менші критерій 7933 / 1000

// формула Романовського
// sqrt( 2(2 * 5 - 2) / 5(5 - 4) ) = 1.79
romanovsky = (q_1, q_2, q_3) => {
    return [Math.abs(3 / 5 * (q_1 / q_2) - 1) / 1.79 < 2.16,
        Math.abs(3 / 5 * (q_3 / q_1) - 1) / 1.79 < 2.16,
        Math.abs(3 / 5 * (q_3 / q_2) - 1) / 1.79 < 2.16].every(Boolean)
}

// <-------------------- Розрахунок нормованих коефіцієнтів рівняння регресії. -------------------->
norm_coefficient = () => {
    let mx1 = (tab[1][0] + tab[2][0] + tab[3][0]) / 3
    let mx2 = (tab[1][1] + tab[2][1] + tab[3][1]) / 3
    let my = ([tab[1][7] + tab[2][7] + tab[3][7]]) / 3
    let a1 = (tab[1][0] * tab[1][0] + tab[2][0] * tab[2][0] + tab[3][0] * tab[3][0]) / 3
    let a2 = (tab[1][0] * tab[1][1] + tab[2][0] * tab[2][1] + tab[3][0] * tab[3][1]) / 3
    let a3 = (tab[1][1] * tab[1][1] + tab[2][1] * tab[2][1] + tab[3][1] * tab[3][1]) / 3
    let a11 = ([tab[1][7] * tab[1][0] + tab[2][7] * tab[2][0] + tab[3][7] * tab[3][0]]) / 3
    let a22 = ([tab[1][7] * tab[1][1] + tab[2][7] * tab[2][1] + tab[3][7] * tab[3][1]]) / 3
    let denominator = math.det([[1, mx1, mx2], [mx1, a1, a2], [mx2, a2, a3]])
    let b0 = math.det([[my, mx1, mx2], [a11, a1, a2], [a22, a2, a3]]) / denominator
    let b1 = math.det([[1, my, mx2], [mx1, a11, a2], [mx2, a22, a3]]) / denominator
    let b2 = math.det([[1, mx1, my], [mx1, a1, a11], [mx2, a2, a22]]) / denominator

    console.log('Нормоване рівняння регресії: y = '
        + round(b0, 1000) + ' + ' +  round(b1, 1000) + 'x1 + ' +  round(b2, 1000) + 'x2')
    // todo

    let delta_x1 = Math.abs(X1_MAX - X1_MIN) / 2
    let delta_x2 = Math.abs(X2_MAX - X2_MIN) / 2

    let x10 = (X1_MAX + X1_MIN) / 2
    let x20 = (X2_MAX + X2_MIN) / 2

    let a_0 = b0 - (b1 * x10 / delta_x1) - (b2 * x20 / delta_x2)
    let a_1 = b1 / delta_x1
    let a_2 = b2 / delta_x2

    console.log('Натуралізоване рівняння регресії: y = ' +
        round(a_0, 1000) + ' + ' +  round(a_1, 1000) + 'x1 + ' +  round(a_2, 1000) + 'x2')

    console.log('Перевірка:')
    console.table([
        ['y_нормальне', 'y_aver', 'y_натуралізоване'],
        [round(b0 + b1 * tab[1][0] + b2 * tab[1][1]), tab[1][7], round(a_0 + a_1 * tab[1][0] + a_2 * tab[1][1])],
        [round(b0 + b1 * tab[2][0] + b2 * tab[2][1]), tab[2][7], round(a_0 + a_1 * tab[2][0] + a_2 * tab[2][1])],
        [round(b0 + b1 * tab[3][0] + b2 * tab[3][1]), tab[3][7], round(a_0 + a_1 * tab[3][0] + a_2 * tab[3][1])]
    ])
}


// <-------------------- вивід даних ------------------------>

// таблиця в студію
console.table(tab)

// Критерій Романовського
console.log('експеримент проведено ' + (romanovsky(tab[1][8], tab[2][8], tab[3][8]) ? 'нормально' : 'ненормально'));

// нормальне рівняння
norm_coefficient()

