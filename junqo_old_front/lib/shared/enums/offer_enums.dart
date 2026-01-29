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
        return OfferType.internship.name.toUpperCase();
      case 'alternance':
        return OfferType.apprenticeship.name.toUpperCase();
      case 'temps partiel':
        return OfferType.partTime.name.toUpperCase();
      case 'temps plein':
        return OfferType.fullTime.name.toUpperCase();
      default:
        return OfferType.internship.name.toUpperCase();
    }
  }

  // Convertit les types de localisation de travail de l'interface utilisateur vers les valeurs backend
  static String mapWorkContextToBackend(String uiWorkContext) {
    switch (uiWorkContext.toLowerCase()) {
      case 'sur place':
        return 'ON_SITE';
      case 'hybride':
        return OfferLocation.hybrid.name.toUpperCase();
      case 'distanciel':
      case 'télétravail':
        return OfferLocation.teleworking.name.toUpperCase();
      default:
        return 'ON_SITE';
    }
  }

  // Convertit les statuts de l'interface utilisateur vers les valeurs backend
  static String mapStatusToBackend(String uiStatus) {
    switch (uiStatus.toLowerCase()) {
      case 'active':
      case 'actif':
        return OfferStatus.active.name.toUpperCase();
      case 'inactive':
      case 'inactif':
        return OfferStatus.inactive.name.toUpperCase();
      case 'deleted':
      case 'supprimé':
        return OfferStatus.deleted.name.toUpperCase();
      default:
        return OfferStatus.active.name.toUpperCase();
    }
  }
} 