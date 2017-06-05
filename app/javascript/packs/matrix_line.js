/* a single vertical, descending 'matrix style' line */
class MatrixLine {
  constructor(value, context){
    this.value = value;
    this.fontSize = 20;
    this.ctx = context;
    // How many columns we have
    var colSize = this.fontSize * 1.5;
    var colnum = this.ctx.canvas.width / colSize;
    this.text = this.value + " BTC";
    this.verticalSpacing = this.fontSize; // TODO: change size depending on value
    // Randomly choose a column (todo: don't overlap strings)
    var col = Math.floor(Math.random() * colnum);
    this.x = col * colSize;
    this.ylength = this.verticalSpacing * this.text.length;
    this.y = -this.ylength;
    this.speed = 50 * ( Math.random() * 0.5 + 0.5 );
  }
  
  update(dt){
    this.y += this.speed * dt;
    return this.y;
  }

  draw(){
    this.ctx.font = this.fontSize + 'px Arial';
    
    // 'matrix' style color gradient.
    var grd = this.ctx.createLinearGradient(0,this.y,0,this.y + this.ylength);
    grd.addColorStop(0,"green");
    grd.addColorStop(1,"white");
    this.ctx.fillStyle = grd;
     
    for (var i = 0; i < this.text.length; i++) {
      this.ctx.fillText(this.text[i], this.x, this.y + i * this.verticalSpacing);
    }
  }
}

export {MatrixLine};