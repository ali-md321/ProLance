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
  CLEAR_WORKSPACE_ERRORS,
} from "../constants/workspaceConstant";

const initial = {
  project:        null,
  isLoading:      false,
  actionLoading:  false,
  paymentLoading: false,
  clientSecret:   null,
  error:          null,
  // stats
  freelancerStats: null,
  clientStats:     null,
  statsLoading:    false,
};

const updateMilestones = (state, milestones) => ({
  ...state, actionLoading: false,
  project: state.project ? { ...state.project, milestones } : state.project,
});

export const workspaceReducer = (state = initial, { type, payload }) => {
  switch (type) {
    case GET_WORKSPACE_REQUEST:    return { ...state, isLoading: true,  error: null };
    case GET_WORKSPACE_SUCCESS:    return { ...state, isLoading: false, project: payload, error: null };
    case GET_WORKSPACE_FAIL:       return { ...state, isLoading: false, error: payload };

    case WORKSPACE_ACTION_REQUEST: return { ...state, actionLoading: true,  error: null };
    case WORKSPACE_ACTION_FAIL:    return { ...state, actionLoading: false, error: payload };

    case ADD_MILESTONE_SUCCESS:
    case EDIT_MILESTONE_SUCCESS:
    case DELETE_MILESTONE_SUCCESS:
    case START_MILESTONE_SUCCESS:
    case SUBMIT_MILESTONE_SUCCESS:
    case REJECT_MILESTONE_SUCCESS:
      return updateMilestones(state, payload);

    case APPROVE_MILESTONE_SUCCESS:
      return updateMilestones(state, payload);

    case COMPLETE_PROJECT_SUCCESS:
      return { ...state, actionLoading: false, project: payload };

    // payment
    case PAYMENT_INTENT_REQUEST:
      return { ...state, paymentLoading: true, clientSecret: null, error: null };
    case PAYMENT_INTENT_SUCCESS:
      return { ...state, paymentLoading: false, clientSecret: payload.clientSecret };
    case PAYMENT_INTENT_FAIL:
      return { ...state, paymentLoading: false, error: payload };
    case PAYMENT_CONFIRM_SUCCESS:
      return {
        ...state, actionLoading: false,
        project: payload,
        clientSecret: null,
      };

    // review — mark locally so UI hides the form
    case REVIEW_SUCCESS:
      return {
        ...state, actionLoading: false,
        project: state.project ? {
          ...state.project,
          isReviewedByClient:     payload.type === "client"     ? true : state.project.isReviewedByClient,
          isReviewedByFreelancer: payload.type === "freelancer" ? true : state.project.isReviewedByFreelancer,
          clientReview:     payload.type === "client"     ? payload.review : state.project.clientReview,
          freelancerReview: payload.type === "freelancer" ? payload.review : state.project.freelancerReview,
        } : state.project,
      };

    // stats
    case GET_FREELANCER_STATS_REQUEST:
    case GET_CLIENT_STATS_REQUEST:
      return { ...state, statsLoading: true };
    case GET_FREELANCER_STATS_SUCCESS:
      return { ...state, statsLoading: false, freelancerStats: payload };
    case GET_CLIENT_STATS_SUCCESS:
      return { ...state, statsLoading: false, clientStats: payload };
    case GET_FREELANCER_STATS_FAIL:
    case GET_CLIENT_STATS_FAIL:
      return { ...state, statsLoading: false };

    case CLEAR_WORKSPACE_ERRORS:
      return { ...state, error: null };
    default:
      return state;
  }
};