var resources = [],database,players = {},you,speed = 2;
function preload(){
  login();
  starfield = loadImage("assets/field_5.png")
}

function setup() {
  createCanvas(800, 600); 
  imageMode("center");
  rectMode("center"); 
  textAlign(CENTER);
  textSize(14);
  bk = new Background(new Animation(starfield,5,1000,1000,1));
}

function draw() {
  checkForNewPlayers();
  var direction = "";
  if (keyIsPressed === true) {
    if (keyIsDown(UP_ARROW)) {
      you.y-=speed; 
      direction += "down";
    }
    if (keyIsDown(DOWN_ARROW)) {
      you.y+=speed;
      direction += "up";
    }
    if (keyIsDown(LEFT_ARROW)) {
      you.x-=speed;
      direction += "right";
    }
    if (keyIsDown(RIGHT_ARROW)) {
      you.x+=speed;
      direction += "left";
    }
    database.child(you.uid).update({
      "x": you.x,
      "y": you.y,
      "friends":you.friends
    })
  }else{
    direction = ""
  }
  bk.scroll(direction);
  for(var key in players){
    //Draw each player relative to you
    players[key].player.draw(players[you.uid].player);
    if(players[you.uid].player.collidedWith(players[key].player) && you.uid != key && !you.friends.includes(key)){
      you.friends.push(key);
    }
  }
  if(you) document.getElementById("scrap").innerHTML = friendList()
  for(var key in players){
    if(!document.getElementById(key) || you.uid == key) continue;
    document.getElementById(key).style.backgroundColor = "white";
    if(players[you.uid].player.collidedWith(players[key].player)){
      document.getElementById(key).style.backgroundColor = "yellow";
    }
  }
}
function friendList(){
  var build = "<ul id='"+you.uid+"'>"
  for(var i = 0; i < you.friends.length; i++){
    var friend = players[you.friends[i]];
    build += "<li><div id='"+you.friends[i]+"'><img class='icon' src='" + friend.photo + "'>" + friend.player.name + "</div></li>"
  }
  return build + "</ul>"
}
function checkForNewPlayers(){
  while(resources.length > 0){
    var data = resources.pop()
    players[data.uid] = {
      photo:data.photoURL,
      player:new Player(data.photo, data.name,data.x,data.y,data.friends)
    };

  }
}

class Player{
  constructor(image,name,x,y,friends){
    this.image = image;
    this.name = name;
    this.x = x;
    this.y = y;
    this.friends = friends;
  }
  draw(you){
    //Determine the other players position on the screen relative to yours centered on the screen
    var screenX = this.x - you.x + width / 2;
    var screenY = this.y - you.y + height / 2;
    fill("blue")
    text(this.name,screenX,screenY - 30);
    fill("white")
    text(this.name,screenX-1,screenY - 30 - 1);
    image(this.image,screenX,screenY,50,50);
  }
  collidedWith(other){
    if(dist(this.x,this.y,other.x,other.y) < 50){
      return true;
    }
    return false;
  }
}

class Background{
  constructor(image){
    this.image = image;
    this.width = this.image.width;
    this.height = this.image.height;
    this.backgroundXY = []
    //Tile the image on a 3 x 3 grid
    for(var i = 0; i < 9; i++){
      this.backgroundXY.push({"x":i % 3 * this.width,"y":Math.floor(i / 3) * this.height });
    }
  }
  scroll(direction){
    for(var i = 0; i < 9; i++){
      if(direction.includes("left")){
        this.backgroundXY[i].x-=speed;
        if(this.backgroundXY[i].x + this.width / 2 < 0){
          this.backgroundXY[i].x = this.backgroundXY[(i+2)%3].x + this.width ;
        }
      }
      if(direction.includes("right")){
        this.backgroundXY[i].x+=speed;
        if(this.backgroundXY[i].x - this.width / 2 > width){
          this.backgroundXY[i].x = this.backgroundXY[(i+2)%3].x - this.width;
        }
      }
      if(direction.includes("up")){
        this.backgroundXY[i].y-=speed;
        if(this.backgroundXY[i].y + this.height / 2 < 0){
          this.backgroundXY[i].y = this.backgroundXY[(i+2)%3].y + this.height;
        }
      }
      if(direction.includes("down")){
        this.backgroundXY[i].y+=speed;
        if(this.backgroundXY[i].y - this.height / 2 > height){
          this.backgroundXY[i].y = this.backgroundXY[(i+2)%3].y - this.height;
        }
      }
      this.image.x = this.backgroundXY[i].x
      this.image.y = this.backgroundXY[i].y
      this.image.draw();
    }
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
              "friends":[]
          })
          you = {uid:user.uid,friends:[],x:width/2,y:height/2};
          database.on('value',function(snapshot){
            data = snapshot.val();
            for(var key in data){
              if(players[key]){
                //If player exists update their position
                players[key].player.x = data[key].x
                players[key].player.y = data[key].y
                players[key].player.friends = data[key].friends
              }else{
                //If player doesn't exist add to the resources array to be later 
                //added to the players object
                resources.push({
                  uid:key,
                  name:data[key].name,
                  x:data[key].x,
                  y:data[key].y,
                  friends:data[key].friends,
                  photoURL: data[key].photo,
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




