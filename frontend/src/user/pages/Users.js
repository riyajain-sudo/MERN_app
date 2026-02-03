import React from "react";
import UsersList from "../components/UsersList";

const Users = () => {
    const USERS = [
        {
            id: 'u1', 
            name: 'Max', 
            image: 
                'https://www.clipartmax.com/png/middle/144-1442578_flat-person-icon-download-dummy-man.png', 
            places: 2
        }
    ]
    return <UsersList items={USERS} />
}

export default Users;