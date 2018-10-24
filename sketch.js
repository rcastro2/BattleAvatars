var resources = [],database,players = {},you,speed = 2;
function preload(){
  login();
}

function setup() {
  createCanvas(800, 600); 
  imageMode("center"); 
  textAlign(CENTER);
  textSize(14);
}

function draw() {
  background(255);
  checkForNewPlayers();
  for(var key in players){
    players[key].player.draw();
  }
  if (keyIsPressed === true) {
    if (keyIsDown(UP_ARROW)) {
      you.y-=speed;
    }
    if (keyIsDown(DOWN_ARROW)) {
      you.y+=speed;
    }
    if (keyIsDown(LEFT_ARROW)) {
      you.x-=speed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      you.x+=speed;
    }
    database.child(you.uid).update({
      "x": you.x,
      "y": you.y,
      "score":0
    })
  } 

}
function checkForNewPlayers(){
  while(resources.length > 0){
    var data = resources.pop()
    players[data.uid] = {
      player:new Player(data.photo, data.name)
    };
  }
}

class Player{
  constructor(image,name){
    this.image = image;
    this.name = name;
    this.y = 0;
    this.x = 0;
    this.theta = 0;
  }
  draw(){
    text(this.name,this.x,this.y - 30);
    image(this.image,this.x,this.y,50,50);
  }
}

function login(){
  var config = {
    apiKey: "AIzaSyCusNHg-0wgMnJUg6VyX1njnWGhXlRmHl4",
    authDomain: "castrodevstore.firebaseapp.com",
    databaseURL: "https://castrodevstore.firebaseio.com",
    projectId: "castrodevstore",
    storageBucket: "castrodevstore.appspot.com",
    messagingSenderId: "1030092117071"
  };
  firebase.initializeApp(config);
  var auth = firebase.auth();
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          console.log("Authenticated successfully");
          database = firebase.database().ref('p5jsGame/BattleAvatars'); 
          database.child(user.uid).set({
              "name":user.displayName,
              "photo":user.photoURL,
              "x": width / 2,
              "y": height / 2,
              "score":0
          })
          you = {uid:user.uid,score:0,x:width/2,y:height/2};
          database.on('value',function(snapshot){
            data = snapshot.val();
            for(var key in data){
              if(players[key]){
                //If player exists update their position
                players[key].player.x = data[key].x
                players[key].player.y = data[key].y
                players[key].player.score = data[key].score
              }else{
                //If player doesn't exist add to the resources array to be later 
                //added to the players object
                resources.push({
                  uid:key,
                  name:data[key].name,
                  photo:loadImage(data[key].photo)
                });
              }
            }
          })
      }
      else{
          var provider = new firebase.auth.GoogleAuthProvider();
          auth.signInWithRedirect(provider);
      } 
  })
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
}




