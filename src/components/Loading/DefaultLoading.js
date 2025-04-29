import React from 'react'
import { Backdrop, Message, ModalContent, Spinner } from './DefaultLoading.styles'

const DefaultLoading = ({ children }) => {

    return (
        <Backdrop>
            <ModalContent>
                <Spinner />
                <Message>{children}</Message>
            </ModalContent>
        </Backdrop>
    )
}

export default DefaultLoading;