
/**
 * Compute months difference and remainder by moving a tempDate forward by whole months
 * until adding one more month would exceed the endDate.
 */
function monthsAndRemainder(startDate, endDate) {
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12
    + (endDate.getMonth() - startDate.getMonth());

  let temp = new Date(startDate.getTime());
  temp.setMonth(temp.getMonth() + months);

  while (temp > endDate) {
    months--;
    temp = new Date(startDate.getTime());
    temp.setMonth(temp.getMonth() + months);
  }

  return { months, remainderStart: temp };
}

function pad(n, width = 2) {
  return String(n).padStart(width, '0');
}

function ensureCountdownElements(container) {
  const existing = container.querySelectorAll('.counter .num');
  if (existing && existing.length === 5) return Array.from(existing);

  container.innerHTML = '';
  container.className = 'countdown-container flex gap-3 items-center';

  const labels = ['Months', 'Days', 'Hours', 'Minutes', 'Seconds'];
  const elements = [];

  for (let i = 0; i < labels.length; i++) {
    const counter = document.createElement('div');
    counter.className = 'counter flex flex-col items-center';

    const num = document.createElement('div');
    num.className = 'num text-5xl font-bold mb-3';
    num.textContent = '00';

    const lbl = document.createElement('div');
    lbl.className = 'label text-sm';
    lbl.textContent = labels[i];

    counter.appendChild(num);
    counter.appendChild(lbl);
    container.appendChild(counter);

    elements.push(num);
  }

  return elements;
}

function countdown(endDate, elementId) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.warn('countdown: container element not found:', elementId);
    return () => {};
  }

  const numElements = ensureCountdownElements(container);
  let intervalId;

  function updateOnce() {
    const now = new Date();

    if (endDate <= now) {
      numElements.forEach((el) => (el.textContent = '00'));
      if (intervalId) clearInterval(intervalId);
      return;
    }

    const { months, remainderStart } = monthsAndRemainder(now, endDate);
    const remainderMs = endDate.getTime() - remainderStart.getTime();

    const MS_IN_SEC = 1000;
    const MS_IN_MIN = MS_IN_SEC * 60;
    const MS_IN_HOUR = MS_IN_MIN * 60;
    const MS_IN_DAY = MS_IN_HOUR * 24;

    const days = Math.floor(remainderMs / MS_IN_DAY);
    let left = remainderMs - days * MS_IN_DAY;

    const hours = Math.floor(left / MS_IN_HOUR);
    left -= hours * MS_IN_HOUR;

    const minutes = Math.floor(left / MS_IN_MIN);
    left -= minutes * MS_IN_MIN;

    const seconds = Math.floor(left / MS_IN_SEC);

    numElements[0].textContent = String(months);
    numElements[1].textContent = pad(days);
    numElements[2].textContent = pad(hours);
    numElements[3].textContent = pad(minutes);
    numElements[4].textContent = pad(seconds);
  }

  updateOnce();
  intervalId = window.setInterval(updateOnce, 1000);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}

/* ---------- Example usage ---------- */
// Fixed site-wide target date
const targetDate = new Date('2026-06-12T00:00:00'); // everyone sees the same countdown
countdown(targetDate, 'countdown');
