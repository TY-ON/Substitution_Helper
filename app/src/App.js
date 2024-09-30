import './App.css';
import { useState } from 'react';
import MonoAlphabetic from './Ciphers/monoAlphabetic.js';
import Vegenere from './Ciphers/vegenere.js';

function CipherLoader( { cipher_algorithm } ) {
  console.log(cipher_algorithm);
  if (cipher_algorithm === "Mono") {
    return (<MonoAlphabetic />);
  }
  if (cipher_algorithm === "Vegenere") {
    return (<Vegenere />);
  }
  return (<></>);
}

function App() {
  const [cipher_algorithm, set_cipher_algorithm] = useState("Mono");

  const get_cipher_algorithm = (event) => {
    console.log(event.target.value);
    set_cipher_algorithm(event.target.value);
  };

  return (
    <div id="app">
      <header>
        <h3>Substitution helper</h3>
        <input type="button" value="Mono" onClick={get_cipher_algorithm}></input>
        <input type="button" value="Vegenere" onClick={get_cipher_algorithm}></input>
      </header>
      <CipherLoader
        cipher_algorithm={cipher_algorithm}
      />
    </div>
  );
}

export default App;
