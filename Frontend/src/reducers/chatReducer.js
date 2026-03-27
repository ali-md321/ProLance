// reducers/chatReducer.js
import {
  GET_MY_CHATS_REQUEST,
  GET_MY_CHATS_SUCCESS,
  GET_MY_CHATS_FAIL,
  GET_OR_CREATE_CHAT_REQUEST,
  GET_OR_CREATE_CHAT_SUCCESS,
  GET_OR_CREATE_CHAT_FAIL,
  GET_CHAT_MESSAGES_REQUEST,
  GET_CHAT_MESSAGES_SUCCESS,
  GET_CHAT_MESSAGES_FAIL,
  SET_ACTIVE_CHAT,
  RECEIVE_MESSAGE,
  UPDATE_CHAT_LAST_MESSAGE,
  SET_ONLINE_USERS,
  SET_TYPING,
  CLEAR_TYPING,
  MARK_CHAT_READ,
} from "../constants/chatConstant";

// ── My Chats (sidebar) ────────────────────────────────────────────────────
const chatListInitial = { chats: [], isLoading: false, error: null };

export const myChatsReducer = (state = chatListInitial, { type, payload }) => {
  switch (type) {
    case GET_MY_CHATS_REQUEST:
      return { ...state, isLoading: true };

    case GET_MY_CHATS_SUCCESS:
      return { isLoading: false, chats: payload, error: null };

    case GET_MY_CHATS_FAIL:
      return { ...state, isLoading: false, error: payload };

    // when a new message arrives via socket, bubble it up to sidebar
    case UPDATE_CHAT_LAST_MESSAGE:
      return {
        ...state,
        chats: state.chats.map((c) =>
          c._id === payload.chatId
            ? { ...c, lastMessage: payload.lastMessage, lastMessageAt: payload.lastMessageAt }
            : c
        ),
      };

    // If the chat doesn't exist in sidebar yet, prepend it
    case GET_OR_CREATE_CHAT_SUCCESS: {
      const exists = state.chats.some((c) => c._id === payload._id);
      return {
        ...state,
        chats: exists ? state.chats : [payload, ...state.chats],
      };
    }

    case MARK_CHAT_READ:
      return {
        ...state,
        chats: state.chats.map((c) =>
          c._id === payload
            ? { ...c, unreadCounts: { ...c.unreadCounts, [payload]: 0 } }
            : c
        ),
      };

    default:
      return state;
  }
};

// ── Active chat + messages ────────────────────────────────────────────────
const activeChatInitial = {
  chat:       null,
  messages:   [],
  isLoading:  false,
  error:      null,
};

export const activeChatReducer = (state = activeChatInitial, { type, payload }) => {
  switch (type) {
    case SET_ACTIVE_CHAT:
      // only clear messages if switching to a different chat
      if (state.chat?._id === payload?._id) {
        return { ...state, chat: payload };
      }
      return { ...state, chat: payload, messages: [], isLoading: false };

    case GET_OR_CREATE_CHAT_REQUEST:
      return { ...state, isLoading: true };

    case GET_OR_CREATE_CHAT_SUCCESS:
      // only clear messages if this is a different chat than current
      if (state.chat?._id === payload?._id) {
        return { ...state, isLoading: false, chat: payload };
      }
      return { ...state, isLoading: false, chat: payload, messages: [] };

    case GET_OR_CREATE_CHAT_FAIL:
      return { ...state, isLoading: false, error: payload };

    case GET_CHAT_MESSAGES_REQUEST:
      return { ...state, isLoading: true };

    case GET_CHAT_MESSAGES_SUCCESS:
      return { ...state, isLoading: false, messages: payload.messages };

    case GET_CHAT_MESSAGES_FAIL:
      return { ...state, isLoading: false, error: payload };

    case RECEIVE_MESSAGE:
      // only append if message belongs to current active chat
      if (state.chat && payload.chat === state.chat._id) {
        // avoid duplicates
        const exists = state.messages.some((m) => m._id === payload._id);
        if (exists) return state;
        return { ...state, messages: [...state.messages, payload] };
      }
      return state;

    default:
      return state;
  }
};

// ── Online users + typing ─────────────────────────────────────────────────
const presenceInitial = { onlineUsers: [], typing: {} };

export const chatPresenceReducer = (state = presenceInitial, { type, payload }) => {
  switch (type) {
    case SET_ONLINE_USERS:
      return { ...state, onlineUsers: payload };

    case SET_TYPING:
      return {
        ...state,
        typing: { ...state.typing, [payload.chatId]: payload.userId },
      };

    case CLEAR_TYPING: {
      const t = { ...state.typing };
      delete t[payload.chatId];
      return { ...state, typing: t };
    }

    default:
      return state;
  }
};