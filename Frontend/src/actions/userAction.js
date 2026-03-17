import { axiosInstance as axios } from '../utils/axiosInstance';
import {REGISTER_USER_REQUEST,REGISTER_USER_SUCCESS,REGISTER_USER_FAIL,LOGIN_USER_REQUEST,LOGIN_USER_SUCCESS,LOGIN_USER_FAIL,LOAD_USER_REQUEST,LOAD_USER_SUCCESS,LOAD_USER_FAIL,LOGOUT_USER_SUCCESS,LOGOUT_USER_FAIL, CLEAR_ERRORS, GET_USER_DETAILS_REQUEST, GET_USER_DETAILS_SUCCESS, GET_USER_DETAILS_FAIL, EDIT_USER_REQUEST, EDIT_USER_SUCCESS, EDIT_USER_FAIL,} from '../constants/userConstant'

export const registerUserAction = ({name,email,password,role}) => async(dispatch) => {
    try {
        dispatch({ type : REGISTER_USER_REQUEST});

        const { data } = await axios.post("/api/signup",{name,email,password,role}, { withCredentials: true }); 
        dispatch({
            type : REGISTER_USER_SUCCESS,
            payload : data.user
        }) 
        return {success : true};       
    } catch (error) {
        dispatch({
            type : REGISTER_USER_FAIL,
            payload : error.response?.data?.message || error.message || "Something Went wrong"
        })
        return {success : false};       
    }
}

export const LoginUserAction = ({email,password}) => async (dispatch) =>{
    try {
        dispatch({type : LOGIN_USER_REQUEST});
        const {data} = await axios.post("/api/login",{email,password}, { withCredentials: true }); 
        dispatch({
            type : LOGIN_USER_SUCCESS,
            payload : data.user
        })
        return {success : true};
    } catch (error) {
        dispatch({
            type : LOGIN_USER_FAIL,
            payload : error.response?.data?.message || error.message
        })
        return {success : false};
    }
}

export const logoutUserAction = () => async(dispatch) => {
    try{
        await axios.get("/api/logout");
        dispatch({ type: LOGOUT_USER_SUCCESS });
    } catch (error) {
        dispatch({
            type: LOGOUT_USER_FAIL,
            payload: error.response?.data?.message || error.message
        })
    }
}

export const loadUserAction = () => async(dispatch) => {
    try{
        dispatch({type : LOAD_USER_REQUEST});
        const {data} = await axios.get(`/api/user/me`,{
            withCredentials: true 
        });
        dispatch({
            type: LOAD_USER_SUCCESS,
            payload: data.userDetails
        });
    }catch(error){
        dispatch({
            type: LOAD_USER_FAIL,
            payload: error.response?.data?.message || error.message
        })
    }
}

export const getUserDetailsAction = (id) => async(dispatch) => {
    try{
        dispatch({type : GET_USER_DETAILS_REQUEST});
        const {data} = await axios.get(`/api/user/${id}`,{
            withCredentials: true 
        });
        console.log("UserDetails:",data);
        dispatch({
            type: GET_USER_DETAILS_SUCCESS,
            payload: data.userDetails
        });
        return {
            user: data.userDetails
        }
    }catch(error){
        dispatch({
            type: GET_USER_DETAILS_FAIL,
            payload: error.response?.data?.message || error.message
        })
    }
}

export const editUserAction = (payload) => async(dispatch) => {
    try{
        dispatch({type : EDIT_USER_REQUEST});
                console.log("edit form:",payload);
        const {data} = await axios.patch(`/api/user/me`,payload,{
            withCredentials: true 
        });
        dispatch({
            type: EDIT_USER_SUCCESS,
            payload: data.user
        });

    }catch(error){
        dispatch({
            type: EDIT_USER_FAIL,
            payload: error.response?.data?.message || error.message
        })
    }
}

export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};