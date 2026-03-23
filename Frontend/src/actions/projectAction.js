import { CREATE_PROJECT_FAIL, CREATE_PROJECT_REQUEST, CREATE_PROJECT_SUCCESS, GET_MYPROJECTS_FAIL, GET_MYPROJECTS_REQUEST, GET_MYPROJECTS_SUCCESS, PROJECT_DETAILS_REQUEST, PROJECT_DETAILS_SUCCESS, PROJECT_DETAILS_FAIL, PROJECT_DELETE_REQUEST, PROJECT_DELETE_SUCCESS, PROJECT_DELETE_FAIL, PROJECT_EDIT_REQUEST, PROJECT_EDIT_SUCCESS, PROJECT_EDIT_FAIL, GET_PROJECTS_BY_FILTER_REQUEST, GET_PROJECTS_BY_FILTER_SUCCESS, GET_PROJECTS_BY_FILTER_FAIL, GET_MY_PROPOSALS_SUCCESS, GET_MY_PROPOSALS_REQUEST, GET_MY_PROPOSALS_FAIL, CREATE_PROPOSAL_REQUEST, CREATE_PROPOSAL_SUCCESS, CREATE_PROPOSAL_FAIL, GET_PROJECT_PROPOSALS_REQUEST, GET_PROJECT_PROPOSALS_SUCCESS, GET_PROJECT_PROPOSALS_FAIL, ACCEPT_PROPOSAL_SUCCESS, REJECT_PROPOSAL_SUCCESS, GET_ALL_CLIENT_PROPOSALS_REQUEST, GET_ALL_CLIENT_PROPOSALS_SUCCESS, GET_ALL_CLIENT_PROPOSALS_FAIL, } from "../constants/projectConstant";
import { axiosInstance as axios} from "../utils/axiosInstance";


export const createProjectAction = (payload) => async(dispatch) => {
    try {

    dispatch({ type: CREATE_PROJECT_REQUEST });

    const config = {
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true
    };

    const {data} = await axios.post("/api/projects/create", payload, config);
    console.log("project:",data);
    dispatch({
      type: CREATE_PROJECT_SUCCESS,
      payload: data.project
    });
    return {success : true}
  } catch (error) {
    dispatch({
      type: CREATE_PROJECT_FAIL,
      payload: error.response?.data?.message || error.message
    });
    return {success : false}
  }
}

export const getMyProjectsAction = () => async(dispatch) => {
    try {

    dispatch({ type: GET_MYPROJECTS_REQUEST });

    const { data } = await axios.get("/api/projects");
    console.log("Myprojects:", data);
    dispatch({
      type: GET_MYPROJECTS_SUCCESS,
      payload: data.projects
    });
    return {success : true,}
  } catch (error) {
    dispatch({
      type: GET_MYPROJECTS_FAIL,
      payload: error.response?.data?.message || error.message
    });
    return {success : false}
  }
}

export const getProjectDetailsAction = (id) => async (dispatch) => {
  try {
    dispatch({ type: PROJECT_DETAILS_REQUEST });

    const { data } = await axios.get( `/api/projects/${id}`, { withCredentials: true });

    dispatch({
      type: PROJECT_DETAILS_SUCCESS,
      payload: data.project,
    });
  } catch (error) {
    dispatch({
      type: PROJECT_DETAILS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const deleteProjectAction = (id) => async (dispatch) => {
  try {
    dispatch({ type: PROJECT_DELETE_REQUEST });

    await axios.delete( `/api/projects/${id}`, { withCredentials: true });

    dispatch({
      type: PROJECT_DELETE_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: PROJECT_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const editProjectAction = (id,updatedData) => async (dispatch) => {
  try {
    dispatch({ type: PROJECT_EDIT_REQUEST });

    await axios.patch( `/api/edit-project/${id}`,updatedData, { withCredentials: true });

    dispatch({
      type: PROJECT_EDIT_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: PROJECT_EDIT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getProjectsByFilterAction = (filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: GET_PROJECTS_BY_FILTER_REQUEST });

    const { data } = await axios.get("/api/browse-projects", {params:filters,withCredentials:true});
    dispatch({
      type: GET_PROJECTS_BY_FILTER_SUCCESS,
      payload : data.projects
    });
  } catch (error) {
    dispatch({
      type: GET_PROJECTS_BY_FILTER_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const submitProposalAction = (data) => async (dispatch) => {
  try {
    dispatch({type : CREATE_PROPOSAL_REQUEST });
    console.log("data: ", data);
    const res = await axios.post("/api/proposals/create", data, {
      withCredentials: true,
    });

    dispatch({
      type : CREATE_PROPOSAL_SUCCESS,
      payload: res.data.proposal,
    });
  } catch (err) {
    dispatch({
      type: CREATE_PROPOSAL_FAIL,
      payload: err.response?.data?.message,
    });
  }
};

export const getMyProposalsAction = () => async(dispatch) => {
  try{
    dispatch({type:GET_MY_PROPOSALS_REQUEST});

    const {data} = await axios.get("/api/freelancer/my-proposals", {withCredentials:true} );
    dispatch({
      type:GET_MY_PROPOSALS_SUCCESS,
      payload:data.proposals
    });

  }catch(error){
    dispatch({
      type:GET_MY_PROPOSALS_FAIL,
      payload:error.response?.data?.message || error.message
    });
  }
};

export const getProposalsOfProjectAction = (id) => async(dispatch) => {
  try{
    dispatch({type:GET_PROJECT_PROPOSALS_REQUEST});

    const {data} = await axios.get(`/api/proposals/project/${id}`, {withCredentials:true} );
    dispatch({
      type:GET_PROJECT_PROPOSALS_SUCCESS,
      payload:data.proposals
    });

  }catch(error){
    dispatch({
      type:GET_PROJECT_PROPOSALS_FAIL,
      payload:error.response?.data?.message || error.message
    });
  }
};

export const acceptProposalAction = (id) => async(dispatch) => {
  try{
    const {data} = await axios.patch(`/api/proposals/accept/${id}`, {withCredentials:true} );
    console.log("accept",data);
    dispatch({
      type:ACCEPT_PROPOSAL_SUCCESS,
      payload:data.proposals
    });
  }catch(error){
    console.log("Proposal Acceptance Error!");
  }
};
export const rejectProposalAction = (id) => async(dispatch) => {
  try{
    const {data} = await axios.patch(`/api/proposals/reject/${id}`, {withCredentials:true} );
    dispatch({
      type:REJECT_PROPOSAL_SUCCESS,
      payload:data.proposals
    });
  }catch(error){
    console.log("Proposal rejectance Error!");
  }
};

export const getAllClientProposalsAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_CLIENT_PROPOSALS_REQUEST });
    const { data } = await axios.get(`/api/proposals/all`,{ withCredentials: true });
    console.log("AllProposals:",data);
    dispatch({
      type: GET_ALL_CLIENT_PROPOSALS_SUCCESS,
      payload: data.proposals,
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_CLIENT_PROPOSALS_FAIL,
      payload: error.response?.data?.message,
    });
  }
};

export const getFreelancerStatsAction = () => async(dispatch) => {

}





