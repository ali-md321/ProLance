import { CLEAR_ERRORS, GET_MYPROJECTS_FAIL, GET_MYPROJECTS_REQUEST, GET_MYPROJECTS_SUCCESS, PROJECT_DETAILS_REQUEST, PROJECT_DETAILS_SUCCESS, PROJECT_DETAILS_FAIL, PROJECT_DELETE_REQUEST, PROJECT_DELETE_SUCCESS, PROJECT_DELETE_FAIL, GET_PROJECTS_BY_FILTER_REQUEST, GET_PROJECTS_BY_FILTER_SUCCESS, GET_PROJECTS_BY_FILTER_FAIL, GET_MY_PROPOSALS_REQUEST, GET_MY_PROPOSALS_SUCCESS, GET_MY_PROPOSALS_FAIL, GET_PROJECT_PROPOSALS_REQUEST, GET_PROJECT_PROPOSALS_SUCCESS, GET_PROJECT_PROPOSALS_FAIL, GET_ALL_CLIENT_PROPOSALS_FAIL, GET_ALL_CLIENT_PROPOSALS_REQUEST, GET_ALL_CLIENT_PROPOSALS_SUCCESS, } from "../constants/projectConstant";

export const getMyProjectsReducer = (
  state = { isisLoading :false, projects: [] },
  {type, payload}
) => {
  switch (type) {
    case GET_MYPROJECTS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case GET_MYPROJECTS_SUCCESS:
      return {
        isLoading: false,
        projects: payload,
      };

    case GET_MYPROJECTS_FAIL:
      return {
        isLoading: false,
        error: payload,
      };
    case CLEAR_ERRORS :
        return {
            ...state,
            error : null
        }
    default:
      return state;
  }
};

export const getProjectDetailsReducer = (state = { project: null },{type,payload}) => {
  switch (type) {
    case PROJECT_DETAILS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case PROJECT_DETAILS_SUCCESS:
      return {
        isLoading: false,
        project: payload,
      };

    case PROJECT_DETAILS_FAIL:
      return {
        isLoading: false,
        error: payload,
      };

    default:
      return state;
  }
};

export const getProjectsByFilterReducer = (state = {projects:[]},{type,payload})=>{
  switch(type){
    case GET_PROJECTS_BY_FILTER_REQUEST:
      return{
        ...state,
        isLoading:true
      };
    case GET_PROJECTS_BY_FILTER_SUCCESS:
      return{
        isLoading:false,
        projects: payload
      };
    case GET_PROJECTS_BY_FILTER_FAIL:
      return{
        isLoading:false,
        error: payload
      };
    default:
      return state;
  }
};

export const getMyProposalsReducer = (state = {proposals:[]},{type,payload})=>{
  switch(type){
    case GET_MY_PROPOSALS_REQUEST:
      return{
        ...state,
        isLoading:true
      };
    case GET_MY_PROPOSALS_SUCCESS:
      return{
        isLoading:false,
        proposals: payload
      };
    case GET_MY_PROPOSALS_FAIL:
      return{
        isLoading:false,
        error: payload
      };
    default:
      return state;
  }
};

export const getProjectProposalsReducer = (state = {proposals:[]},{type,payload})=>{
  switch(type){
    case GET_PROJECT_PROPOSALS_REQUEST:
      return{
        ...state,
        isLoading:true
      };
    case GET_PROJECT_PROPOSALS_SUCCESS:
      return{
        isLoading:false,
        proposals: payload
      };
    case GET_PROJECT_PROPOSALS_FAIL:
      return{
        isLoading:false,
        error: payload
      };
    default:
      return state;
  }
};

export const getAllClientProposalsReducer = (state = { proposals: [],isLoading: false, error: null,}, {type,payload}) => {
  switch (type) {
    case GET_ALL_CLIENT_PROPOSALS_REQUEST:
      return { ...state, isLoading: true };
    case GET_ALL_CLIENT_PROPOSALS_SUCCESS:
      return {
        isLoading: false,
        proposals: payload,
      };
    case GET_ALL_CLIENT_PROPOSALS_FAIL:
      return {
        isLoading: false,
        error: payload,
      };
    default:
      return state;
  }
};
