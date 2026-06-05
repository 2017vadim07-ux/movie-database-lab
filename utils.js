"use strict";

export function greet(name = "Гість") {
  return `Привіт, ${name}!`;
}

export const add = function(a = 0, b = 0) {
  return a + b;
};

export const multiply = (a = 1, b = 1) => a * b;

export const sumAll = (...numbers) => {
  return numbers.reduce((sum, number) => sum + number, 0);
};

export const createUserInfo = ({ name, age, city, profession }) => {
  return `Користувач: ${name}, вік: ${age}, місто: ${city}, професія: ${profession}`;
};

export const createObject = (name, age, city) => ({
  name,
  age,
  city
});