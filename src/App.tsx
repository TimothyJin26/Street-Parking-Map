import { Wrapper } from '@googlemaps/react-wrapper';
import React from 'react';
import { useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import Test from './components/Test';

function App() {
    useEffect(() => {
        document.title = "Website Template";
    });

    return (
        <div className="App">
                <Home></Home>
            {/* <Test apiKey='AIzaSyAo_Xg46o9KHuxQVu4yvukI_B9hbvJoqJI'/> */}
        </div>
    );
}

export default App;
