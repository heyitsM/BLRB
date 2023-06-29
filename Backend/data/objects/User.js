import { hashPassword } from "../../util/Password.js";
import ApiError from "../../util/ApiError.js";

class User {
    constructor({email, firstName, lastName, username, password, role="ARTIST", id=undefined}) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = hashPassword(password);
        this.isDeleted = false;
        this.role = role;
        if (id !== undefined) {
            this.id=id;
        }
    }

    // DOES NOT CHECK IF ID IS PRESENT
    checkInstantiatedBeforeCreate() {
        if (this.email === undefined) {
            throw new ApiError(400, "Must provide email");
        } else if (this.firstName === undefined) {
            throw new ApiError(400, "Must provide firstName");
        } else if (this.lastName === undefined) {
            throw new ApiError(400, "Must provide lastName");
        } else if (this.username === undefined) {
            throw new ApiError(400, "Must provide username");
        } else if (this.password === undefined) {
            throw new ApiError(400, "Must provide password");
        }
        return;
    }

    // CHECKS IF ID IS PRESENT
    checkInstantiatedBeforeUpdate() {
        if (this.email === undefined) {
            throw new ApiError(400, "Must provide email");
        } else if (this.firstName === undefined) {
            throw new ApiError(400, "Must provide firstName");
        } else if (this.lastName === undefined) {
            throw new ApiError(400, "Must provide lastName");
        } else if (this.username === undefined) {
            throw new ApiError(400, "Must provide username");
        } else if (this.password === undefined) {
            throw new ApiError(400, "Must provide password");
        } else if (this.id === undefined) {
            throw new ApiError(400, "Must provide id");
        }
        return;
    }

    to_json() {
        // const id = this.id ? this.id : {"id":undefined};
        return {
            "email":this.email,
            "firstName":this.firstName,
            "lastName":this.lastName,
            "username":this.username,
            "password":this.password,
            "id":this.id,
            "role":this.role,
        }
    }

    to_json_protected() {
        return {
            "firstName":this.firstName,
            "username":this.username,
        }
        
    }

}

export default User;