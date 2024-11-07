export let currentUserId = sessionStorage.getItem('currentUserId');;

export function setCurrentUserId(id) {
    currentUserId = id;
}