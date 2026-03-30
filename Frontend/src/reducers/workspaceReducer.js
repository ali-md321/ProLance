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
  CLEAR_WORKSPACE_ERRORS,
} from "../constants/workspaceConstant";

const initialState = {
  project:   null,
  isLoading: false,
  actionLoading: false,
  error:     null,
};

export const workspaceReducer = (state = initialState, { type, payload }) => {
  switch (type) {

    case GET_WORKSPACE_REQUEST:
      return { ...state, isLoading: true, error: null };

    case GET_WORKSPACE_SUCCESS:
      return { ...state, isLoading: false, project: payload, error: null };

    case GET_WORKSPACE_FAIL:
      return { ...state, isLoading: false, error: payload };

    // ── milestone-only updates (milestones array comes back from API) ──────
    case WORKSPACE_ACTION_REQUEST:
      return { ...state, actionLoading: true, error: null };

    case WORKSPACE_ACTION_FAIL:
      return { ...state, actionLoading: false, error: payload };

    case ADD_MILESTONE_SUCCESS:
    case EDIT_MILESTONE_SUCCESS:
    case DELETE_MILESTONE_SUCCESS:
    case START_MILESTONE_SUCCESS:
    case SUBMIT_MILESTONE_SUCCESS:
    case REJECT_MILESTONE_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        project: state.project
          ? { ...state.project, milestones: payload }
          : state.project,
      };

    case APPROVE_MILESTONE_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        project: state.project
          ? {
              ...state.project,
              milestones: payload.milestones,
              status: payload.projectStatus || state.project.status,
            }
          : state.project,
      };

    case COMPLETE_PROJECT_SUCCESS:
      return {
        ...state,
        actionLoading: false,
        project: payload,
      };

    case CLEAR_WORKSPACE_ERRORS:
      return { ...state, error: null };

    default:
      return state;
  }
};