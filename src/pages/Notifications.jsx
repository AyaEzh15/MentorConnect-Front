import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Notifications() {

    const user = JSON.parse(localStorage.getItem("user"));

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await api.get(
                `/notifications/utilisateur/${user.id}`
            );

            setNotifications(res.data);

        } catch (error) {
            console.error(error);
        }
    };

    const marquerCommeLue = async(id) => {

        try {

            await api.patch(`/notifications/${id}/lu`);

            loadNotifications();

        } catch(error) {
            console.error(error);
        }
    };

    const supprimerNotification = async(id) => {

        try {

            await api.delete(`/notifications/${id}`);

            loadNotifications();

        } catch(error) {
            console.error(error);
        }
    };

    return (
        <div className="container mt-5">

            <h2>Mes Notifications</h2>

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