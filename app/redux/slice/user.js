import { createSlice } from "@reduxjs/toolkit";

const UserSlice = createSlice({
  name: "user",
  initialState: {},

  reducers: {
    commonUser: (state, action) => {
      const { oldToken, oldData, connectIn } = action.payload;
      state.data = oldData;
      state.token = oldToken;
      state.numOfCartP = oldData.cartPro?.length || 0;
      state.numOfNewOrder = oldData.newOrder?.length || 0;
      const { width, height } = window.screen;
      state.connectIn = connectIn;
      state.device =
        width <= 480 && height < 1000
          ? "Mobile"
          : width <= 900 && height < 2000
          ? "Tab"
          : "Desktop";
    },
  },
});

export const { commonUser, searchKeyManage } = UserSlice.actions;
export default UserSlice.reducer;
