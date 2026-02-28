import {REGISTER_USER_REQUEST,REGISTER_USER_SUCCESS,REGISTER_USER_FAIL,LOGIN_USER_REQUEST,LOGIN_USER_SUCCESS,LOGIN_USER_FAIL,LOAD_USER_REQUEST,LOAD_USER_SUCCESS,LOAD_USER_FAIL,LOGOUT_USER_SUCCESS,LOGOUT_USER_FAIL, CLEAR_ERRORS,} from '../constants/userConstant'

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
        case LOGIN_USER_SUCCESS:
        case LOAD_USER_SUCCESS:
        case REGISTER_USER_SUCCESS:
            return {
                user : payload,
                isLoading : false,
                isAuthenticated: true,
                error : null
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
        case LOGOUT_USER_SUCCESS:
            return{
                user : null,
                isLoading : false,
                isAuthenticated : false,
            }
        case LOGOUT_USER_FAIL:
            return {
                ...state,
                isLoading :false,
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