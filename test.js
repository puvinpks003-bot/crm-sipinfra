const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

setTimeout(() => {
  const window = dom.window;
  const document = window.document;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const btn = document.getElementById('login-btn');

  emailInput.value = 'caller@sipinfra.in';
  passwordInput.value = 'demo1234';

  console.log('Clicking login...');
  btn.click();
  
  setTimeout(() => {
     console.log('App active:', document.getElementById('app-screen').classList.contains('active'));
     console.log('Login active:', document.getElementById('login-screen').classList.contains('active'));
  }, 1000);
}, 1000);
