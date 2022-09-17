import { Wrapper } from '@googlemaps/react-wrapper';
import React from 'react';
import { useEffect } from 'react';
import './App.css';
import Home from './components/Home';

function App() {
    useEffect(() => {
        document.title = "Website Template";
    });

    return (
        <div className="App">
                <Home></Home>

        </div>
    );
}

export default App;
