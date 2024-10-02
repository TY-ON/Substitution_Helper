import '../App.css';
import { useState, useEffect } from 'react'
import { replaceAt, zip, extract_nth } from '../Utils/Util.js'
import { CipherMenu, CompareText, ControllerTable } from './monoAlphabetic.js'

function Board({ cipher_text, substitution_mapper, slice_length }) {
  const [word_break, set_word_break] = useState("20");
  const get_word_break = event => {
    if (event.target.value < 10) {
      set_word_break(10);
    }
    else{
      set_word_break(event.target.value);
    }
  };

  const make_plain = (cipher_text, slice_length, substitution_mapper) => {
    const len = cipher_text.length;
    let plain_text = "-".repeat(len);
    for (let i = 0; i < len; i++) {
      let substitute_text = substitution_mapper[i%slice_length][cipher_text.charCodeAt(i)-0x41];
      if (typeof substitute_text === "undefined") {
        substitute_text = "-";
      }
      plain_text = replaceAt(plain_text, i, substitute_text);
    }
    return plain_text;
  };

  const make_index = (cipher_text, slice_length) => {
    let result = "1"+"-".repeat(slice_length-1);
    return result.repeat(Math.floor(cipher_text.length / slice_length));
  }

  const split_texts = (cipher_text, plain_text, index_text, word_break) => {
    let cipher = [];
    let plain = [];
    let index = [];
    for (let i = 0; i < cipher_text.length/word_break; i++) {
      cipher.push(cipher_text.substring(i*word_break, (i+1)*word_break));
      plain.push(plain_text.substring(i*word_break, (i+1)*word_break));
      index.push(index_text.substring(i*word_break, (i+1)*word_break));
    }
    return [cipher, plain, index];
  };

  const [cipher, plain, index] = split_texts(cipher_text, 
    make_plain(cipher_text, slice_length, substitution_mapper), 
    make_index(cipher_text, slice_length), word_break);
  var text_pile = zip(plain, cipher);
  text_pile = zip(text_pile, index);
  
  return (
    <div id="board">
      <div>
        <h4>Word Break: </h4>
        <input name="text_break" type="number" min="10" onChange={get_word_break}></input>
      </div>
      <div id="texts">
        {text_pile.map((s, i) => <CompareText key={i}
          plain={s[0]}
          cipher={s[1]}
          index={s[2]}
        />)}
      </div>
      <div style={{display:"none"}}>{substitution_mapper[0]}</div>
    </div>
  );
}

function MainPanel({ getData, cipher_text, slice_length }) {
  const [find_length, set_find_length] = useState(3);
  const get_find_length = event => {
    set_find_length(parseInt(event.target.value));
  };
  const get_slice_length = event => {
    let val = parseInt(event.target.value);
    if (val < 2) {
      val = 2;
    }
    getData(val);
  };
  
  const find_distance = (cipher_text, n) => {
    let result_len = [];
    let result_text = [];
    const len = cipher_text.length;
    
    let search_text = "";
    for (let i = 0; i < len-n+1; i++) {
      search_text = cipher_text.substring(i, i+n);
      for (let j = i+1; j < len-n+1; j++) {
        if (search_text === cipher_text.substring(j, j+n)) {
          if (result_len.indexOf(j-i) === -1 ) {
            result_text.push(search_text);
            result_len.push(j-i);
          }
          else if (result_text.indexOf(search_text) === -1) {
            result_text.push(search_text);
            result_len.push(j-i);
          }
          break;
        }
      }
    }
    return zip(result_text, result_len);
  };

  const calculate_frequency = (cipher_text, n, bias) => {
    const text = extract_nth(cipher_text, n, bias);
    const len = text.length;
    let count = [];
    for (let i = 0; i < 26; i++) {
      count.push(0);      
    }
    for (let i = 0; i < len; i++) {
      count[cipher_text.charCodeAt(i)-0x41]++;
    }
    let frequency = 0
    for (let i = 0; i < 26; i++) {
      frequency += (count[i])*(count[i]-1);   
    }
    frequency /= ((len)*(len-1));
    return frequency;
  };

  const calculate_frequency_avg = (cipher_text, slice_length) => {
    let result = 0;
    for (let i = 0; i < slice_length; i++) {
      result += calculate_frequency(cipher_text, slice_length, i);
    }
    return result / slice_length;
  };

  const distance = find_distance(cipher_text, find_length);
  let frequency = calculate_frequency_avg(cipher_text, slice_length, 0);
  return (
    <div id="panel">
      <div id="wrapper">
        <div>
          <h4>Get distance: </h4>
          <input type="number" id="find_length" value={find_length} onChange={get_find_length}></input>
          {distance.map((s, i) => <div key={i}>{s[0]}, {s[1]}</div>)}
        </div>
        <div>
          <h4>Slice length: </h4>
          <input type="number" id="slice_length" value={slice_length} onChange={get_slice_length}></input>
          <h4>Goal: 0.063</h4>
          <h4>Coincidence: </h4>
          {frequency}
        </div>
      </div>
    </div>
  );
}

function SubPanel({ getData, cipher_text, slice_length, bias, substitution_mapper }) {
  const text = extract_nth(cipher_text, slice_length, bias);

  const postData = (alphabet, substitution) => {
    if (substitution_mapper === false) {
      return;
    }
    var substitution_mapper_copy = [...substitution_mapper];
    substitution_mapper_copy[alphabet] = substitution;
    getData(substitution_mapper_copy, bias);
  };

  const calculate_statistics = cipher_text => {
    // set initial state
    let count = [];
    const len = cipher_text.length;
    for (let i = 0; i < 26; i++) {
      count.push(0);
    }
    // count each alphabet
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < 26; j++) {
        if (cipher_text[i] === String.fromCharCode(0x41+j)){
          count[j]++;
          break;
        }
      }
    }
    // set statistics
    let result = [];
    for (let i = 0; i < 26; i++) {
      count[i] = Math.round(count[i] / len *10000)/100;
      if (isNaN(count[i])) {
        count[i] = 0;
        result.push([String.fromCharCode(0x41+i), count[i]]);
        continue;
      }
      result.push([String.fromCharCode(0x41+i), count[i]]);
    }
    return result;
  }

  const sort_statistics = (statistics) => {
    const len = statistics.length;
    let stat = [...statistics];

    let result = [];
    let max_value = 0;
    let max_index = 0;
    for (let i = 0; i < len; i++) {
      max_value = -1;
      max_index = -1;
      for (let j = 0; j < len-i; j++) {
        if (max_value < stat[j][1]){
          max_value = stat[j][1];
          max_index = j;
        }
      }
      result.push([stat[max_index][0], stat[max_index][1]]);
      stat.splice(max_index, 1);
    }
    return result;
  };

  const statistics = sort_statistics(calculate_statistics(text, 1));

  return (
    <div id="panel">
      <ControllerTable
        getData={postData}
        statistics={statistics}
        substitution_mapper={substitution_mapper}
      />
    </div>
  );
}

function Panel({ getData, cipher_text, slice_length, panel_number, substitution_mapper }) {
  const postData = (data, bias) => {
    if (typeof data === "number") {
      getData(data);
    }
    else if (typeof data === "object") {
      let substitution_mapper_copy = [...substitution_mapper];
      substitution_mapper_copy[bias] = data;
      getData(substitution_mapper_copy);
    }
  };
  if (panel_number === 0) {
    return (
    <MainPanel
      getData={postData}
      cipher_text={cipher_text}
      slice_length={slice_length}
    />
  );
  }
  else {
    return (
    <SubPanel
      getData={postData}
      cipher_text={cipher_text}
      slice_length={slice_length}
      bias={panel_number-1}
      substitution_mapper={substitution_mapper[panel_number-1]}
    />
  );
  }
}

function Controller({ getData, cipher_text, substitution_mapper, slice_length}) {
  const postData = (child_data) => {
    if (typeof child_data === "number")
    {
      const slice_length = child_data;
      substitution_mapper = [];
      let dummy = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", 
          "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
      let panel_menu_copy = ["on"];
      for (let i = 0; i < slice_length; i++) {
        substitution_mapper.push(dummy);
        panel_menu_copy.push("off");
      }
      set_panel_menu(panel_menu_copy);
      getData(substitution_mapper, slice_length);
    }
    else if (typeof child_data === "object") {
      getData(child_data, slice_length);
    }
  };

  const [panel_menu, set_panel_menu] = useState([0, 0]);


  const [panel, set_panel] = useState(0);
  const get_panel = event => {
    let val = event.target.value;
    if (val === "main") {
      val = 0;
    }
    val = parseInt(val);
    set_panel(val);
    let panel_menu_copy = [...panel_menu];
    panel_menu_copy[panel] = "off";
    panel_menu_copy[val] = "on";
    
    set_panel_menu(panel_menu_copy);
  };


  return (
    <div id='Controller'>
      <div id='nav'>
        <input type="button" id={panel_menu[0]} value="main" onClick={get_panel}></input>
        {panel_menu.slice(1).map((s, i) => <input type="button" id={s} value={i+1} onClick={get_panel} key={i}></input>)}
      </div>
      <div>
        <Panel
          getData={postData}
          cipher_text={cipher_text}
          slice_length={slice_length}
          panel_number={panel}
          substitution_mapper={substitution_mapper}
        />
      </div>
    </div>
  );
}

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
    [
      ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", 
        "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
      ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", 
        "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
    ]
  );
  
  const [slice_length, set_slice_length] = useState(2);

  const get_controlled_data = (substitution_mapper, slice_length) => {
    set_substitution_mapper(substitution_mapper);
    set_slice_length(slice_length);
  };


  return (
    <div className="Vigenere">
      <div id="wrapper">
        <div id='text_box'>
          <CipherMenu
            cipher_algorithm={"Vigenere Cipher"}
            getData={get_cipher_data}
          />
          <Board
            cipher_text={cipher_text}
            substitution_mapper={substitution_mapper}
            slice_length={slice_length}
          />
        </div>
        <Controller
          getData={get_controlled_data}
          cipher_text={cipher_text}
          substitution_mapper={substitution_mapper}
          slice_length={slice_length}
        />
      </div>
    </div>
  );
}

export default Vegenere;