var validWords = [];
var letters = "";
var discoveredWords = [];
var totalScore = 0;
var pangram = "";
var centerLetter = "";
var cursor = true;
var numFound = 0;
var maxscore = 0;
setInterval(() => {
  if (cursor) {
    document.getElementById("cursor").style.opacity = 0;
    cursor = false;
  } else {
    document.getElementById("cursor").style.opacity = 1;
    cursor = true;
  }
}, 600);

const JSON_MOCK = {
  letters: ["r", "i", "c", "a", "d", "m", "f"],
  pangram: "ricard",
  possible_words: [
    "acid",
    "adiar",
    "africa",
    "aidar",
    "aimara",
    "aimia",
    "amic",
    "ari",
    "aria",
    "arid",
    "cada",
    "cadi",
    "cadira",
    "cadiram",
    "caiac",
    "caid",
    "cairar",
    "cama",
    "camarada",
    "cami",
    "car",
    "cara",
    "caria",
    "caricia",
    "cia",
    "cidrac",
    "cima",
    "cimaci",
    "cimar",
    "dar",
    "dard",
    "dama",
    "dia",
    "diac",
    "diaca",
    "diari",
    "diaria",
    "dida",
    "didac",
    "difamar",
    "drac",
    "drama",
    "fada",
    "fam",
    "fama",
    "far",
    "farad",
    "faradaic",
    "faradic",
    "farcir",
    "faria",
    "farmac",
    "farmacia",
    "fira",
    "firam",
    "firar",
    "firma",
    "firmar",
    "mac",
    "macada",
    "macadam",
    "macadamia",
    "madrid",
    "mai",
    "mama",
    "mamada",
    "mamar",
    "mar",
    "maraca",
    "marcada",
    "marcar",
    "marica",
    "maridar",
    "mia",
    "mica",
    "micra",
    "mida",
    "midar",
    "mira",
    "mirada",
    "mirar",
    "rad",
    "rada",
    "radar",
    "radi",
    "radiar",
    "radicar",
    "rafi",
    "rafia",
    "raim",
    "ram",
    "ramada",
    "ramificar",
    "rar",
    "rara",
    "ria",
    "riada",
    "rica",
    "ricarda",
    "rima",
    "rimaia",
    "rimar",
  ],
  center_letter: "i",
  maxscore: 505,
};

//makes http request to an awi api endpoint that triggers a lambda function to return today's letters/words
//today's words and letters are generated by a lambda function from the valid_words.json dictionary
function get_valid_words() {
  const url =
    "https://uxxjtb4jz0.execute-api.us-east-1.amazonaws.com/default/FindValidWords";

  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.setRequestHeader("Content-type", "text/plain");
  request.onreadystatechange = function () {
    try {
      var dataResponse = JSON.parse(this.response);
      var data = JSON_MOCK;
      //3 is LOADING, 4 is DONE
      if (request.readyState == 3 && request.status == 200) {
        letters = data["letters"];
        validWords = data["possible_words"];
        pangram = data["pangram"];
        maxscore = data["maxscore"];
        initialize_letters();
        initialize_score();
        // removeLocalStorage();
        preloadDiscoveredWords();
      }
    } catch (e) {
      console.log("error");
    }
  };
  request.send();
}

function get_valid_words_local() {
  var data = JSON_MOCK;
  letters = data["letters"];
  validWords = data["possible_words"];
  pangram = data["pangram"];
  maxscore = data["maxscore"];
  initialize_letters();
  initialize_score();
  // removeLocalStorage();
  preloadDiscoveredWords();
}

function initialize_score() {
  document.getElementById("maxscore").innerHTML = String(maxscore);
  document.getElementById("numpossibles").innerHTML = String(validWords.length);
}

function preloadDiscoveredWords() {
  if (localStorage.hasOwnProperty("discovered-words")) {
    discoveredWords = JSON.parse(localStorage.getItem("discovered-words"));

    // Update num words found
    numFound = discoveredWords.length;
    document.getElementById("numfound").innerHTML = numFound;
    showDiscoveredWord();

    // Update score
    if (discoveredWords.length > 0) {
      discoveredWords.forEach((element) => {
        score = calculateWordScore(element, false);
        addToTotalScore(score);
      });
      document.getElementById("score").innerHTML = totalScore;
    }
  }
}

function removeLocalStorage() {
  localStorage.removeItem("discovered-words");
}

//Creates the hexagon grid of 7 letters with middle letter as special color
function initialize_letters() {
  var hexgrid = document.getElementById("hexGrid");
  for (var i = 0; i < letters.length; i++) {
    var char = letters[i];

    var pElement = document.createElement("P");
    pElement.innerHTML = char;

    var aElement = document.createElement("A");
    aElement.className = "hexLink";
    aElement.href = "#";
    aElement.appendChild(pElement);
    aElement.addEventListener("click", clickLetter(char), false);

    var divElement = document.createElement("DIV");
    divElement.className = "hexIn";
    divElement.appendChild(aElement);

    var hexElement = document.createElement("LI");
    hexElement.className = "hex";
    hexElement.appendChild(divElement);
    if (i == 3) {
      aElement.id = "center-letter";
      centerLetter = letters[i];
    }
    hexgrid.appendChild(hexElement);
  }
}

Array.prototype.shuffle = function () {
  let input = this;
  for (let i = input.length - 1; i >= 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    let itemAtIndex = input[randomIndex];
    input[randomIndex] = input[i];
    input[i] = itemAtIndex;
  }
  return input;
};

function shuffleLetters() {
  letters.shuffle();
  //get center letter back to letter[3]
  var centerIndex = letters.indexOf(centerLetter);
  if (letters[3] != centerLetter) {
    var temp = letters[3];
    letters[3] = centerLetter;
    letters[centerIndex] = temp;
  }
  var hexgrid = document.getElementById("hexGrid");
  while (hexgrid.firstChild) {
    hexgrid.removeChild(hexgrid.firstChild);
  }
  initialize_letters();
}

//When letter is clicked add it to input box
var clickLetter = function (letter) {
  return function curried_func(e) {
    var tryword = document.getElementById("test-word");
    tryword.innerHTML = tryword.innerHTML + letter.toLowerCase();
  };
};

//Deletes the last letter of the string in the textbox
function deleteLetter() {
  var tryword = document.getElementById("test-word");
  var trywordTrimmed = tryword.innerHTML.substring(
    0,
    tryword.innerHTML.length - 1
  );
  tryword.innerHTML = trywordTrimmed;
  if (!checkIncorrectLetters(trywordTrimmed)) {
    tryword.style.color = "black";
  }
}

function wrongInput(selector) {
  $(selector).fadeIn(500);
  $(selector).fadeOut(1000);
  $("#cursor").hide();
  $("#test-word").effect("shake", { times: 2.5 }, 450, function () {
    clearInput();
    $("#cursor").show();
  });
}

function rightInput(selector) {
  $(selector).fadeIn(500).delay(1000).fadeOut(500);
  clearInput();
}

function clearInput() {
  $("#test-word").empty();
}

function showPoints(pts) {
  $(".points").html("+" + pts);
}

//check if the word is valid and clear the input box
//word must be at least 4 letters
//word must contain center letter
//word can't already be found
function submitWord() {
  var tryword = document.getElementById("test-word");
  var centerLetter =
    document.getElementById("center-letter").firstChild.innerHTML;
  var isPangram = false;
  let score = 0;

  if (tryword.innerHTML.length < 3) {
    wrongInput("#too-short");
  } else if (discoveredWords.includes(tryword.innerHTML.toLowerCase())) {
    wrongInput("#already-found");
  } else if (
    !tryword.innerHTML.toLowerCase().includes(centerLetter.toLowerCase())
  ) {
    wrongInput("#miss-center");
  } else if (validWords.includes(tryword.innerHTML.toLowerCase())) {
    var isPangram = checkPangram(tryword.innerHTML);
    score = calculateWordScore(tryword.innerHTML, isPangram);
    addToTotalScore(score);

    showDiscoveredWord(tryword.innerHTML);
    numFound++;
    document.getElementById("numfound").innerHTML = numFound;
    document.getElementById("score").innerHTML = totalScore;

    var l = tryword.innerHTML.length;
    if (isPangram) {
      rightInput("#pangram");
      showPoints(17);
    } else if (l < 5) {
      rightInput("#good");
      showPoints(1);
    } else if (l < 7) {
      rightInput("#great");
      showPoints(l);
    } else {
      rightInput("#amazing");
      showPoints(l);
    }
  } else {
    wrongInput("#invalid-word");
  }

  checkEndGame();
}

//if word was valid, display it
//if all words are found end game.
function showDiscoveredWord(input) {
  var discText = document.getElementById("discoveredText");
  if (input) {
    discoveredWords.push(input.toLowerCase());
  }
  discoveredWords.sort();
  localStorage.setItem("discovered-words", JSON.stringify(discoveredWords));
  discText.innerHTML = "";
  discoveredWords.forEach((word, index) => {
    if (index < discoveredWords.length - 1) {
      discText.innerHTML += word + ", ";
    } else {
      discText.innerHTML += word + ".";
    }
  });
}

function checkEndGame() {
  if (numFound === validWords.length) {
    setTimeout(() => {
      document.body.classList.add("gameover-animation");
      console.log("Eureka! Has trobat totes les paraules!");
    }, 2500);
  }
}

//adds input "score" to the total score of user
function addToTotalScore(score) {
  totalScore += score;
}

//calculates the score of input "input" and also adjusts if "input" is a pangram
function calculateWordScore(input, isPangram) {
  let len = input.length;
  let returnScore = 1;
  if (len > 2) {
    if (isPangram) {
      returnScore = len + 7;
    } else {
      returnScore = len;
    }
  }
  return returnScore;
}

//checks if "input" word is a pangram
function checkPangram(input) {
  var i;
  var containsCount = 0;
  var containsAllLetters = false;
  for (i = 0; i < 7; i++) {
    if (input.includes(letters[i])) {
      containsCount++;
    }
  }
  if (containsCount == 7) {
    containsAllLetters = true;
  }
  console.log("isPangram?: " + containsAllLetters);
  return containsAllLetters;
}

function checkIncorrectLetters(input) {
  var i;
  var badLetterCount = 0;
  for (i = 0; i < input.length; i++) {
    if (!letters.includes(input[i])) {
      badLetterCount++;
    }
  }
  if (badLetterCount > 0) {
    return true;
  }
  return false;
}

//takes keyboard event from user and determines what should be done
function input_from_keyboard(event) {
  var tryword = document.getElementById("test-word");

  if (event.keyCode == 13) {
    submitWord();
  }

  if (event.keyCode == 8) {
    deleteLetter();
  }

  //validation for just alphabet letters input
  if (
    (event.keyCode >= 97 && event.keyCode <= 122) ||
    (event.keyCode >= 65 && event.keyCode <= 90)
  ) {
    tryword.innerHTML =
      tryword.innerHTML + String.fromCharCode(event.keyCode).toLowerCase();
    if (checkIncorrectLetters(tryword.innerHTML)) {
      tryword.style.color = "grey";
    }
  }
}
