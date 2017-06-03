// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'


const Value = props => (
  <div>Value: {props.value} bitcoins!</div>
)

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {values: [1,2,3]};
    
    // This binding is necessary to make `this` work in the callback
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  componentDidMount() {
    var wsUri = "wss://ws.blockchain.info/inv";
    this.websocket = new WebSocket(wsUri);
    window.websocket = this.websocket;
    
    this.websocket.onopen = this.onOpen;
    this.websocket.onmessage = this.onMessage;

    this.timerID = setInterval(function(){ this.websocket.send('{"op":"ping"}'); }, 30000);
  }
  
  componentWillUnmount() {
    clearInterval(this.timerID);
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
    console.log(value);
    
    var values = this.state.values;
    values.unshift(value);
    values = values.slice(0,10);
    this.setState({
      values: values
    });
    
    this.state.values.push(value);
    //this.closeSocket();
  }
  
  closeSocket(){
    clearInterval(this.timerID);
    this.websocket.close();
  }
    
  render() {
    return <div>
      <h1>Hello, {this.props.name}</h1>
      {this.state.values.map((value, index) =>
        <Value key={index.toString()}
                  value={value} />
      )}
    </div>
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Welcome name="Jerome" />,
    document.getElementById('root'),
  )
})
