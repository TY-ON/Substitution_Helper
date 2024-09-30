import '../App.css';
import { useState } from 'react'
import { zip, replaceAt } from '../Utils/Util.js'
import { CipherMenu } from './monoAlphabetic.js'


function Vegenere() {
    /** get known data from Cipher_Menu
     * Cipher Text, Algorithm
     */
    const [cipher_text, set_cipher_text] = useState("");
    const get_cipher_data = child_data => {
      set_cipher_text(child_data);
    };
    
    /** get controlled data set by user
     * mapping texts
     */
    const [substitution_mapper, set_substitution_mapper] = useState(
      ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", 
        "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
    );
    const get_controlled_data = child_data => {
      set_substitution_mapper(child_data);
    };
  
  
    return (
      <div className="Vegenere">
        <div id="wrapper">
          <div id='text_box'>
            <CipherMenu
              cipher_algorithm={"Vegenere Cipher"}
              getData={get_cipher_data}
            />
          </div>
        </div>
      </div>
    );
}

export default Vegenere;