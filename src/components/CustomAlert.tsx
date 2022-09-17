import { faRocket, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactElement, useEffect, useState } from "react";
import { Alert, Button } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';


const CustomAlert = (): ReactElement => {

    return (
        <>
            <Alert key={"primary"} variant={"primary"}>
                Custom Alert
            </Alert>
        </>
    );
}

export default CustomAlert;
