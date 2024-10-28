import React from 'react'
import "./PageNotFound.scss"
import notfoundImg from "../../assets/img/icons/not-found.svg"
import { Link } from 'react-router-dom'

const PageNotFound = () => {
    return (
        <>
            <div className='not-found'>
                <div className="container">
                    <div className="not-found__row">
                        <div className="not-found__img">
                            <img src={notfoundImg} alt="" />
                        </div>
                        <div className="not-found__content">
                            <h4>404 Error!</h4>
                            <p>The page you are looking for doesn’t exist or <br /> has been moved.</p>
                        </div>
                        <div className='not-found__btn'>
                            <Link className='default-btn' to="/">Go to Back</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PageNotFound