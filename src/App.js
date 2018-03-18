import React, { Component } from 'react';
import './App.css';
import BarChart from './component/BarChart'
import ForceLayout from './component/force'


class App extends Component {
  render() {
      return (
        <div className='App'>
            <div>
                <ForceLayout />
            </div>
            <div>
                <BarChart data={[5,10,1,3,2,8,6,5,7,3,12]} size={[500,500]} />
            </div>
        </div>
     )
  }
}

export default App;
