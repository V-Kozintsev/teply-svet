const endpoint = 'https://formspree.io/f/mzeznykb';

const form = document.querySelector('#feedback-form');
const status = document.querySelector('#form-status');
const submit = form.querySelector('button[type="submit"]');
const confirmation = document.querySelector('#confirmation');
document.querySelector('#confirmation-close').addEventListener('click', () => confirmation.close());

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showStatus('');

  const message = form.elements.message;
  const level = form.elements.level;
  message.value = message.value.trim();
  message.setAttribute('aria-invalid', 'false');
  level.setAttribute('aria-invalid', 'false');

  if (message.value.length < 5) {
    message.setAttribute('aria-invalid', 'true');
    showStatus('Напишите хотя бы несколько слов об игре.', true);
    message.focus();
    return;
  }
  if (
    level.value &&
    (!Number.isInteger(Number(level.value)) || Number(level.value) < 1 || Number(level.value) > 26)
  ) {
    level.setAttribute('aria-invalid', 'true');
    showStatus('Номер уровня должен быть от 1 до 26.', true);
    level.focus();
    return;
  }
  if (!endpoint) {
    showStatus('Форма скоро заработает. Пока сохраните отзыв и попробуйте позже.', true);
    return;
  }

  submit.disabled = true;
  submit.querySelector('span:first-child').textContent = 'Отправляем…';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    form.reset();
    confirmation.showModal();
  } catch {
    showStatus('Не удалось отправить отзыв. Проверьте соединение и попробуйте ещё раз.', true);
  } finally {
    submit.disabled = false;
    submit.querySelector('span:first-child').textContent = 'Отправить отзыв';
  }
});
