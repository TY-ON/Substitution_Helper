import '../App.css';
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
      let substitute_text = (cipher_text.charCodeAt(i)-0x41-substitution_mapper[i%slice_length]+26) % 26 + 0x61;
      substitute_text = String.fromCharCode(substitute_text);
      if (substitution_mapper[i%slice_length] === -1) {
        substitute_text = "-";
      }
      plain_text = replaceAt(plain_text, i, substitute_text);
    }
    return plain_text;
  };

  const split_texts = (cipher_text, plain_text, word_break) => {
    let cipher = [];
    let plain = [];
    for (let i = 0; i < cipher_text.length/word_break; i++) {
      cipher.push(cipher_text.substring(i*word_break, (i+1)*word_break));
      plain.push(plain_text.substring(i*word_break, (i+1)*word_break));
    }
    return [cipher, plain];
  };

  const [cipher, plain] = split_texts(cipher_text, 
    make_plain(cipher_text, slice_length, substitution_mapper), 
    word_break);
  var text_pile = zip(plain, cipher);
  
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
        />)}
      </div>
      <div style={{display:"none"}}>{substitution_mapper[0]}</div>
    </div>
  );
}

function MainPanel({ getData, cipher_text, slice_length, substitution_mapper }) {
  const [find_length, set_find_length] = useState(3);
  const get_find_length = event => {
    set_find_length(parseInt(event.target.value));
  };
  const get_slice_length = event => {
    let val = parseInt(event.target.value);
    if (val < 2) {
      val = 2;
    }
    getData("slice_length", val);
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

  const generate_key = (substitution_mapper) => {
    let result = "";
    for (let i = 0; i < substitution_mapper.length; i++) {
      const element = substitution_mapper[i];
      if (element != -1) {
        result += String.fromCharCode(0x41+element);
      }
      else {
        result += "-";
      }
    }
    return result;
  }
  const generated_key = generate_key(substitution_mapper);

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
        <div>
          <h4>key: {generated_key}</h4>
        </div>
      </div>
    </div>
  );
}

function SubPanel({ getData, cipher_text, slice_length, bias, substitution_mapper }) {
  const text = extract_nth(cipher_text, slice_length, bias);

  const postData = (alphabet, substitution) => {
    let diff = -1;
    if (substitution === "") {
      diff = -1;
    }
    else {
      diff = (alphabet-substitution.charCodeAt(0)+0x61)+26;
    }
    getData("substitution_mapper", diff % 26);
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

  const [marked, set_marked] = useState([
    [false, false, false, false, false, false, false, false, false, false, false, false, false, 
      false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, 
      false, false, false, false, false, false, false, false, false, false, false, false, false]
  ]);

  useEffect( () => {
    let marked = [];
    for (let i = 0; i < slice_length; i++) {
      marked.push([false, false, false, false, false, false, false, false, false, false, false, false, false, 
        false, false, false, false, false, false, false, false, false, false, false, false, false]);
    }
    set_marked(marked);
  }, [slice_length]);

  const get_marked = (key, index, mark) => {
    let marked_copy = [...marked];
    marked_copy[key] = mark;
    set_marked(marked_copy);
  };

  const [substitution_mapper_extended, set_substitution_mapper_extended] = useState([]);
  useEffect( () => {
    let substitution_mapper_extended_copy = [];
    if (substitution_mapper === -1) {
      for (let i = 0; i < 26; i++) {
        substitution_mapper_extended_copy.push('');
      }
    }
    else {
      for (let i = 0; i < 26; i++) {
        let charCode = (i-substitution_mapper+26)%26+0x61;
        substitution_mapper_extended_copy.push(String.fromCharCode(charCode));
      }
    }
    set_substitution_mapper_extended(substitution_mapper_extended_copy);
  }, [substitution_mapper]);

  return (
    <div id="panel">
      <ControllerTable
        getData={postData}
        statistics={statistics}
        substitution_mapper={substitution_mapper_extended}
        marked={marked[bias]}
        get_marked={get_marked}
        index={bias}
      />
    </div>
  );
}

function Panel({ getData, cipher_text, slice_length, panel_number, substitution_mapper }) {
  const postData = (key, data) => {
    if (key === "substitution_mapper") {
      var substitution_mapper_copy = [...substitution_mapper];
      substitution_mapper_copy[panel_number-1] = data
      getData(key, substitution_mapper_copy);
      return;
    }
    getData(key, data);
  };

  if (panel_number === 0) {
    return (
    <MainPanel
      getData={postData}
      cipher_text={cipher_text}
      slice_length={slice_length}
      substitution_mapper={substitution_mapper}
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
  const postData = (key, data) => {
    if (key === "slice_length")
    {
      const slice_length = data;
      let substitution_mapper_copy = [];
      let panel_menu_copy = ["on"];
      for (let i = 0; i < slice_length; i++) {
        substitution_mapper_copy.push(-1);
        panel_menu_copy.push("off");
      }
      set_panel_menu(panel_menu_copy);
      getData(substitution_mapper_copy, slice_length);
    }
    else if (key === "substitution_mapper") {
      getData(data, slice_length);
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

function Vigenere() {
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
    [-1, -1]
  );
  
  const [slice_length, set_slice_length] = useState(2);

  const get_controlled_data = (substitution_mapper, slice_length) => {
    set_substitution_mapper(substitution_mapper);
    set_slice_length(slice_length);
  };

  const [params, setParams] = useSearchParams();

  useEffect( () => {
    if (params.get("cipher_object")) {
      var cipher_object = params.get("cipher_object");
      cipher_object = JSON.parse(cipher_object);
      
      if (! cipher_object.cipher_text){
        cipher_object.cipher_text = "";
      }
      if (! cipher_object.slice_length){
        cipher_object.slice_length = 2;
      }

      if (! cipher_object.substitution_mapper || typeof cipher_object.substitution_mapper[0] === "object"){
        cipher_object.substitution_mapper = [];
        for (let i = 0; i < slice_length; i++) {
          cipher_object.substitution_mapper.push(-1);
        }
      }
      set_cipher_text(cipher_object.cipher_text);
      set_substitution_mapper(cipher_object.substitution_mapper);
      set_slice_length(cipher_object.slice_length);
    }
  }, []);

  useEffect( () => {
    const cipher_object = {
      type: "Vigenere",
      cipher_text: cipher_text,
      substitution_mapper: substitution_mapper,
      slice_length: slice_length,
    };
    setParams({cipher_object: JSON.stringify(cipher_object)});
  }, [cipher_text, substitution_mapper, slice_length]);


  return (
    <div className="Vigenere">
      <div id="wrapper">
        <div id='text_box'>
          <CipherMenu
            getData={get_cipher_data}
            cipher_algorithm={"Vigenere Cipher"}
            cipher_text={cipher_text}
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

export default Vigenere;