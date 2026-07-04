import {configureStore} from '@reduxjs/toolkit'

const store = configureStore({
    reducer: {
        auth: authSlice,
        //TODO: add more slice here for post --> post: postSlice,
    }
});



export default store;