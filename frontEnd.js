export default function frontendWaiters (db){

//this variable will store message based on if certain conditions are not met
    let errorMessage = "";

//checkUser function is going to test the username entered by the waiter to only take valid names
    function checkUsername(name){
        let regex = (/^[a-zA-Z]\S+$/);
        var valid = regex.test(name);
        return valid;

    } 

//set errors will give the variable error message a message based on certain conditons
function setError(name){
    if(name == ""){
        errorMessage =  "Please provide a username"
    }
    else if(!checkUsername(name)){
        errorMessage = "Please enter a valid username"
    }
    return errorMessage
    
}



    return{
        checkUsername,
        setError
    }

}