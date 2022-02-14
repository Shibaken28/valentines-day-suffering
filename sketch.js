

let red = [0x61,70,240,247,0x91,0x31];
let green = [0x2b,150,240,173,0x4b,0x1b];
let blue = [0x20,70,180,195,0x40,0x10];
let version="ver. 0.8.7";
let beep;


function preload() {
  song = loadSound('beep.mp3');
}


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
      this.position[i] = new pos(random(height-300)+150,random(width-300)+150);
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
    song.play();
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
    
    if(clear)alert("おめでとう！\nあなたはチョコレートパズルをクリアしました！");
    
  }
  rotate(d){
    if(!this.isHaving())return;
    this.parts[this.having].rotate(d);
  }
}



(function(_0x24acb5,_0x22c726){const _0xddcdc=_0x1fdd,_0x5a513f=_0x24acb5();while(!![]){try{const _0xf5ef63=-parseInt(_0xddcdc(0x183))/0x1*(-parseInt(_0xddcdc(0x185))/0x2)+parseInt(_0xddcdc(0x182))/0x3+parseInt(_0xddcdc(0x181))/0x4+parseInt(_0xddcdc(0x187))/0x5+-parseInt(_0xddcdc(0x188))/0x6+-parseInt(_0xddcdc(0x180))/0x7*(-parseInt(_0xddcdc(0x186))/0x8)+-parseInt(_0xddcdc(0x184))/0x9;if(_0xf5ef63===_0x22c726)break;else _0x5a513f['push'](_0x5a513f['shift']());}catch(_0x5306a0){_0x5a513f['push'](_0x5a513f['shift']());}}}(_0x108c,0x6bc9f));function _0x1fdd(_0x3a9f7b,_0xcbb46e){const _0x108c57=_0x108c();return _0x1fdd=function(_0x1fdddb,_0x107923){_0x1fdddb=_0x1fdddb-0x17f;let _0x31436c=_0x108c57[_0x1fdddb];return _0x31436c;},_0x1fdd(_0x3a9f7b,_0xcbb46e);}function decode(_0x282375){const _0x5e4be3=_0x1fdd;let _0x457bcf=_0x282375[_0x5e4be3(0x17f)],_0x3a74e3=_0x282375[0x0][_0x5e4be3(0x17f)];P=new Array(_0x457bcf);for(let _0x569768=0x0;_0x569768<_0x457bcf;_0x569768++){P[_0x569768]=new Array(_0x3a74e3,0x0);}for(let _0x507c04=0x0;_0x507c04<_0x457bcf;_0x507c04++){for(let _0x1fa482=0x0;_0x1fa482<_0x3a74e3;_0x1fa482++){P[_0x507c04][_0x1fa482]=_0x507c04*_0x3a74e3+_0x3a74e3-_0x1fa482^_0x282375[_0x507c04][_0x1fa482];}}return P;}function _0x108c(){const _0x3460de=['4KPLvJA','159928xhxZIV','788880UqIESB','2236086MuRkEX','length','189UIcUOy','724392ralZPu','1845105MkgKpI','397458qjgFOX','13269582yrwAXm'];_0x108c=function(){return _0x3460de;};return _0x108c();}


function setup() {
  createCanvas(windowWidth, windowHeight);
  dummy=[
    [6,2,3,11,10,9],
    [12,12,13,14,0,15],
    [18,17,16,6,6,4],
    [30,17,16,28,29,26],
    [20,23,25,30,17,18],
    [46,38,39,42,43,20],
    [32,44,45,44,37,38],
    [58,46,47,41,40,40],
    [55,52,48,55,48,50],
    [61,57,56,59,58,52]
  ]
  
  let problem = decode(dummy);
  
  board = new Board(10,6,problem,12,40);
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


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

