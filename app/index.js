import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import { BrowserRouter } from 'react-router-dom'
import { AppContainer } from 'react-hot-loader'

import './generic.css'
import { App } from './App'
import store from 'store'

const renderApp = (Component) => {
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <AppContainer>
          <Component />
        </AppContainer>
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
  )
}

renderApp(App)

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => renderApp(App))
}
