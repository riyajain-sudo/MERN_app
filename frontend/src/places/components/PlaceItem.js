import { apiUrl } from '../../shared/util/api-url';
import React, {useState, useContext} from 'react'
import './PlaceItem.css';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { AuthContext } from "../../shared/context/auth-context"


const PlaceItem = props => {
    const {isLoading, error, sendRequest, clearError} = useHttpClient()
    const auth = useContext(AuthContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const showDeleteWarningHandler = () => {
        setShowConfirmModal(true)
    }

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false)
    }

    const confirmDeleteHandler = async () => {
        setShowConfirmModal(false)
        try{
            await sendRequest(
                apiUrl(`/api/places/${props.id}`),
                'DELETE',
                null,
                {
                    Authorization: 'Bearer ' + auth.token
                }
            )
            props.onDelete(props.id)
        } catch(err) {}
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}/>
            <Modal
                show={showConfirmModal}
                onCancel={cancelDeleteHandler}
                header="Are you sure?"
                footerClass="place-item__modal-actions"
                footer={
                <React.Fragment>
                    <Button inverse onClick={cancelDeleteHandler}> CANCEL </Button>
                    <Button danger onClick={confirmDeleteHandler}> DELETE </Button>
                </React.Fragment>
            }>
                <p>Do you want to proceed and delete this place?
                    This action can't be undone</p>
            </Modal>
            <li className='place-item'>
                <Card className='place-item__content'>
                    {isLoading && <LoadingSpinner asOverlay/>}
                    <div className='place-item__image'>
                        <img src={apiUrl(props.image)} alt={props.title} />
                    </div>
                    <div className='place-item__info'>
                        <h2>{props.title}</h2>
                        <h3>{props.address}</h3>
                        <p>{props.description}</p>
                    </div>
                    <div className='place-item__actions'>
                        {auth.userId === props.creatorId && (
                            <Button to={`/places/${props.id}`}>
                                EDIT
                            </Button>
                        )}
                        {auth.userId === props.creatorId && (
                            <Button danger onClick={showDeleteWarningHandler}>
                                DELETE
                            </Button>
                        )}
                    </div>
                </Card>
            </li>
        </React.Fragment>
    )
}

export default PlaceItem
