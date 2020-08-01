import {normalizeResponseErrors} from './utils';
import {API_BASE_URL} from '../config';
import {loadAuthToken} from '../local-storage';
//use this as generic student request
export const USER_REQUEST = 'USER_REQUEST';
export const userRequest = () => ({
    type:USER_REQUEST
});

export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const getUserSuccess = (users) => ({
    type:GET_USER_SUCCESS,
    users
});
//use this as generic student error
export const USER_ERROR = 'USER_ERROR';
export const userError = (error) => ({
    type:USER_ERROR,
    error
});

export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';
export const createStudentSuccess = () => ({
    type:CREATE_USER_SUCCESS
});

export const getUsers = () => (dispatch,getState) => {
    dispatch(userRequest());
    const authToken = getState().auth.authToken;

    return (
        fetch(`${API_BASE_URL}/users`,{
            method:'GET',
            headers:{
                Authorization: `Bearer ${authToken}`
            }
        })

        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then((res) => {
            dispatch(getUserSuccess(res.users));
        })
        .catch(err => {
            console.log('error getting students ',err);
            dispatch(userError(err));
        })
    );
};
