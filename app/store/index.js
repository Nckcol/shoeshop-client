import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import thunk from 'redux-thunk'

/* REDUCERS */
const reducer = combineReducers({
  /* INSERT REDUCERS */
})

/* MIDDLEWARE */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const middleware = composeEnhancers(
  applyMiddleware(
    thunk
  )
)

const store = createStore(reducer, middleware)

export default store
