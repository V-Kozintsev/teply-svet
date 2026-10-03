import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLanguage, translateText } from '../src/language.ts';
import { glassLevels } from '../resources/references/ui-review/glass-energy.js';

test('manual language wins over the platform, which wins over browser language', () => {
  assert.equal(resolveLanguage(null, 'en', 'ru-RU'), 'en');
  assert.equal(resolveLanguage(null, 'ru', 'en-US'), 'ru');
  assert.equal(resolveLanguage('ru', 'en', 'en-US'), 'ru');
  assert.equal(resolveLanguage('en', 'ru', 'ru-RU'), 'en');
  assert.equal(resolveLanguage(null, undefined, 'ru-RU'), 'ru');
  assert.equal(resolveLanguage(null, 'tr', 'ru-RU'), 'en');
  assert.equal(resolveLanguage('invalid', undefined, 'de-DE'), 'en');
});

test('all current level names have English translations without changing authored data', () => {
  const before = JSON.stringify(glassLevels);
  for (const level of glassLevels) {
    assert.doesNotMatch(translateText(level.name, 'en'), /[А-Яа-яЁё]/);
    assert.equal(translateText(level.name, 'ru'), level.name);
  }
  assert.equal(JSON.stringify(glassLevels), before);
});

test('dynamic counters, accessibility labels and labels preserve their values', () => {
  const samples = [
    ['Купить 1 подсказку за 5 звёзд', 'Buy 1 hint for 5 stars'],
    ['Предохранитель через 19 мин', 'Next fuse in 19 min'],
    ['Уровень 23. Дальний рычаг', 'Level 23. The Distant Lever'],
    ['Запас энергии: 3 из 6 секций', 'Charge: 3 of 6 bars'],
    ['Бесплатная через 2 ч 15 мин', 'Free in 2 h 15 min'],
    ['Переключить бирюзовый рычаг: строка 3, столбец 1', 'Toggle cyan lever: row 3, column 1'],
  ];
  for (const [source, target] of samples) {
    assert.equal(translateText(source, 'en'), target);
    assert.equal(translateText(source, 'ru'), source);
  }
});
