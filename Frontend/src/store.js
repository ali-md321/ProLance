// store.js  — replace your existing store.js with this
import { createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";

import { getUserDetailsReducer, userAuthReducer } from "./reducers/userReducer";
import {
  getAllClientProposalsReducer,
  getMyProjectsReducer,
  getMyProposalsReducer,
  getProjectDetailsReducer,
  getProjectProposalsReducer,
  getProjectsByFilterReducer,
} from "./reducers/projectReducer";
import {
  myChatsReducer,
  activeChatReducer,
  chatPresenceReducer,
} from "./reducers/chatReducer";
import { workspaceReducer } from "./reducers/workspaceReducer";

const reducers = combineReducers({
  // auth
  user:               userAuthReducer,
  userDetails:        getUserDetailsReducer,
  // projects
  myProjects:         getMyProjectsReducer,
  projectDetails:     getProjectDetailsReducer,
  allProjects:        getProjectsByFilterReducer,
  // proposals
  myProposals:        getMyProposalsReducer,
  projectProposals:   getProjectProposalsReducer,
  allClientProposals: getAllClientProposalsReducer,
  // chat
  myChats:            myChatsReducer,
  activeChat:         activeChatReducer,
  chatPresence:       chatPresenceReducer,
  // workspace
  workspace:          workspaceReducer,
});

const store = createStore(reducers, applyMiddleware(thunk));
export default store;