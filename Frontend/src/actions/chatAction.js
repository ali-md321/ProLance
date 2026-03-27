// actions/chatAction.js
import { axiosInstance as axios } from "../utils/axiosInstance";
import { GET_MY_CHATS_REQUEST, GET_MY_CHATS_SUCCESS, GET_MY_CHATS_FAIL, GET_OR_CREATE_CHAT_REQUEST, GET_OR_CREATE_CHAT_SUCCESS, GET_OR_CREATE_CHAT_FAIL, GET_CHAT_MESSAGES_REQUEST, GET_CHAT_MESSAGES_SUCCESS, GET_CHAT_MESSAGES_FAIL, SET_ACTIVE_CHAT, RECEIVE_MESSAGE, UPDATE_CHAT_LAST_MESSAGE, SET_ONLINE_USERS, SET_TYPING, CLEAR_TYPING, MARK_CHAT_READ, } from "../constants/chatConstant";

// ── Fetch sidebar chat list ───────────────────────────────────────────────
export const getMyChatsAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_MY_CHATS_REQUEST });
    const { data } = await axios.get("/api/chats");
    dispatch({ type: GET_MY_CHATS_SUCCESS, payload: data.chats });
  } catch (error) {
    dispatch({
      type: GET_MY_CHATS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ── Get or create a chat with a specific user ────────────────────────────
export const getOrCreateChatAction = (userId) => async (dispatch) => {
  try {
    dispatch({ type: GET_OR_CREATE_CHAT_REQUEST });
    const { data } = await axios.get(`/api/chats/user/${userId}`);
    dispatch({ type: GET_OR_CREATE_CHAT_SUCCESS, payload: data.chat });
    return data.chat;
  } catch (error) {
    dispatch({
      type: GET_OR_CREATE_CHAT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ── Fetch messages for a chat ─────────────────────────────────────────────
export const getChatMessagesAction = (chatId) => async (dispatch) => {
  try {
    dispatch({ type: GET_CHAT_MESSAGES_REQUEST });
    const { data } = await axios.get(`/api/chats/${chatId}/messages`);
    dispatch({ type: GET_CHAT_MESSAGES_SUCCESS, payload: { chatId, messages: data.messages } });
  } catch (error) {
    dispatch({
      type: GET_CHAT_MESSAGES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// ── Set the active open chat ──────────────────────────────────────────────
export const setActiveChatAction = (chat) => (dispatch) => {
  dispatch({ type: SET_ACTIVE_CHAT, payload: chat });
};

// ── Socket event dispatchers (called from Chat component) ─────────────────
export const receiveMessageAction    = (message)  => ({ type: RECEIVE_MESSAGE,          payload: message  });
export const updateChatLastMessage   = (data)     => ({ type: UPDATE_CHAT_LAST_MESSAGE,  payload: data     });
export const setOnlineUsersAction    = (users)    => ({ type: SET_ONLINE_USERS,          payload: users    });
export const setTypingAction         = (data)     => ({ type: SET_TYPING,                payload: data     });
export const clearTypingAction       = (data)     => ({ type: CLEAR_TYPING,              payload: data     });
export const markChatReadAction      = (chatId)   => ({ type: MARK_CHAT_READ,            payload: chatId   });