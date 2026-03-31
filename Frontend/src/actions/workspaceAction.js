import { axiosInstance as axios } from "../utils/axiosInstance";
import {
  GET_WORKSPACE_REQUEST, GET_WORKSPACE_SUCCESS, GET_WORKSPACE_FAIL,
  ADD_MILESTONE_SUCCESS, EDIT_MILESTONE_SUCCESS, DELETE_MILESTONE_SUCCESS,
  START_MILESTONE_SUCCESS, SUBMIT_MILESTONE_SUCCESS,
  APPROVE_MILESTONE_SUCCESS, REJECT_MILESTONE_SUCCESS,
  COMPLETE_PROJECT_SUCCESS,
  PAYMENT_INTENT_REQUEST, PAYMENT_INTENT_SUCCESS, PAYMENT_INTENT_FAIL,
  PAYMENT_CONFIRM_SUCCESS,
  REVIEW_SUCCESS,
  WORKSPACE_ACTION_REQUEST, WORKSPACE_ACTION_FAIL,
  GET_FREELANCER_STATS_REQUEST, GET_FREELANCER_STATS_SUCCESS, GET_FREELANCER_STATS_FAIL,
  GET_CLIENT_STATS_REQUEST, GET_CLIENT_STATS_SUCCESS, GET_CLIENT_STATS_FAIL,
} from "../constants/workspaceConstant";

const act = (dispatch, type, payload) => dispatch({ type, payload });

// ── Workspace ────────────────────────────────────────────────────────────────
export const getWorkspaceAction = (id) => async (dispatch) => {
  try {
    act(dispatch, GET_WORKSPACE_REQUEST);
    const { data } = await axios.get(`/api/workspace/${id}`);
    act(dispatch, GET_WORKSPACE_SUCCESS, data.project);
  } catch (e) { act(dispatch, GET_WORKSPACE_FAIL, e.response?.data?.message || e.message); }
};

const milestoneAction = (url, method, payload, successType) => async (dispatch) => {
  try {
    act(dispatch, WORKSPACE_ACTION_REQUEST);
    const { data } = await axios[method](url, payload);
    act(dispatch, successType, data.milestones);
    return { success: true, message: data.message, allApproved: data.allApproved };
  } catch (e) {
    act(dispatch, WORKSPACE_ACTION_FAIL, e.response?.data?.message || e.message);
    return { success: false, message: e.response?.data?.message };
  }
};

export const addMilestoneAction    = (id, d) => milestoneAction(`/api/workspace/${id}/milestones`, "post", d, ADD_MILESTONE_SUCCESS);
export const editMilestoneAction   = (id, mid, d) => milestoneAction(`/api/workspace/${id}/milestones/${mid}/edit`, "patch", d, EDIT_MILESTONE_SUCCESS);
export const startMilestoneAction  = (id, mid) => milestoneAction(`/api/workspace/${id}/milestones/${mid}/start`, "patch", {}, START_MILESTONE_SUCCESS);
export const submitMilestoneAction = (id, mid, d) => milestoneAction(`/api/workspace/${id}/milestones/${mid}/submit`, "patch", d, SUBMIT_MILESTONE_SUCCESS);
export const approveMilestoneAction= (id, mid) => milestoneAction(`/api/workspace/${id}/milestones/${mid}/approve`, "patch", {}, APPROVE_MILESTONE_SUCCESS);
export const rejectMilestoneAction = (id, mid, feedback) => milestoneAction(`/api/workspace/${id}/milestones/${mid}/reject`, "patch", { feedback }, REJECT_MILESTONE_SUCCESS);

export const deleteMilestoneAction = (id, mid) => async (dispatch) => {
  try {
    act(dispatch, WORKSPACE_ACTION_REQUEST);
    const { data } = await axios.delete(`/api/workspace/${id}/milestones/${mid}`);
    act(dispatch, DELETE_MILESTONE_SUCCESS, data.milestones);
    return { success: true };
  } catch (e) {
    act(dispatch, WORKSPACE_ACTION_FAIL, e.response?.data?.message || e.message);
    return { success: false, message: e.response?.data?.message };
  }
};

export const completeProjectAction = (id) => async (dispatch) => {
  try {
    act(dispatch, WORKSPACE_ACTION_REQUEST);
    const { data } = await axios.patch(`/api/workspace/${id}/complete`);
    act(dispatch, COMPLETE_PROJECT_SUCCESS, data.project);
    return { success: true };
  } catch (e) {
    act(dispatch, WORKSPACE_ACTION_FAIL, e.response?.data?.message || e.message);
    return { success: false, message: e.response?.data?.message };
  }
};

// ── Payment ──────────────────────────────────────────────────────────────────
export const createPaymentIntentAction = (projectId) => async (dispatch) => {
  try {
    act(dispatch, PAYMENT_INTENT_REQUEST);
    const { data } = await axios.post(`/api/workspace/${projectId}/payment/intent`);
    act(dispatch, PAYMENT_INTENT_SUCCESS, data);
    return { success: true, clientSecret: data.clientSecret, paymentIntentId: data.paymentIntentId, amount: data.amount, freelancer: data.freelancer };
  } catch (e) {
    act(dispatch, PAYMENT_INTENT_FAIL, e.response?.data?.message || e.message);
    return { success: false, message: e.response?.data?.message };
  }
};

export const confirmPaymentAction = (projectId, paymentIntentId) => async (dispatch) => {
  try {
    act(dispatch, WORKSPACE_ACTION_REQUEST);
    const { data } = await axios.post(`/api/workspace/${projectId}/payment/confirm`, { paymentIntentId });
    act(dispatch, PAYMENT_CONFIRM_SUCCESS, data.project);
    return { success: true };
  } catch (e) {
    act(dispatch, WORKSPACE_ACTION_FAIL, e.response?.data?.message || e.message);
    return { success: false, message: e.response?.data?.message };
  }
};

// ── Reviews ──────────────────────────────────────────────────────────────────
export const reviewFreelancerAction = (projectId, payload) => async (dispatch) => {
  try {
    act(dispatch, WORKSPACE_ACTION_REQUEST);
    const { data } = await axios.post(`/api/workspace/${projectId}/review/freelancer`, payload);
    act(dispatch, REVIEW_SUCCESS, { type: "client", review: data.review });
    return { success: true };
  } catch (e) {
    act(dispatch, WORKSPACE_ACTION_FAIL, e.response?.data?.message || e.message);
    return { success: false, message: e.response?.data?.message };
  }
};

export const reviewClientAction = (projectId, payload) => async (dispatch) => {
  try {
    act(dispatch, WORKSPACE_ACTION_REQUEST);
    const { data } = await axios.post(`/api/workspace/${projectId}/review/client`, payload);
    act(dispatch, REVIEW_SUCCESS, { type: "freelancer", review: data.review });
    return { success: true };
  } catch (e) {
    act(dispatch, WORKSPACE_ACTION_FAIL, e.response?.data?.message || e.message);
    return { success: false, message: e.response?.data?.message };
  }
};

// ── Stats ────────────────────────────────────────────────────────────────────
export const getFreelancerStatsAction = () => async (dispatch) => {
  try {
    act(dispatch, GET_FREELANCER_STATS_REQUEST);
    const { data } = await axios.get("/api/stats/freelancer");
    act(dispatch, GET_FREELANCER_STATS_SUCCESS, data.stats);
  } catch (e) { act(dispatch, GET_FREELANCER_STATS_FAIL, e.response?.data?.message || e.message); }
};

export const getClientStatsAction = () => async (dispatch) => {
  try {
    act(dispatch, GET_CLIENT_STATS_REQUEST);
    const { data } = await axios.get("/api/stats/client");
    act(dispatch, GET_CLIENT_STATS_SUCCESS, data.stats);
  } catch (e) { act(dispatch, GET_CLIENT_STATS_FAIL, e.response?.data?.message || e.message); }
};