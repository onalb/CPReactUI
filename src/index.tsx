import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// var exec = require('child_process').exec;
import * as child from 'child_process';

// killUI().then(function(){

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
  
  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
// })



// async function killUI() {
//   return await child.exec("npx kill-port 3000", async function(err: any, stdout: any, stderr: any) {
//     // React to callback
//     console.log(err)
//     console.log(stdout)
//     console.log(stderr)
//     // insertMessage("info15", err)
//     // insertMessage("info16", stdout)
//     // insertMessage("info17", stderr)
//     return;
//   });
// }