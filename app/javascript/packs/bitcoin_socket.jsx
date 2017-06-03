// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'


const Value = props => (
  <div>Value: {props.value} bitcoins!</div>
)

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

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {values: [], count: 0};
    this.lines = new Array();

    // This binding is necessary to make `this` work in the callback
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.updateLines = this.updateLines.bind(this);
    this.draw = this.draw.bind(this);
  }

  componentDidMount() {
    var wsUri = "wss://ws.blockchain.info/inv";
    this.websocket = new WebSocket(wsUri);
    window.websocket = this.websocket;
    
    this.websocket.onopen = this.onOpen;
    this.websocket.onmessage = this.onMessage;

    this.timerID = setInterval(function(){ this.websocket.send('{"op":"ping"}'); }, 30000);
    this.updateTimerId = setInterval( () => this.updateLines(0.066), 66);
    this.drawTimerId = setInterval( () => this.draw(), 66);
    
    // Initialize the canvas
    var c = document.getElementById("matrix");
    this.ctx = c.getContext("2d");
    this.ctx.canvas.width  = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
  }
  
  componentWillUnmount() {
    clearInterval(this.timerID);
    clearInterval(this.updateTimerId);
    clearInterval(this.drawTimerId);
  }
  
  onOpen(evt){
    console.log("OPEN!");
    this.timerID = setInterval(function(){ this.websocket.send('{"op":"ping"}'); }, 30000);
    this.websocket.send('{"op":"unconfirmed_sub"}');
  }
  
  onMessage(evt){
    console.log("MESSAGE!");
    var data = JSON.parse(evt.data);
    var value = data['x']['out'][0].value;
    value = value / Math.pow(10,8);
    //console.log(value);
    
    this.lines.push( new MatrixLine(value, this.ctx) );
    var values = this.state.values;
    values.unshift(value);
    // Only keep the 10 most recent transactions
    values = values.slice(0,10);
    this.setState({
      values: values,
      count: this.state.count + 1,
    });
    
    this.state.values.push(value);
    //this.closeSocket();
  }
  
  closeSocket(){
    clearInterval(this.timerID);
    this.websocket.close();
  }
  
  updateLines(dt){
    var toRemove = new Array();
    console.log(this.lines.length + "elements");
    this.lines.forEach(function(element,index) {
      // Update line position and delete it when it goes out of the frame.
      var y = element.update(dt);
      if(y > this.ctx.canvas.height){
        toRemove.push(index);
      }
    }, this);

    toRemove.forEach( function(element){
      this.lines.splice(element,1);
    }, this);
  }

  render() {
    return <div>
      <h1>{this.state.count} transactions</h1>
      {this.state.values.map((value, index) =>
        <Value key={index.toString()}
                  value={value} />
      )}
    </div>
  }
  
  draw(){
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].draw();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Welcome name="Jerome" />,
    document.getElementById('root'),
  )
})
