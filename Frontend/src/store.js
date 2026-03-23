import { createStore, applyMiddleware, combineReducers } from "redux";
import {thunk} from 'redux-thunk';
import { getUserDetailsReducer, userAuthReducer } from "./reducers/userReducer";
import { getAllClientProposalsReducer, getMyProjectsReducer, getMyProposalsReducer, getProjectDetailsReducer, getProjectProposalsReducer, getProjectsByFilterReducer } from "./reducers/projectReducer";

const reducers = combineReducers({
    user : userAuthReducer,
    userDetails : getUserDetailsReducer,
    myProjects : getMyProjectsReducer,
    projectDetails : getProjectDetailsReducer,
    allProjects : getProjectsByFilterReducer,
    myProposals : getMyProposalsReducer,
    projectProposals : getProjectProposalsReducer,
    allClientProposals : getAllClientProposalsReducer
})

const store = createStore(
    reducers,
    applyMiddleware(thunk)
)

export default store;
