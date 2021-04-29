let mobilenet;
let model;
var classId;
var val;
var labels ;
var i = 0 ;
var j = 0 ; 
const webcam = new Webcam(document.getElementById('wc'));
// const dataset = new RPSDataset();
var rockSamples=0, paperSamples=0, scissorsSamples=0;

async function loadMobilenet() {
  const mobilenet = await tf.loadLayersModel('https://raw.githubusercontent.com/trekhleb/machine-learning-experiments/master/demos/public/models/rock_paper_scissors_mobilenet_v2/model.json');
  console.log(mobilenet)
  return mobilenet
}






async function startPredicting() {
    var img = document.getElementById("myCanvas")
    img.style.border = 0
    img.style.width=0
    img.style.height=0
    document.getElementById("prediction").innerHTML = " "
    document.getElementById("res").innerHTML = " "
    generate()
      
   
  
}





async function init(){
	await webcam.setup();
	mobilenet = await loadMobilenet();
	tf.tidy(() => mobilenet.predict(webcam.capture()));
	
}



init();

// Credit: Mateusz Rybczonec
function generate(){
  
  const FULL_DASH_ARRAY = 283;
  const WARNING_THRESHOLD = 10;
  const ALERT_THRESHOLD = 5;
  
  const COLOR_CODES = {
    info: {
      color: "green"
    },
    warning: {
      color: "orange",
      threshold: WARNING_THRESHOLD
    },
    alert: {
      color: "red",
      threshold: ALERT_THRESHOLD
    }
  };
  
  const TIME_LIMIT = 5;
  let timePassed = 0;
  let timeLeft = TIME_LIMIT;
  let timerInterval = null;
  let remainingPathColor = COLOR_CODES.info.color;
  
  document.getElementById("app").innerHTML = `
  <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
          id="base-timer-path-remaining"
          stroke-dasharray="283"
          class="base-timer__path-remaining ${remainingPathColor}"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <span id="base-timer-label" class="base-timer__label">${formatTime(
      timeLeft
    )}</span>
  </div>
  `;
  
  startTimer();
 
  async function onTimesUp() {
    clearInterval(timerInterval);
    labels = ["Rock","Paper", "Scissors"]
    const predictedClass = tf.tidy(() => {
      const img = webcam.capture();
      
      const activation = mobilenet.predict(img);
      console.log(activation)
      const res = activation.as1D().argMax();
      
      return res
    });
    const classId = (await predictedClass.data())[0];
    var predictionText = "I see " + labels[classId];
    var enemyRes = "";
    var suitRes = "";

	val = Math.floor(Math.random()*3);
  var canvas = document.getElementById('myCanvas')
  var url = ""
   
  if ( val == 0){
    enemyRes = "I choose Rock"
    url = 'rock.jpg';
  }
 
  else if ( val == 1 ){
    enemyRes = "I choose Paper"
    url = 'paper.jpg';
  }
  else if (val == 2){
    enemyRes = "I choose Scissors"
    url = 'scissor.png';
  }
  canvas.style.width = "224px"
  canvas.style.height = "224px"
  canvas.style.border = "3px solid #000000"
  canvas.src = url;
  if(classId == val)
      suitRes = "Draw"
  else if(classId == 0 && val == 2)
      suitRes = "Win"
  else if(classId == 1 && val == 0)
      suitRes = "Win"
  else if (classId == 2 && val == 1)
      suitRes = "Win"
  else 
      suitRes = "Lose"
      document.getElementById("prediction").innerHTML = predictionText + "<br>" +  enemyRes;
      document.getElementById("res").innerText = "You " + suitRes;
    
      
      if (suitRes=="Win"){
        document.getElementById("myScore").innerHTML  = ++i
      }
      else if (suitRes =="Lose")
        document.getElementById("enemyScore").innerHTML = ++j
    console.log([i,j])
    predictedClass.dispose();
    await tf.nextFrame();
    document.getElementById("app").innerHTML = ""
    
    
  }
  
  function startTimer() {
    timerInterval = setInterval(() => {
      timePassed = timePassed += 1;
      timeLeft = TIME_LIMIT - timePassed;
      document.getElementById("base-timer-label").innerHTML = formatTime(
        timeLeft
      );
      setCircleDasharray();
      setRemainingPathColor(timeLeft);
  
      if (timeLeft === 0) {
        
        onTimesUp();
      }
    }, 1000);
  }
  
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
  
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
  
    return `${minutes}:${seconds}`;
  }
  
  function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(warning.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(info.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(warning.color);
    }
  }
  
  function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
  }
  
  function setCircleDasharray() {
    const circleDasharray = `${(
      calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
      .getElementById("base-timer-path-remaining")
      .setAttribute("stroke-dasharray", circleDasharray);
  }
  }