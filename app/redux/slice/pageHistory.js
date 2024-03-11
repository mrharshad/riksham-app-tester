import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchSearchKeys = createAsyncThunk(
  "fetchSearchKeys",
  async (key) => {
    const request = await fetch(
      `/api/product/${key}`,

      {
        cache: "no-cache",
      }
    );

    return await request.json();
  }
);

const PageHistorySlice = createSlice({
  name: "pageHistory",
  initialState: {
    loading: false,
    current: "other",
    tOfPKeys: [],
    nameKeys: [],
    filteredSearch: [],
    searches: [],
    tOfPFetch: false,
    suggestion: "0px",
    pSOS: false,
  },

  reducers: {
    newPage: (state, action) => {
      const pageName = action.payload;
      state[pageName] = { scrolled: 0 };
    },
    pageKeyChange: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },

    position: (state, action) => {
      const { name, current } = action.payload;
      const oldP = state[name].scrolled;
      if (state.suggestion !== "0px") {
        state.suggestion = "0px";
      }

      if (
        (oldP + 500 < current || oldP > current + 500) &&
        oldP - 1000 < current
      ) {
        state[name].scrolled = current;
      }
    },

    clearSearch: (state, action) => {
      state.searches = [];
      state.tOfPKeys = [];
      state.filteredSearch = [];
      state.nameKeys = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSearchKeys.pending, (state, action) => {});
    builder.addCase(fetchSearchKeys.fulfilled, (state, action) => {
      const { success, nameKeys, tOfPKeys, key } = action.payload;
      let filtered = [];

      if (tOfPKeys.length > 0) {
        const uniqueTOfP = [...new Set([...state.tOfPKeys.concat(tOfPKeys)])];
        state.tOfPKeys = uniqueTOfP;
        filtered = uniqueTOfP.filter((keys) => keys.includes(key));
      }
      if (nameKeys.length > 0) {
        const uniqueName = state.nameKeys;
        const ids = uniqueName.map((obj) => obj._id);
        for (let key of nameKeys) {
          const { name, _id } = key;
          if (!ids.includes(_id)) {
            uniqueName.push({ name, type: Number(_id) });
          }
        }
        state.nameKeys = uniqueName;
        filtered.push(...uniqueName.filter((obj) => obj.name.includes(key)));
      }
      state.filteredSearch = filtered.slice(0, 10);
      state.searches.push(key);
    });
    builder.addCase(fetchSearchKeys.rejected, (state, action) => {});
  },
});

export const { position, newPage, pageKeyChange, clearSearch } =
  PageHistorySlice.actions;
export default PageHistorySlice.reducer;
