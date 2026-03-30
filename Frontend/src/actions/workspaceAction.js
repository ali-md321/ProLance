import { axiosInstance as axios } from "../utils/axiosInstance";
import {
  GET_WORKSPACE_REQUEST,
  GET_WORKSPACE_SUCCESS,
  GET_WORKSPACE_FAIL,
  ADD_MILESTONE_SUCCESS,
  EDIT_MILESTONE_SUCCESS,
  DELETE_MILESTONE_SUCCESS,
  START_MILESTONE_SUCCESS,
  SUBMIT_MILESTONE_SUCCESS,
  APPROVE_MILESTONE_SUCCESS,
  REJECT_MILESTONE_SUCCESS,
  COMPLETE_PROJECT_SUCCESS,
  WORKSPACE_ACTION_REQUEST,
  WORKSPACE_ACTION_FAIL,
} from "../constants/workspaceConstant";

// ── Get workspace data ───────────────────────────────────────────────────────
export const getWorkspaceAction = (projectId) => async (dispatch) => {
  try {
    dispatch({ type: GET_WORKSPACE_REQUEST });
    const { data } = await axios.get(`/api/workspace/${projectId}`);
    dispatch({ type: GET_WORKSPACE_SUCCESS, payload: data.project });
  } catch (error) {
    dispatch({
      type: GET_WORKSPACE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ── Add milestone (client) ───────────────────────────────────────────────────
export const addMilestoneAction = (projectId, milestoneData) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.post(`/api/workspace/${projectId}/milestones`, milestoneData);
    dispatch({ type: ADD_MILESTONE_SUCCESS, payload: data.milestones });
    return { success: true };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false, message: error.response?.data?.message };
  }
};

// ── Edit milestone (client) ──────────────────────────────────────────────────
export const editMilestoneAction = (projectId, milestoneId, milestoneData) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.patch(`/api/workspace/${projectId}/milestones/${milestoneId}/edit`, milestoneData);
    dispatch({ type: EDIT_MILESTONE_SUCCESS, payload: data.milestones });
    return { success: true };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false, message: error.response?.data?.message };
  }
};

// ── Delete milestone (client) ────────────────────────────────────────────────
export const deleteMilestoneAction = (projectId, milestoneId) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.delete(`/api/workspace/${projectId}/milestones/${milestoneId}`);
    dispatch({ type: DELETE_MILESTONE_SUCCESS, payload: data.milestones });
    return { success: true };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false, message: error.response?.data?.message };
  }
};

// ── Start milestone (freelancer) ─────────────────────────────────────────────
export const startMilestoneAction = (projectId, milestoneId) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.patch(`/api/workspace/${projectId}/milestones/${milestoneId}/start`);
    dispatch({ type: START_MILESTONE_SUCCESS, payload: data.milestones });
    return { success: true };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false, message: error.response?.data?.message };
  }
};

// ── Submit milestone (freelancer) ────────────────────────────────────────────
export const submitMilestoneAction = (projectId, milestoneId, payload) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.patch(`/api/workspace/${projectId}/milestones/${milestoneId}/submit`, payload);
    dispatch({ type: SUBMIT_MILESTONE_SUCCESS, payload: data.milestones });
    return { success: true };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false, message: error.response?.data?.message };
  }
};

// ── Approve milestone (client) ───────────────────────────────────────────────
export const approveMilestoneAction = (projectId, milestoneId) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.patch(`/api/workspace/${projectId}/milestones/${milestoneId}/approve`);
    dispatch({ type: APPROVE_MILESTONE_SUCCESS, payload: { milestones: data.milestones, projectStatus: data.projectStatus } });
    return { success: true, message: data.message };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false, message: error.response?.data?.message };
  }
};

// ── Reject milestone (client) ────────────────────────────────────────────────
export const rejectMilestoneAction = (projectId, milestoneId, feedback) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.patch(`/api/workspace/${projectId}/milestones/${milestoneId}/reject`, { feedback });
    dispatch({ type: REJECT_MILESTONE_SUCCESS, payload: data.milestones });
    return { success: true };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false, message: error.response?.data?.message };
  }
};

// ── Complete project manually (client) ──────────────────────────────────────
export const completeProjectAction = (projectId) => async (dispatch) => {
  try {
    dispatch({ type: WORKSPACE_ACTION_REQUEST });
    const { data } = await axios.patch(`/api/workspace/${projectId}/complete`);
    dispatch({ type: COMPLETE_PROJECT_SUCCESS, payload: data.project });
    return { success: true };
  } catch (error) {
    dispatch({ type: WORKSPACE_ACTION_FAIL, payload: error.response?.data?.message || error.message });
    return { success: false };
  }
};