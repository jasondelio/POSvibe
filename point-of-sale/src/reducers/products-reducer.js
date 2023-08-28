function productsReducer (state = [], action) {
    switch(action.type){
        case 'FETCH_PRODUCTS':
            return [...action.productsData];
        default:
            return state;
    }
}

export default productsReducer;