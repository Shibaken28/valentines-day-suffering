

let red = [0x61,70,240,247,0x91,0x31];
let green = [0x2b,150,240,173,0x4b,0x1b];
let blue = [0x20,70,180,195,0x40,0x10];
let version="ver. 0.8.3";

      /*座標*/
class pos{
  constructor(y,x){
    this.y=y;
    this.x=x;
    this.col=0;
  }
  print(){
    print("(",this.y,",",this.x,")")
  }
  rotate(dir){
    dir=(dir+4)%4;
    for(let i=0;i<dir;i++){
      let y=this.y;
      this.y=-this.x;
      this.x=y;
    }
  }
}

function triangleP(a,b,c){
  triangle(a.x,a.y,b.x,b.y,c.x,c.y);
}

function inArea(a,b,x){
  // aとbが頂点(対角線を共有する)の長方形にxはあるか,ただしa<b
  return a.x<=x.x && x.x<=b.x && a.y<=x.y && x.y<=b.y;
}

/*ポリオミノ*/
class Choco{
  constructor(t){
    this.bar = new Array(0);
    this.col=t;
  }
  add(y,x){
    this.bar.push(new pos(y,x));
    this.bar[this.bar.length-1].col=this.col;
  }
  print(){
    this.bar.forEach(function(element){
      element.print();
    });
  }
  normalize(){
    let y=0,x=0;
    let n=this.bar.length;
    for(let i=0;i<n;i++){
      y+=this.bar[i].y;
      x+=this.bar[i].x;
    }
    x=int(x/n);
    y=int(y/n);
    for(let i=0;i<n;i++){
      this.bar[i].y-=y;
      this.bar[i].x-=x;
    }
  }
  drawShadow(y,x,size){
    this.bar.forEach(function(element){
      let by=y+size*element.y;
      let bx=x+size*element.x;
      fill(0,0,0,50);
      rect(bx+10,by+10,size,size);
    })
  }
  draw(y,x,size){
    this.bar.forEach(
      function(element){
      let by=y+size*element.y;
      let bx=x+size*element.x;
      let ey=by+size;
      let ex=bx+size;
      let cy=(by+ey)/2;
      let cx=(bx+ex)/2;
      let cen=new pos(cy,cx);
      let edge1=6;
      let edge2=8;
      let edge3=14;
      let r=red[element.col];
      let g=green[element.col];
      let b=blue[element.col];
      noStroke();
      
      let position=[new pos(by,bx),new pos(by,ex),new pos(ey,ex),new pos(ey,bx)];
      let colors=[1,0.4,0.7,1.5,1.1,0.7,1.6,0.9,0.5,1.1];
      for(let i=0;i<4;i++){
        fill(r*colors[i],g*colors[i],b*colors[i]);
        triangleP(position[i],position[(i+1)%4],cen);
      }
      fill(r*colors[4],g*colors[4],b*colors[4]);
      rect(bx+edge1,by+edge1,size-edge1*2,size-edge1*2);
      let positionIn=[new pos(by+edge2,bx+edge2),new pos(by+edge2,ex-edge2),new pos(ey-edge2,ex-edge2),new pos(ey-edge2,bx+edge2)];
      for(let i=0;i<4;i++){
        fill(r*colors[i+5],g*colors[i+5],b*colors[i+5]);
        triangleP(positionIn[i],positionIn[(i+1)%4],cen);
      }
      fill(r*colors[9],g*colors[9],b*colors[9]);
      rect(bx+edge3,by+edge3,size-edge3*2,size-edge3*2);
    })
  }

  isTouched(y,x,size){
    let touched = false;
    for(let i=0;i<this.bar.length;i++){
      let a = new pos(y+this.bar[i].y*size, x+this.bar[i].x*size);
      let b = new pos(a.y+size,a.x+size);
      let T = new pos(mouseY,mouseX);
      let d = inArea(a,b,T);
      touched |= d;
    }
    return touched;
  }
  rotate(dir){
    this.bar.forEach(function(element){
      element.rotate(dir);
    });
    this.normalize();
  }
}

/*盤面*/
class Board{
  constructor(h,w,board,num,size){
    this.h=h;
    this.w=w;
    this.pos = new pos(100,100);
    this.size = size;
    this.num = num;
    this.having=-1;
    this.dpos = new pos(0,0);
    this.parts = new Array(num);
    this.position = new Array(num);
    this.lay = new Array(num);
    this.isPut = new Array(this.h);
    for(let i=0;i<num;i++){
      this.parts[i]=new Choco(i%6);
      this.position[i] = new pos(random(height-500)+250,random(width-500)+300);
      this.lay[i] = i;
    }
    for(let r=0;r<h;r++){
      this.isPut[r] = new Array(this.w);
      for(let c=0;c<w;c++){
        this.isPut[r][c]=-1;
        let n=board[r][c];
        this.parts[n].add(r,c);
      }
    }
    this.parts.forEach(function(part){
      part.normalize();
    });
  }
  isHaving(){
    return this.having!=-1;
  }
  print(){
    this.parts.forEach(function(part){
      print("parts:");
      part.print();
    });
  }
  draw(){
     stroke(200,100,100);
    strokeWeight(4);
    for(let r=0;r<this.h;r++){
      for(let c=0;c<this.w;c++){
        if(this.isPut[r][c]==-1){
          
    fill(200,200,200,200);
        }else{
          
    fill(200,0,200,200);
        }
        rect(this.pos.x+c*this.size,this.pos.y+r*this.size,this.size,this.size);
      }
    }
    for(let i=0;i<this.num;i++){
      let id=this.lay[i];
      if(this.having==id){
        this.parts[id].drawShadow(this.position[id].y,this.position[id].x,this.size);
      }
      this.parts[id].draw(this.position[id].y,this.position[id].x,this.size);
    }
    
   
  }
  clicked(){
    for(let i=this.num-1;i>=0;i--){
      let id = this.lay[i];
      let T=this.parts[id].isTouched(this.position[id].y,this.position[id].x,this.size);
      if(T){
        let tmp=this.lay.splice(i,1)[0];
        this.dpos.x=this.position[id].x-mouseX;
        this.dpos.y=this.position[id].y-mouseY;
        this.having=tmp;
        this.lay.push(tmp);
        for(let r=0;r<this.h;r++){
          for(let c=0;c<this.w;c++){
            if(this.isPut[r][c]==this.having){
              this.isPut[r][c]=-1;
            }
          }
        }
        break;
      }
    }
  }
  pressed(){
    if(!this.isHaving())return;
    this.position[this.having].x = mouseX + this.dpos.x;
    this.position[this.having].y = mouseY + this.dpos.y;
  }
  
  released(){
    if(!this.isHaving())return;
    let nx=this.position[this.having].x;
    let ny=this.position[this.having].y;
    let x=nx-this.pos.x;
    let y=ny-this.pos.y;
    let c=int((x+this.size/2)/this.size);
    let r=int((y+this.size/2)/this.size);
    let bx=c*this.size+this.pos.x;
    let by=r*this.size+this.pos.y;
    if(abs(bx-nx)<=this.size/3&&abs(by-ny)<=this.size){
      //r,cに置いていいかな？
      let ok=true;
      for(let i=0;i<this.parts[this.having].bar.length;i++){
        let br=r+this.parts[this.having].bar[i].y;
        let bc=c+this.parts[this.having].bar[i].x;
        if(0<=br&&br<this.h&&0<=bc&&bc<this.w){
          if(this.isPut[br][bc]!=-1){
            ok=false;
          }
        }else{
          ok=false;
        }
      }
      if(ok){
        this.position[this.having].x = bx;
        this.position[this.having].y = by;
        for(let i=0;i<this.parts[this.having].bar.length;i++){
          let br=r+this.parts[this.having].bar[i].y;
          let bc=c+this.parts[this.having].bar[i].x;
          this.isPut[br][bc]=this.having;
        }
      }
    }
    this.having=-1;
    //完成したかな
    let clear=true;
    for(let r=0;r<this.h;r++){
      for(let c=0;c<this.w;c++){
        clear &= (this.isPut[r][c]!=-1);
      }
    }
    
    if(clear)alert("クリアおめでとう！");
    
  }
  rotate(d){
    if(!this.isHaving())return;
    this.parts[this.having].rotate(d);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  problem=[
    [00,07,07,08,08,08],
    [00,07,07,07,08,08],
    [00,00,00,09,08,09],
    [06,06,06,09,09,09],
    [10,10,05,05,11,11],
    [10,05,05,11,11,11],
    [10,05,05,11,03,03],
    [10,01,01,04,04,03],
    [01,01,04,04,02,03],
    [01,02,02,02,02,03],
  ];
  board = new Board(10,6,problem,12,50);
  //board.print();
}


function draw() {
  background("#EEEEEE");
  drawBackground();
  rotate(2*PI-0.1);
  fill(0);
  textAlign(LEFT, TOP);
  text(version,10,10);
  blendMode(BLEND);
  board.draw();
  if(mouseIsPressed){
    board.pressed();
  }
}

function drawBackground(){
  blendMode(MULTIPLY);
  //縦ストライプ
  rotate(0.1);
  noStroke();
  fill("#F9C1CF");
  let out=300;
  for(let x=-out;x<width+out;x+=100){
    rect(x,-out,50,height+out*2);
  }
  
  fill("#F9B1BF");
  //横ストライプ
  for(let y=-out;y<height+out;y+=100){
    rect(-out,y,width+out*2,50);
  }
  
}


function mousePressed(){
  board.clicked();
}

function mouseReleased(){
  board.released();
}

function keyTyped() {
  if (key === 'a') {
    board.rotate(1);
  } else if (key === 'd') {
    board.rotate(-1);
  }
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

