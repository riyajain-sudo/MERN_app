import React from "react";

import './MainHeader.css';

const MainHeader = props => {
    return <header className="main-header">
        {props.children}    {/*a placeholder for the content written between the opening and closing tag of the component*/}
    </header>
}

export default MainHeader;