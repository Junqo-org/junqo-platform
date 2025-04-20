// Énumération des statuts possibles d'une offre
enum OfferStatus {
  active,
  inactive,
  deleted
}

// Énumération des types d'offres
enum OfferType {
  internship,     // Stage
  apprenticeship, // Alternance
  partTime,       // Temps partiel
  fullTime        // Temps plein
}

// Énumération des contextes de travail
enum OfferLocation {
  onSite,      // Sur place
  hybrid,      // Hybride
  teleworking  // Distanciel/Télétravail
}

// Conversion des étiquettes d'interface utilisateur vers les valeurs d'énumération backend
class OfferEnumMapper {
  // Convertit les types d'offres de l'interface utilisateur vers les valeurs backend
  static String mapOfferTypeToBackend(String uiOfferType) {
    switch (uiOfferType.toLowerCase()) {
      case 'stage':
        return OfferType.internship.toString().split('.').last;
      case 'alternance':
        return OfferType.apprenticeship.toString().split('.').last;
      case 'temps partiel':
        return OfferType.partTime.toString().split('.').last;
      case 'temps plein':
        return OfferType.fullTime.toString().split('.').last;
      default:
        return OfferType.internship.toString().split('.').last;
    }
  }

  // Convertit les types de localisation de travail de l'interface utilisateur vers les valeurs backend
  static String mapWorkContextToBackend(String uiWorkContext) {
    switch (uiWorkContext.toLowerCase()) {
      case 'sur place':
        return OfferLocation.onSite.toString().split('.').last;
      case 'hybride':
        return OfferLocation.hybrid.toString().split('.').last;
      case 'distanciel':
      case 'télétravail':
        return OfferLocation.teleworking.toString().split('.').last;
      default:
        return OfferLocation.onSite.toString().split('.').last;
    }
  }

  // Convertit les statuts de l'interface utilisateur vers les valeurs backend
  static String mapStatusToBackend(String uiStatus) {
    switch (uiStatus.toLowerCase()) {
      case 'active':
      case 'actif':
        return OfferStatus.active.toString().split('.').last;
      case 'inactive':
      case 'inactif':
        return OfferStatus.inactive.toString().split('.').last;
      case 'deleted':
      case 'supprimé':
        return OfferStatus.deleted.toString().split('.').last;
      default:
        return OfferStatus.active.toString().split('.').last;
    }
  }
} 