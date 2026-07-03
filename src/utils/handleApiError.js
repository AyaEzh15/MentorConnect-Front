export function handleApiError(error, fallback = "Une erreur est survenue.") {
  if (error?.response) {
    const { status, data } = error.response;

    if (data && typeof data === "string") {
      return data;
    }

    if (data && data.message) {
      return data.message;
    }

    if (status === 400) return "Requete invalide.";
    if (status === 401) return "Non autorise. Veuillez vous reconnecter.";
    if (status === 403) return "Acces refuse.";
    if (status === 404) return "Ressource introuvable.";
    if (status === 409) return "Conflit : la ressource existe deja.";
    if (status >= 500) return "Erreur serveur. Reessayez plus tard.";

    return fallback;
  }

  if (error?.request) {
    return "Impossible de contacter le serveur. Verifiez votre connexion.";
  }

  return fallback;
}

export default handleApiError;
