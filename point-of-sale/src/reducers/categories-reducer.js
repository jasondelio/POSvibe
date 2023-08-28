function categoriesReducer (state = [], action) {
    switch(action.type){
        case 'FETCH_CATEGORIES':
            return [...action.categoriesData];
        default:
            return state;
    }
}

export default categoriesReducer;