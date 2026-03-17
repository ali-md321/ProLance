import { createStore, applyMiddleware, combineReducers } from "redux";
import {thunk} from 'redux-thunk';
import { getUserDetailsReducer, userAuthReducer } from "./reducers/userReducer";
import { getMyProjectsReducer, getProjectDetailsReducer, getProjectsByFilterReducer } from "./reducers/projectReducer";
import { getMyProposalsAction } from "./actions/projectAction";

const reducers = combineReducers({
    user : userAuthReducer,
    userDetails : getUserDetailsReducer,
    myProjects : getMyProjectsReducer,
    projectDetails : getProjectDetailsReducer,
    allProjects : getProjectsByFilterReducer,
    myProposals : getMyProposalsAction
})

const store = createStore(
    reducers,
    applyMiddleware(thunk)
)

export default store;
