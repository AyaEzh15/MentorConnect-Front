import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";

function CreateRendezVous() {
  const { relationId } = useParams();

  const [form, setForm] = useState({
    dateHeure: "",
    lieuReunion: "",
    notes: "",
    duree: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const createRdv = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/rendez-vous?relationId=${relationId}`, form);
      setMessage("Rendez-vous créé avec succès");
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de la création du rendez-vous");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2>Planifier un rendez-vous</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={createRdv}>
        <label className="form-label">Date et heure</label>
        <input
          type="datetime-local"
          name="dateHeure"
          className="form-control mb-3"
          value={form.dateHeure}
          onChange={handleChange}
          required
        />

        <label className="form-label">Lieu / lien réunion</label>
        <input
          name="lieuReunion"
          className="form-control mb-3"
          placeholder="Ex: Google Meet, Zoom, présentiel..."
          value={form.lieuReunion}
          onChange={handleChange}
        />

        <label className="form-label">Durée</label>
        <input
          name="duree"
          className="form-control mb-3"
          placeholder="Ex: 60 minutes"
          value={form.duree}
          onChange={handleChange}
        />

        <label className="form-label">Notes</label>
        <textarea
          name="notes"
          className="form-control mb-3"
          placeholder="Objectif du rendez-vous..."
          value={form.notes}
          onChange={handleChange}
        />

        <button className="btn btn-success w-100">
          Créer le rendez-vous
        </button>
      </form>
    </div>
  );
}

export default CreateRendezVous;