
/**
 * Compute months difference and remainder by moving a tempDate forward by whole months
 * until adding one more month would exceed the endDate.
 */
function monthsAndRemainder(startDate, endDate) {
  // total month difference naive
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12
    + (endDate.getMonth() - startDate.getMonth());

  // create a temp date moved forward by `months`
  let temp = new Date(startDate.getTime());
  temp.setMonth(temp.getMonth() + months);

  // If temp is greater than endDate, back off months until temp <= endDate
  while (temp > endDate) {
    months--;
    temp = new Date(startDate.getTime());
    temp.setMonth(temp.getMonth() + months);
  }

  return { months, remainderStart: temp }; // remainderStart is startDate + months
}

/**
 * Format number with leading zeros
 */
function pad(n, width = 2) {
  return String(n).padStart(width, '0');
}

/**
 * Create or reuse the DOM layout for the countdown inside elementId.
 * The structure created:
 * <div class="countdown-container">
 *   <div class="counter"><div class="num">MM</div><div class="label">Months</div></div>
 *   <div class="counter"><div class="num">DD</div><div class="label">Days</div></div>
 *   <div class="counter"><div class="num">HH</div><div class="label">Hours</div></div>
 *   <div class="counter"><div class="num">mm</div><div class="label">Minutes</div></div>
 *   <div class="counter"><div class="num">ss</div><div class="label">Seconds</div></div>
 * </div>
 */
function ensureCountdownElements(container) {
  // If already created, return the number elements
  const existing = container.querySelectorAll('.counter .num');
  if (existing && existing.length === 5) {
    return Array.from(existing);
  }

  // Clear container
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

/**
 * Countdown to an endDate and render into elementId
 * @param {Date} endDate
 * @param {string} elementId
 * @returns {() => void} a function to stop the countdown
 */
function countdown(endDate, elementId) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.warn('countdown: container element not found:', elementId);
    return () => {};
  }

  // Prepare DOM elements (returns array of the .num elements in order)
  const numElements = ensureCountdownElements(container);

  // single interval handle so we can clear later
  let intervalId = 0;

  function updateOnce() {
    const now = new Date();

    if (endDate <= now) {
      // zero out and stop
      numElements[0].textContent = '00';
      numElements[1].textContent = '00';
      numElements[2].textContent = '00';
      numElements[3].textContent = '00';
      numElements[4].textContent = '00';
      if (intervalId) clearInterval(intervalId);
      return;
    }

    // Calculate whole months and a starting point for leftover
    const { months, remainderStart } = monthsAndRemainder(now, endDate);

    // remainder ms after removing months
    const remainderMs = endDate.getTime() - remainderStart.getTime();

    // convert remainderMs into days/hours/minutes/seconds
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

    // Update DOM (format numbers as needed)
    numElements[0].textContent = String(months); // months may be > 99 depending on range; adjust formatting if needed
    numElements[1].textContent = pad(days);
    numElements[2].textContent = pad(hours);
    numElements[3].textContent = pad(minutes);
    numElements[4].textContent = pad(seconds);
  }

  // initial render
  updateOnce();

  // run every second
  intervalId = window.setInterval(updateOnce, 1000);

  // return stop function
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}

/* ---------- Example usage ---------- */
// Calculate target date = 6 months from today
const now = new Date();
const targetDate = new Date(
  now.getFullYear(),
  now.getMonth() + 6,
  now.getDate(),
  now.getHours(),
  now.getMinutes(),
  now.getSeconds()
);

// Start countdown and keep handle if you want to stop later
const stop = countdown(targetDate, 'countdown');

// if you want to stop manually later:
// stop();

