import {REGISTER_USER_REQUEST,REGISTER_USER_SUCCESS,REGISTER_USER_FAIL,LOGIN_USER_REQUEST,LOGIN_USER_SUCCESS,LOGIN_USER_FAIL,LOAD_USER_REQUEST,LOAD_USER_SUCCESS,LOAD_USER_FAIL,LOGOUT_USER_SUCCESS,LOGOUT_USER_FAIL, CLEAR_ERRORS, GET_USER_DETAILS_REQUEST, GET_USER_DETAILS_SUCCESS, GET_USER_DETAILS_FAIL, EDIT_USER_REQUEST, EDIT_USER_SUCCESS, EDIT_USER_FAIL,} from '../constants/userConstant'

const intialState = {
    user : null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}
export const userAuthReducer = (state = intialState ,{type,payload}) => {

    switch(type){
        case LOGIN_USER_REQUEST:
        case LOAD_USER_REQUEST:
        case REGISTER_USER_REQUEST:
            return {
                isLoading : true,
                isAuthenticated : false
            }
        case EDIT_USER_REQUEST:
            return{
                ...state,
                isLoading : true,
                isAuthenticated  : true,
            }    
        case LOGIN_USER_SUCCESS:
        case LOAD_USER_SUCCESS:
        case REGISTER_USER_SUCCESS:
        case EDIT_USER_SUCCESS:
            return {
                user : payload,
                isLoading : false,
                isAuthenticated: true,
                error : null
            }
        case LOGOUT_USER_SUCCESS:
            return{
                user : null,
                isLoading : false,
                isAuthenticated : false,
            }
        case LOGIN_USER_FAIL:
        case REGISTER_USER_FAIL:
            return {
                ...state,
                user : null,
                isLoading : false,
                isAuthenticated : false,
                error : payload
            }
        case LOAD_USER_FAIL : 
            return {
                loading: false,
                isAuthenticated: false,
                user: null,
                error: payload,
            }
        case LOGOUT_USER_FAIL:
            return {
                ...state,
                isLoading :false,
                error : payload
            }
        case EDIT_USER_FAIL:
            return{
                ...state,
                isLoading : false,
                isAuthenticated : true,
                error : payload
            }
        case CLEAR_ERRORS: 
            return {
                ...state,
                error : null
            }
        default : return state; 
    }
}

export const getUserDetailsReducer = (state = {isLoading : true,userDetails : {}} ,{type,payload} ) => {
    
    switch(type){
        case GET_USER_DETAILS_REQUEST :
            return {
                ...state,
                isLoading : true,
            }
        case GET_USER_DETAILS_SUCCESS :
            return {
                isLoading : false,
                userDetails : payload,
            }
        case GET_USER_DETAILS_FAIL :
            return {
                ...state,
                isLoading : false,
                error : payload
            }
        default : return state;
    }
}