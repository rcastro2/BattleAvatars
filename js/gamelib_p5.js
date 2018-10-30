// Game Objects
class Sprite{
    constructor(image){
      this.image = image;
      this.y = height / 2;
      this.x = width / 2;
      this.width = this.image.width;
      this.height = this.image.height;
      this.scale = 1;
      this.visible = true;
    }
    draw(){
      if(this.visible){
        this.updateBoundaries();
        image(this.image,this.x,this.y);
      }
    } 
    moveTo(x,y){
        this.x = x; this.y = y;
        this.draw();
    }
    updateBoundaries(){
      this.left = this.x - (this.width * this.scale / 2);
      this.top = this.y - (this.height * this.scale / 2);
      this.right = this.x + (this.width * this.scale / 2);
      this.bottom = this.y + (this.height * this.scale / 2);
    }
    isOffScreen(side){
      var offscreen = false;
      if(side == undefined || side == "all"){
          offscreen = this.right < 0 || this.left > width || this.top > height || this.bottom < 0;
      }else if(side == "bottom"){
          offscreen = this.top > height;
      }else if(side == "top"){
          offscreen = this.bottom < 0;
      }else if(side == "left"){
          offscreen = this.right < 0;
      }else if(side == "right"){
          offscreen = this.left > width;
      }
      return offscreen;
  }
}

class Animation extends Sprite{
  constructor(image,frames,w,h,frameRate){
    super(image);
    this.image = image;
    this.currentFrame = 0;
    this.width = w;
    this.height = h;
    this.frames = frames;
    this.frameRate = frameRate;
    this.row = this.image.height / this.height;
    this.col = this.image.width / this.width;
  }
  draw(){
    if(this.visible){
      super.updateBoundaries();
      (this.currentFrame < this.frames - 1)?this.currentFrame += this.frameRate:this.currentFrame = 0;
      var sourceX = Math.floor(this.currentFrame) % this.col * this.width;
      var sourceY = Math.floor(this.currentFrame / this.col) * this.height;
      image(this.image,this.x,this.y,this.width,this.height,sourceX,sourceY,this.width,this.height);
    }
  }
}

//Supporting Functions
function randint(l,u){
    return Math.floor(Math.random()*(u-l)+l);
}

function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top)&&r1.visible&&r2.visible;
}