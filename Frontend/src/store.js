import { createStore, applyMiddleware, combineReducers } from "redux";
import {thunk} from 'redux-thunk';
import { userAuthReducer } from "./reducers/userReducer";

const reducers = combineReducers({
    user : userAuthReducer,
    
})

const store = createStore(
    reducers,
    applyMiddleware(thunk)
)

export default store;
