let socket = io.connect()
let app;
let urlParams = new URLSearchParams(window.location.search)
let roomNum = urlParams.get('room')

socket.on('connect', function() {
  console.log("Connected to SocketIo Server")
  
  socket.emit('join', { type: "screen", room: roomNum })		

})

socket.on('er', function(data) {
  console.log("Connected to SocketIo Server")
  
    if (data === "noGameFound"){
	    console.log("Not a valid room code!")
	    socket.disconnect()
	    
	    alert('This room is not found! Please create a new game if you want to play.');
	    window.location.href = '/game/new_game.html'
	}

})

socket.on('gameInProgress', function (data) {
    loadGame(data)
})

socket.on('command', function (data) {
  console.log(data)
  
  if (data === "disconnect")
  {
   console.log("Server wants me to disconnect. Disconnecting")
   socket.disconnect()
  }
    //cardflip
    if(data.cardFlip)
        {
	        console.log(`#${data.cardFlip}Holder`)
            $(`#${data.cardFlip}`).trigger('flip')
        }
})
socket.on('points', function (data) {
    data=data.replace('{','')
    data = data.replace('}', '')
    var points = data.split(':')
    console.log(points[0])
    awardPoints(points[0], points[1])
})

function awardPoints(teamId, pts) {
	  let boardScore   = document.getElementById('boardScore')
	  let currentScore = {let: pts}
      console.log(currentScore)
	  let team         = document.getElementById(teamId)
	  let teamScore    = {let: parseInt(team.innerHTML)}
      console.log(teamScore)
	  let teamScoreUpdated = (teamScore.let + currentScore.let)
      console.log(teamScoreUpdated)
	  	  
	  TweenMax.to(teamScore, 1, {
	    let: teamScoreUpdated, 
	    onUpdate: function () {
	      team.innerHTML = Math.round(teamScore.let)
	    },
	    ease: Power3.easeOut,
	  });
	  
	  TweenMax.to(currentScore, 1, {
	    let: 0, 
	    onUpdate: function () {
	      boardScore.innerHTML = Math.round(currentScore.let)
	    },
	    ease: Power3.easeOut,
	  });
	  //app.changeQuestion()
	}

function loadGame(data){
    var id = data.questionID
    id = id.replace(/"/g,'')
    console.log(id)
	app = {
	  version: 1,
      jsonFile:`http://${window.location.host}/api/question?id=${id}`,
	  currentQ: 0,
	  board: $(`<div class='gameBoard'>`+
	   
	   `<!--- Scores --->`+
	   `<div class='score' id='boardScore'>0</div>`+
	   `<div class='score' id='team1' >0</div>`+
	   `<div class='score' id='team2' >0</div>`+
	   
	   `<!--- Question --->`+
	   `<div class='questionHolder'>`+
	   `<span class='question'></span>`+
	   `</div>`+
	   
	   `<!--- Answers --->`+
	   `<div class='colHolder'>`+
	   `<div class='col1'></div>`+
	   `<div class='col2'></div>`+
	   `</div>`+

	   `</div>`),
	  // Utility functions
	  shuffle: function(array){
	    let currentIndex = array.length, temporaryValue, randomIndex
	    while (0 !== currentIndex) {
	      randomIndex = Math.floor(Math.random() * currentIndex)
	      currentIndex -= 1
	      temporaryValue = array[currentIndex]
	      array[currentIndex] = array[randomIndex]
	      array[randomIndex] = temporaryValue
	    }
	    return array;
	  },
	  jsonLoaded: function(data){
	    let newData = []
	    
	    for (let key in data) {
	     let question = []
	     let answer = []
	     
	     for (let ans in data[key]['answer']){
	       let a = []
	       a[0] = data[key]['answer'][ans]['text']
	       a[1] = data[key]['answer'][ans]['pts']
	       
	       answer.push(a)
	     }
	     newData[data[key]['question']] = answer
	   }
	   
	   
	   app.allData = newData
	   app.questions = Object.keys(newData)
	   app.shuffle(app.questions)
	   app.makeQuestion(app.currentQ)
	   $('body').append(app.board)
	 },
	  // Action functions
	  makeQuestion: function(qNum){
	    let qText  = app.questions[qNum]
	    
	    //sendQuestionID(qText)
	    
	    let qAnswr = app.allData[qText]
	
	    var qNum = qAnswr.length
	    qNum = (qNum<8)? 8: qNum
	    qNum = (qNum % 2 != 0) ? qNum+1: qNum
	    
	    let boardScore = app.board.find("#boardScore")
	    let question   = app.board.find(".question")
	    let col1       = app.board.find(".col1")
	    let col2       = app.board.find(".col2")
	    
	    boardScore.html(0)
	    question.html(qText.replace(/&x22;/gi,'"'))
	    col1.empty()
	    col2.empty()
	
	    for (let i = 0; i < qNum; i++){
	      let aLI     
	      if(qAnswr[i]){
	        aLI = $(`<div class='cardHolder'>`+
                  `<div id='card${i}' class='card'>`+
                    `<div class='front'>`+
                      `<span class='DBG'>${(i+1)}</span>`+
                    `</div>`+
                    `<div class='back DBG'>`+
                      `<span>${qAnswr[i][0]}</span>`+
                      `<b class='LBG'>${qAnswr[i][1]}</b>`+
                    `</div>`+
                  `</div>`+
                `</div>`)
	      } else {
	        aLI = $(`<div class='cardHolder empty'><div></div></div>`)
	      }
	      let parentDiv = (i<(qNum/2))? col1: col2
	      $(aLI).appendTo(parentDiv)
	    }  
	    
	    let cardHolders = app.board.find('.cardHolder')
	    let cards       = app.board.find('.card')
	    let backs       = app.board.find('.back')
	    let cardSides   = app.board.find('.card>div')
	
	    TweenLite.set(cardHolders , {perspective:800})
	    TweenLite.set(cards       , {transformStyle:"preserve-3d"})
	    TweenLite.set(backs       , {rotationX:180})
	    TweenLite.set(cardSides   , {backfaceVisibility:"hidden"})
	
	    cards.data("flipped", false)
	    
          //Call this when socket gets card flip
	    function showCard(){
	      let card = $('.card', this) 
	      let flipped = $(card).data("flipped")
	      let cardRotate = (flipped)?0:-180;
	      TweenLite.to(card, 1, {rotationX:cardRotate, ease:Back.easeOut})
	      flipped = !flipped
	      $(card).data("flipped", flipped)
	      app.getBoardScore()
	    }
	    cardHolders.on('flip',showCard)
	  },
	  getBoardScore: function(){
	    let cards = app.board.find('.card')
	    let boardScore = app.board.find('#boardScore')
	    let currentScore = {let: boardScore.html()}
	    let score = 0
	    function tallyScore(){
	      if($(this).data("flipped")){
	       let value = $(this).find("b").html()
	       score += parseInt(value)
	     }
	   }
	   $.each(cards, tallyScore)      
	   TweenMax.to(currentScore, 1, {
	    let: score, 
	    onUpdate: function () {
	      boardScore.html(Math.round(currentScore.let))
	    },
	    ease: Power3.easeOut,
	  });
	 },
	 awardPoints: function(num){
	  var num          = $(this).attr("data-team")
	  let boardScore   = app.board.find('#boardScore')
	  let currentScore = {let: parseInt(boardScore.html())}
	  let team         = app.board.find("#team"+num)
	  let teamScore    = {let: parseInt(team.html())}
	  let teamScoreUpdated = (teamScore.let + currentScore.let)
	  console.log(team[0].id)
	  
	  socket.emit('points',{room:roomNum, points:{teamID:team[0].id, pts:teamScoreUpdated}})
	  
	  TweenMax.to(teamScore, 1, {
	    let: teamScoreUpdated, 
	    onUpdate: function () {
	      team.html(Math.round(teamScore.let))
	    },
	    ease: Power3.easeOut,
	  });
	  
	  TweenMax.to(currentScore, 1, {
	    let: 0, 
	    onUpdate: function () {
	      boardScore.html(Math.round(currentScore.let))
	    },
	    ease: Power3.easeOut,
	  });
	  app.changeQuestion()
	},
	changeQuestion: function(){
	  app.currentQ++
	  app.makeQuestion(app.currentQ)
	},
    
	  // Initial function
	  init: function(){
	    $.getJSON(app.jsonFile, app.jsonLoaded)
	    //app.board.find('#newQuestion' ).on('click', app.changeQuestion)
	    //app.board.find('#awardTeam1'  ).on('click', app.awardPoints)
	    //app.board.find('#awardTeam2'  ).on('click', app.awardPoints)
	  }  
    
	}
	app.init()
}

