import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

export default class StartStopButton extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    if(this.props.started){
      return <button onClick={this.props.onClick}>Stop</button>;
    }
    else{
      return <button onClick={this.props.onClick}>Start</button>;
    }
  }
}
