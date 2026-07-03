import { useEffect, useState } from "react";
import DomaineService from "../../../services/DomaineService";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import ConfirmDialog from "../../../components/ConfirmDialog";
import handleApiError from "../../../utils/handleApiError";

function AdminDomaines() {
  const [domaines, setDomaines] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    libelle: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    loadDomaines();
  }, []);

  const loadDomaines = async () => {
    try {
      const res = await DomaineService.getDomaines();
      setDomaines(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      libelle: "",
      description: "",
    });
    setEditingId(null);
  };

  const saveDomaine = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await DomaineService.updateDomaine(editingId, form);
        setMessage("Domaine modifie avec succes");
      } else {
        await DomaineService.createDomaine(form);
        setMessage("Domaine ajoute avec succes");
      }

      resetForm();
      loadDomaines();
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors de l'enregistrement"));
    }
  };

  const editDomaine = (domaine) => {
    setEditingId(domaine.id);
    setForm({
      libelle: domaine.libelle || "",
      description: domaine.description || "",
    });
  };

  const confirmDelete = async () => {
    try {
      await DomaineService.deleteDomaine(confirmId);
      loadDomaines();
    } catch (error) {
      setMessage(
        handleApiError(error, "Suppression impossible : domaine lie a des profils.")
      );
    } finally {
      setConfirmId(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Libelle", accessor: "libelle" },
    {
      header: "Description",
      render: (d) => d.description || "-",
    },
    {
      header: "Actions",
      render: (d) => (
        <>
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={() => editDomaine(d)}
          >
            Modifier
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmId(d.id)}
          >
            Supprimer
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <PageHeader title="Gestion des domaines" />

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5>{editingId ? "Modifier domaine" : "Ajouter domaine"}</h5>

          <form onSubmit={saveDomaine}>
            <div className="row">
              <div className="col-md-4 mb-2">
                <input
                  className="form-control"
                  name="libelle"
                  placeholder="Libelle"
                  value={form.libelle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-2">
                <input
                  className="form-control"
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-2 mb-2">
                <button className="btn btn-success w-100">
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary btn-sm mt-2"
                onClick={resetForm}
              >
                Annuler modification
              </button>
            )}
          </form>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={domaines}
        emptyMessage="Aucun domaine enregistre."
      />

      <ConfirmDialog
        show={confirmId !== null}
        title="Supprimer le domaine"
        message="Voulez-vous vraiment supprimer ce domaine ?"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

export default AdminDomaines;
