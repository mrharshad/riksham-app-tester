import { createSlice, nanoid } from "@reduxjs/toolkit";

const Slice = createSlice({
  initialUser: {
    userData: {},
  },

  reducers: {
    findUser: (state, action) => {
      const data = {
        id: nanoid(),
        fName: action.fName,
      };
      state.userData = data;
    },
  },
});

export const { findUser } = Slice.actions;
export default Slice.reducer;
