// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import {StartStopButton} from './start_stop_button.jsx';
import {MatrixLine} from './matrix_line.js';

const Value = props => (
  <div>Value: {props.value} bitcoins!</div>
)

class BitcoinSocketComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {values: [], count: 0, started: true};
    this.lines = new Array();

    // This binding is necessary to make `this` work in the callback
    this.onOpen = this.onOpen.bind(this);
    this.onStartStopButtonClick = this.onStartStopButtonClick.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.updateLines = this.updateLines.bind(this);
    this.draw = this.draw.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  componentDidMount() {
    // Initialize the canvas
    var c = document.getElementById("matrix");
    this.ctx = c.getContext("2d");
    this.ctx.canvas.width  = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
    
    this.start();
  }
  
  componentWillUnmount() {
    this.stop();
  }
  
  onOpen(evt){
    //console.log("OPEN!");
    this.timerID = setInterval(function(){ this.websocket.send('{"op":"ping"}'); }, 30000);
    this.websocket.send('{"op":"unconfirmed_sub"}');
  }
  
  onMessage(evt){
    //console.log("MESSAGE!");
    var data = JSON.parse(evt.data);
    // That seems to happen sometime
    if (!data['x'] || !data['x']['out']){
      return;
    }

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
    //console.log(this.lines.length + "elements");
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

  onStartStopButtonClick(){
    if(this.state.started){
      this.stop();
    }else{
      this.start();
    }

    this.setState({
      started: !this.state.started
    });
  }

  render() {
    return (
      <div>
        <StartStopButton started={this.state.started} onClick={this.onStartStopButtonClick} />
        <canvas id="matrix"></canvas>
        <h2>{this.state.count} transactions</h2>
        {this.state.values.map((value, index) =>
          <Value key={index.toString()}
            value={value} />
        )}
      </div>
    );
  }
  
  // Stop the timers + the websocket connection
  stop(){
    this.websocket.close();
    clearInterval(this.timerID);
    clearInterval(this.updateTimerId);
    clearInterval(this.drawTimerId);
  }
  
  // Initialize the websocket and the draw/update timers
  start(){
    var wsUri = "wss://ws.blockchain.info/inv";
    this.websocket = new WebSocket(wsUri);
    window.websocket = this.websocket;
    this.websocket.onopen = this.onOpen;
    this.websocket.onmessage = this.onMessage;

    this.timerID = setInterval(function(){ this.websocket.send('{"op":"ping"}'); }, 30000);
    this.updateTimerId = setInterval( () => this.updateLines(0.066), 66);
    this.drawTimerId = setInterval( () => this.draw(), 66);
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
    <BitcoinSocketComponent />,
    document.getElementById('root'),
  )
})
