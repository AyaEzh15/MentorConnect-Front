import { useEffect, useState } from "react";
import UtilisateurService from "../../../services/UtilisateurService";
import AuthService from "../../../services/AuthService";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import RoleBadge from "../../../components/RoleBadge";
import ConfirmDialog from "../../../components/ConfirmDialog";
import handleApiError from "../../../utils/handleApiError";

function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "MENTORE",
    actif: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    loadUtilisateurs();
  }, []);

  const loadUtilisateurs = async () => {
    try {
      const res = await UtilisateurService.getUtilisateurs();
      setUtilisateurs(res.data);
    } catch (error) {
      setMessage(handleApiError(error));
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.name === "actif" ? e.target.value === "true" : e.target.value;

    setForm({ ...form, [e.target.name]: value });
  };

  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      role: "MENTORE",
      actif: true,
    });
    setEditingId(null);
  };

  const saveUtilisateur = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await UtilisateurService.updateUtilisateur(editingId, form);
        setMessage("Utilisateur modifie avec succes");
      } else {
        await AuthService.register(form);
        setMessage("Utilisateur ajoute avec succes");
      }

      resetForm();
      loadUtilisateurs();
    } catch (error) {
      setMessage(handleApiError(error, "Erreur lors de l'enregistrement"));
    }
  };

  const editUtilisateur = (u) => {
    setEditingId(u.id);
    setForm({
      nom: u.nom || "",
      prenom: u.prenom || "",
      email: u.email || "",
      motDePasse: "",
      role: u.role || "MENTORE",
      actif: u.actif ?? true,
    });
  };

  const runConfirm = async () => {
    if (!confirm) return;

    try {
      if (confirm.action === "desactiver") {
        await UtilisateurService.desactiverUtilisateur(confirm.id);
      } else {
        await UtilisateurService.deleteUtilisateur(confirm.id);
      }
      loadUtilisateurs();
    } catch (error) {
      setMessage(
        handleApiError(error, "Action impossible : utilisateur lie a d'autres donnees.")
      );
    } finally {
      setConfirm(null);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    {
      header: "Nom complet",
      render: (u) => `${u.prenom || "-"} ${u.nom || ""}`,
    },
    { header: "Email", render: (u) => u.email || "-" },
    { header: "Role", render: (u) => <RoleBadge role={u.role} /> },
    {
      header: "Statut",
      render: (u) => (
        <span className={u.actif ? "badge bg-success" : "badge bg-danger"}>
          {u.actif ? "Actif" : "Inactif"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (u) => (
        <>
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={() => editUtilisateur(u)}
          >
            Modifier
          </button>
          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => setConfirm({ id: u.id, action: "desactiver" })}
            disabled={!u.actif}
          >
            Desactiver
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setConfirm({ id: u.id, action: "supprimer" })}
          >
            Supprimer
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <PageHeader title="Gestion des utilisateurs" />

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5>{editingId ? "Modifier utilisateur" : "Ajouter utilisateur"}</h5>

          <form onSubmit={saveUtilisateur}>
            <div className="row">
              <div className="col-md-3 mb-2">
                <input
                  className="form-control"
                  name="nom"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  className="form-control"
                  name="prenom"
                  placeholder="Prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  className="form-control"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-2">
                <input
                  className="form-control"
                  name="motDePasse"
                  type="password"
                  placeholder={editingId ? "Laisser vide si inchange" : "Mot de passe"}
                  value={form.motDePasse}
                  onChange={handleChange}
                  required={!editingId}
                />
              </div>

              <div className="col-md-3 mb-2">
                <select
                  className="form-control"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="MENTORE">Mentore</option>
                </select>
              </div>

              <div className="col-md-3 mb-2">
                <select
                  className="form-control"
                  name="actif"
                  value={form.actif}
                  onChange={handleChange}
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>

              <div className="col-md-6 mb-2">
                <button className="btn btn-success me-2">
                  {editingId ? "Modifier" : "Ajouter"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={utilisateurs}
        emptyMessage="Aucun utilisateur enregistre."
      />

      <ConfirmDialog
        show={confirm !== null}
        title={confirm?.action === "desactiver" ? "Desactiver" : "Supprimer"}
        message={
          confirm?.action === "desactiver"
            ? "Voulez-vous desactiver cet utilisateur ?"
            : "Voulez-vous supprimer cet utilisateur ?"
        }
        confirmLabel={confirm?.action === "desactiver" ? "Desactiver" : "Supprimer"}
        confirmVariant={confirm?.action === "desactiver" ? "warning" : "danger"}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export default AdminUtilisateurs;
