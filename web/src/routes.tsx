import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint'

const Routes = () => {
    return(
        <BrowserRouter>
            <Route component={CreatePoint} path="/cadastro"/>
            <Route component={Home} path="/" exact/>
        </BrowserRouter>
    )
}

export default Routes;