import './App.css';
import { useState } from 'react'
import { zip, replaceAt } from './Utils/Util.js'

function CipherMenu({ getData }) {
  /**Known Data
   * Cipher Text
   */
  const postData = event => {
    getData(event.target.value.toUpperCase());
  }

  return (
    <div id="CipherMenu">
      <h1>Mono Alphabetic Cipher</h1>
      <div>
        <h4>Input Cipher Text: </h4>
        <textarea name="cipher_text" onChange={postData} id="cipher_text"></textarea>
      </div>
    </div>
  );
}

function CompareText({ plain, cipher}) {
  return (
    <>
      {plain}
      <br></br>
      {cipher}
      <br></br>
      <br></br>
    </>
  );
}

function Board({ cipher_text, substitution_mapper}) {
  const [word_break, set_word_break] = useState("20");
  const get_word_break = event => {
    if (event.target.value < 10) {
      set_word_break(10);
    }
    else{
      set_word_break(event.target.value)
    }
  };

  const make_plain = (cipher_text) => {
    const len = cipher_text.length;
    let plain_text = "-".repeat(len);
    for (let i = 0; i < len; i++) {
      if (typeof substitution_mapper[cipher_text.charCodeAt(i)-0x41] === "undefined"){
        continue;
      }
      plain_text = replaceAt(plain_text, i, substitution_mapper[cipher_text.charCodeAt(i)-0x41]);
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

  const [cipher, plain] = split_texts(cipher_text, make_plain(cipher_text), word_break);
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

function ControllerTr({ getData, alphabet, substitution, statistics }) {
  const postData = event => {
    if (typeof event.target.value === "undefined"){
      event.target.value = "-";
    }
    getData(event.target.name.charCodeAt(0)-0x41, event.target.value);
  };

  return (
    <tr>
      <th>{alphabet}</th>
      <th>
        <input name={alphabet} type='text' maxLength="1" id="substitution" value={substitution} onChange={postData} >
        </input><input type="checkbox"></input>
      </th>
      <th id="statistics">{statistics}</th>
    </tr>
  );
}

function ControllerTable({getData, statistics, substitution_mapper}) {
  const postData = (alphabet, substitution) => {
    getData(alphabet, substitution);
  };
  if (substitution_mapper === false) {
    substitution_mapper = [];
    for (let i = 0; i < 26; i++) {
      substitution_mapper.push("None");
    }
  }

  return (
    <table border="1" cellSpacing="0">
      <tr>
        <th>alphabet</th>
        <th>substitution</th>
        <th>statistics</th>
      </tr>
      {statistics.map((s, i) => 
      <ControllerTr
        getData={postData}
        alphabet={s[0]}
        substitution={substitution_mapper[s[0].charCodeAt(0)-0x41]}
        statistics={s[1]}
      />)}
   </table>
  );
}

function Controller({ getData, cipher_text, substitution_mapper}) {
  const postData = (alphabet, substitution) => {
    if (substitution_mapper === false) {
      return;
    }
    var substitution_mapper_copy = [...substitution_mapper];
    substitution_mapper_copy[alphabet] = substitution;
    getData(substitution_mapper_copy);
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

  const statistics = calculate_statistics(cipher_text);

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

  const sorted_statistics = sort_statistics(statistics);

  const calculate_n_statistics = (cipher_text, n) => {
    // set initial state
    let stat = [];
    const len = cipher_text.length;
    // count each alphabet
    let counted = [];
    let count_text = "";
    let count = 1;
    for (let i = 0; i < len-n+1; i++) {
      count_text = cipher_text.substring(i, i+n);
      if (counted.indexOf(count_text) !== -1){
        continue;
      }
      counted.push(count_text);
      count = 1;
      for (let j = i+1; j < len-n+1; j++) {
        if (count_text === cipher_text.substring(j, j+n)){
          count++;
        }
      }
      if (count > 1) {
        stat.push([count_text, count]);
      }
    }
    return stat;
  }
  let stat = calculate_n_statistics(cipher_text, 2);
  const stat_2 = sort_statistics(stat);
  stat = calculate_n_statistics(cipher_text, 3);
  const stat_3 = sort_statistics(stat);
  
  return (
    <div id='Controller'>
      <div id='wrapper'>
        <h4>Mono Statistics: </h4>
        <div id='wrapper'>
          <ControllerTable
            getData={postData}
            statistics={statistics}
            substitution_mapper={substitution_mapper}
          />
          <ControllerTable
            getData={postData}
            statistics={sorted_statistics}
            substitution_mapper={substitution_mapper}
          />
        </div>
        <h4>Poly Statistics: </h4>
        <div id='wrapper'>
          <ControllerTable
            getData={postData}
            statistics={stat_2}
            substitution_mapper={false}
          />
          <ControllerTable
            getData={postData}
            statistics={stat_3}
            substitution_mapper={false}
          />
        </div>
      </div>

      <div style={{display:"none"}}>{substitution_mapper[0]}{stat_2[0]}{stat_3[0]}</div>
    </div>
  );
}

function App() {
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
    <div className="App">
      <div id="wrapper">
        <div id='text_box'>
          <CipherMenu
            getData={get_cipher_data}
          />
          <Board
            cipher_text={cipher_text}
            substitution_mapper={substitution_mapper}
          />
        </div>
        <Controller
          getData={get_controlled_data}
          cipher_text={cipher_text}
          substitution_mapper={substitution_mapper}
        />
      </div>
    </div>
  );
}

export default App;
