'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-04-01T14:11:59.604Z',
    '2021-04-02T17:01:17.194Z',
    '2021-04-08T23:36:17.929Z',
    '2021-04-10T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// Updating Function
function updateDisplays(account) {
  // Display Movements
  displayMovements(account);

  // Display Balance
  calcDisplayBalance(account);

  // Display Summary
  calcDisplaySummary(account);
}

function createUsernames(accs) {
  accs.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0]) //== Really important use of a map method.
      .join('');
  });
}

function formatMovementDate(date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.floor(Math.abs(date2 - date1) / (24 * 60 * 60 * 1000));

  const daysDifference = calcDaysPassed(date, new Date());
  console.log(daysDifference);

  if (daysDifference === 0) return 'TODAY';
  else if (daysDifference === 1) return 'YESTERDAY';
  else if (daysDifference <= 7) return `${daysDifference} Days Ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
}

function formatCurrency(value, locale, currency, signDisplay = 'auto') {
  const options = {
    style: 'currency',
    currency: currency,
    signDisplay: signDisplay,
  };

  const formattedCurrency = new Intl.NumberFormat(locale, options).format(
    value
  );
  return formattedCurrency;
}

function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov < 0 ? 'withdrawal' : 'deposit';
    const formattedMov = formatCurrency(
      mov,
      currentAccount.locale,
      currentAccount.currency
    );

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
  `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

function calcDisplayBalance(acc) {
  acc.balance = acc.movements.reduce(
    (accumulator, currentVal) => accumulator + currentVal
  );
  const formattedNumber = formatCurrency(
    acc.balance,
    currentAccount.locale,
    currentAccount.currency
  );
  labelBalance.textContent = `${formattedNumber}`;
  // labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
}

function calcDisplaySummary(acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, currentMov) => acc + currentMov, 0);
  labelSumIn.textContent = `${formatCurrency(
    incomes,
    currentAccount.locale,
    currentAccount.currency
  )}`;
  // labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const payments = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, currentMov) => acc + currentMov, 0);
  labelSumOut.textContent = `${formatCurrency(
    payments,
    currentAccount.locale,
    currentAccount.currency,
    'never'
  )}`;
  // labelSumOut.textContent = `${Math.abs(payments).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(int => (int * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, currentInt) => acc + currentInt, 0);
  labelSumInterest.textContent = `${formatCurrency(
    interest,
    currentAccount.locale,
    currentAccount.currency
  )}`;
  // labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

createUsernames(accounts);

const startLogOutTimer = function () {
  // 5 minutes in milliseconds ? because of Intl formatting
  let time = 50000;

  const tick = function () {
    const formattedTime = new Intl.DateTimeFormat(currentAccount.locale, {
      minute: '2-digit',
      second: '2-digit',
    }).format(time);

    // When 0 second, stop timer and log out user.
    if (time === 0) {
      containerApp.style.opacity = '0';
      labelWelcome.textContent = `Log in to get started`;
      clearInterval(time);
    }

    // Decrease 1 second in milliseconds
    time -= 1000;

    // In each call, print the remaining time to UI
    labelTimer.textContent = formattedTime;
  };

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//  NOTE Event Handlers
let currentAccount, timer;

// Fake always logged in
currentAccount = account1;
updateDisplays(currentAccount);
containerApp.style.opacity = 100;

// NOTE Login Button
btnLogin.addEventListener('click', function (event) {
  // Prevent form from submitting.
  event.preventDefault();

  // Finding the currentAccount via username input.
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and Welcome Message
    const firstName = currentAccount.owner.split(' ')[0];
    labelWelcome.textContent = `Welcome back, ${firstName}!`;
    containerApp.style.opacity = '100';

    // Check if there is a timer that is running and clear timer (Reset)
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Create current date and time
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
    };
    // Getting location information from the account object.
    const locale = currentAccount.locale;

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update
    updateDisplays(currentAccount);
  }
});

// NOTE Transfer Money Button
btnTransfer.addEventListener('click', function (event) {
  // Prevent form from submitting.
  event.preventDefault();

  // Get the account which the money will be transfered to
  const accTransferTo = accounts.find(
    account => account.username === inputTransferTo.value
  );
  const transferAmount = +inputTransferAmount.value;

  // Transaction Confirmation
  // Rules : Amount has to be bigger than 0, person has to be defined, transfer has to be lower than balance
  // and cannot transfer to self.
  if (
    transferAmount > 0 &&
    accTransferTo &&
    transferAmount <= currentAccount.balance &&
    accTransferTo !== currentAccount
  ) {
    // Adding the new movements to users.
    accTransferTo.movements.push(transferAmount);
    currentAccount.movements.push(transferAmount * -1);

    // Add transfer date
    accTransferTo.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update
    updateDisplays(currentAccount);
  }

  // Clear Input Fields
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();

  // Reset Timer
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
});

// NOTE Loan Button
btnLoan.addEventListener('click', function (event) {
  // Prevent form from submitting.
  event.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  const loanLimit = +inputLoanAmount.value / 10;

  // There should be a deposit that is larger than the 10% of the loan amount
  if (amount > 0 && currentAccount.movements.some(mov => mov >= loanLimit)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateDisplays(currentAccount);
    }, 3000);
  }

  // Clear Field
  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  // Reset Timer
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
});

// NOTE Close Account Button
btnClose.addEventListener('click', function (event) {
  // Prevent form from submitting.
  event.preventDefault();

  // Check for identity confirmation for account deletion
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    // Deleting the current account from accounts list
    const accIndex = accounts.findIndex(acc => currentAccount === acc);
    accounts.splice(accIndex, 1);

    // Reset UI
    containerApp.style.opacity = '0';
    labelWelcome.textContent = `Log in to get started`;
  }

  // Clear Input Fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

let sorted = false;
// Note Sort Button
btnSort.addEventListener('click', function (event) {
  event.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
