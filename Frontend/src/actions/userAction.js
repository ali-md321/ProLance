import { axiosInstance as axios } from '../utils/axiosInstance';
import {REGISTER_USER_REQUEST,REGISTER_USER_SUCCESS,REGISTER_USER_FAIL,LOGIN_USER_REQUEST,LOGIN_USER_SUCCESS,LOGIN_USER_FAIL,LOAD_USER_REQUEST,LOAD_USER_SUCCESS,LOAD_USER_FAIL,LOGOUT_USER_SUCCESS,LOGOUT_USER_FAIL, CLEAR_ERRORS,} from '../constants/userConstant'

export const registerUserAction = (formData) => async(dispatch) => {
    try {
        dispatch({ type : REGISTER_USER_REQUEST});

        const config = {
            headers : {
                'Content-Type' : 'multipart/form-data'
            },
        }
        const { data } = await axios.post("/api/signup",formData,config, { withCredentials: true }); 
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
        disconnectSocket()
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