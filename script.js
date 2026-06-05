"use strict";

import {
  greet,
  add,
  multiply,
  sumAll,
  createUserInfo,
  createObject
} from "./utils.js";

import {
  user,
  numbers1,
  numbers2,
  users
} from "./data.js";

console.log("Модульний код підключено!");

const app = document.getElementById("app");

// Виклик функцій з модуля utils.js
const greeting = greet("Студент");
const addResult = add(10, 5);
const multiplyResult = multiply(10, 5);

// Деструктуризація об'єкта
const { name, age, city, profession } = user;

// Шаблонний рядок
const userInfo = `Користувач: ${name}, вік: ${age}, місто: ${city}, професія: ${profession}`;

// Spread оператор
const combinedNumbers = [...numbers1, ...numbers2];

// Rest оператор
const totalSum = sumAll(1, 2, 3, 4, 5, 6);

// Enhanced object literals
const newUser = createObject("Вадим", 19, "Київ");

// Spread для копіювання масиву об'єктів
const allUsers = [...users, { ...newUser, profession: "Розробник" }];

// Вивід у консоль
console.log(greeting);
console.log("10 + 5 =", addResult);
console.log("10 * 5 =", multiplyResult);
console.log(userInfo);
console.log("Об'єднаний масив:", combinedNumbers);
console.log("Сума:", totalSum);
console.log("Новий користувач:", newUser);
console.log("Список користувачів:", allUsers);

// Вивід на сторінку
app.innerHTML = `
  <h3>Результати роботи програми</h3>

  <p>${greeting}</p>
  <p>10 + 5 = ${addResult}</p>
  <p>10 * 5 = ${multiplyResult}</p>
  <p>${userInfo}</p>
  <p>Об'єднаний масив: ${combinedNumbers.join(", ")}</p>
  <p>Сума чисел: ${totalSum}</p>

  <h3>Список користувачів</h3>
  <ul>
    ${allUsers.map(createUserInfo).map(info => `<li>${info}</li>`).join("")}
  </ul>

  <h3>JSON результат</h3>
  <pre>${JSON.stringify(allUsers, null, 2)}</pre>
`;