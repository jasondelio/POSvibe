function tablesReducer (state = [], action) {
    switch(action.type){
        case 'FETCH_TABLES':
            return [...action.tablesData];
        default:
            return state;
    }
}

export default tablesReducer;