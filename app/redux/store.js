import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./slice/user";
import ManagerSlice from "./slice/manager";
import PageHistorySlice from "./slice/pageHistory";
import ActivitySlice from "./slice/activity";

export const store = configureStore({
  reducer: {
    user: UserSlice,
    manager: ManagerSlice,
    pageHistory: PageHistorySlice,
    activity: ActivitySlice,
  },
  // devTools: { name: "user", features: { user: true, maactivitynager: false } },
});
