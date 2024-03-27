import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const updateDetails = createAsyncThunk(
  "updateDetails",
  async (query) => {
    const request = await fetch(`/api/admin/user/update-details`, {
      method: "PUT",
      body: JSON.stringify(query),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await request.json();
  }
);

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
    userKeyChange: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },
    logOut: (state, action) => {
      state.data = {};
      state.numOfNewOrder = 0;
      state.numOfCartP = 0;
      state.token = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateDetails.pending, (state, action) => {
      state.uSos = true;
    });
    builder.addCase(updateDetails.fulfilled, (state, action) => {
      const { success, message, data = {} } = action.payload;
      state.uSos = { type: success ? "Success" : "Error", message };

      state.data = Object.assign(state.data, data);
    });
    builder.addCase(updateDetails.rejected, (state, action) => {
      state.uSos = { type: "Error", message: action.error.message };
    });
  },
});

export const { commonUser, userKeyChange, logOut } = UserSlice.actions;
export default UserSlice.reducer;
