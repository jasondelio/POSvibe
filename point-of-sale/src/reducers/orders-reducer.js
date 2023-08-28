function ordersReducer (state = [], action) {
    switch(action.type){
        case 'FETCH_CHOSEN_ORDERS':
            return [...action.data];
        default:
            return state;
    }
}

export default ordersReducer;