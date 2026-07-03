import { useEffect, useState } from "react";
import NotificationService from "../services/NotificationService";
import PageHeader from "../components/PageHeader";
import handleApiError from "../utils/handleApiError";

function Notifications() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await NotificationService.getNotificationsByUtilisateur(
                user.id
            );

            setNotifications(res.data);

        } catch (error) {
            setMessage(handleApiError(error));
        }
    };

    const marquerCommeLue = async(id) => {

        try {

            await NotificationService.marquerCommeLue(id);

            loadNotifications();

        } catch(error) {
            console.error(error);
        }
    };

    const supprimerNotification = async(id) => {

        try {

            await NotificationService.deleteNotification(id);

            loadNotifications();

        } catch(error) {
            console.error(error);
        }
    };

    return (
        <div className="container mt-5">

            <PageHeader title="Mes Notifications" />

            {message && <div className="alert alert-danger">{message}</div>}

            {
                notifications.length === 0 ?

                    <div className="alert alert-info">
                        Aucune notification.
                    </div>

                    :

                    notifications.map(notification => (

                        <div
                            key={notification.id}
                            className={`card mb-3 ${
                                notification.statutLecture
                                    ? ""
                                    : "border-primary"
                            }`}
                        >

                            <div className="card-body">

                                <h5>{notification.type}</h5>

                                <p>{notification.contenu}</p>

                                <small>
                                    {notification.dateCreation}
                                </small>

                                <div className="mt-3">

                                    {
                                        !notification.statutLecture &&

                                        <button
                                            className="btn btn-success btn-sm me-2"
                                            onClick={() =>
                                                marquerCommeLue(notification.id)
                                            }
                                        >
                                            Marquer comme lue
                                        </button>
                                    }

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            supprimerNotification(notification.id)
                                        }
                                    >
                                        Supprimer
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))
            }

        </div>
    );
}

export default Notifications;