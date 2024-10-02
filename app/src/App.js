import './App.css';
import { useState } from 'react';
import MonoAlphabetic from './Ciphers/monoAlphabetic.js';
import Vigenere from './Ciphers/vigenere.js';

function CipherLoader( { cipher_algorithm } ) {
  if (cipher_algorithm === "Mono") {
    return (<MonoAlphabetic />);
  }
  if (cipher_algorithm === "Vigenere") {
    return (<Vigenere />);
  }
  return (<></>);
}

function App() {
  const [cipher_algorithm, set_cipher_algorithm] = useState("Mono");

  const get_cipher_algorithm = (event) => {
    set_cipher_algorithm(event.target.value);
  };

  return (
    <div id="app">
      <header>
        <h3>Substitution helper</h3>
        <input type="button" value="Mono" onClick={get_cipher_algorithm}></input>
        <input type="button" value="Vigenere" onClick={get_cipher_algorithm}></input>
      </header>
      <CipherLoader
        cipher_algorithm={cipher_algorithm}
      />
    </div>
  );
}

export default App;
