// Énumération des statuts possibles d'une offre
enum OfferStatus {
  ACTIVE,
  INACTIVE,
  DELETED
}

// Énumération des types d'offres
enum OfferType {
  INTERNSHIP,     // Stage
  APPRENTICESHIP, // Alternance
  PART_TIME,      // Temps partiel
  FULL_TIME       // Temps plein
}

// Énumération des contextes de travail
enum WorkContext {
  ON_SITE,      // Sur place
  HYBRID,       // Hybride
  TELEWORKING   // Distanciel/Télétravail
}

// Conversion des étiquettes d'interface utilisateur vers les valeurs d'énumération backend
class OfferEnumMapper {
  // Convertit les types d'offres de l'interface utilisateur vers les valeurs backend
  static String mapOfferTypeToBackend(String uiOfferType) {
    switch (uiOfferType.toLowerCase()) {
      case 'stage':
        return OfferType.INTERNSHIP.toString().split('.').last;
      case 'alternance':
        return OfferType.APPRENTICESHIP.toString().split('.').last;
      case 'temps partiel':
        return OfferType.PART_TIME.toString().split('.').last;
      case 'temps plein':
        return OfferType.FULL_TIME.toString().split('.').last;
      default:
        return OfferType.INTERNSHIP.toString().split('.').last;
    }
  }

  // Convertit les types de localisation de travail de l'interface utilisateur vers les valeurs backend
  static String mapWorkContextToBackend(String uiWorkContext) {
    switch (uiWorkContext.toLowerCase()) {
      case 'sur place':
        return WorkContext.ON_SITE.toString().split('.').last;
      case 'hybride':
        return WorkContext.HYBRID.toString().split('.').last;
      case 'distanciel':
      case 'télétravail':
        return WorkContext.TELEWORKING.toString().split('.').last;
      default:
        return WorkContext.ON_SITE.toString().split('.').last;
    }
  }

  // Convertit les statuts de l'interface utilisateur vers les valeurs backend
  static String mapStatusToBackend(String uiStatus) {
    switch (uiStatus.toLowerCase()) {
      case 'active':
      case 'actif':
        return OfferStatus.ACTIVE.toString().split('.').last;
      case 'inactive':
      case 'inactif':
        return OfferStatus.INACTIVE.toString().split('.').last;
      case 'deleted':
      case 'supprimé':
        return OfferStatus.DELETED.toString().split('.').last;
      default:
        return OfferStatus.ACTIVE.toString().split('.').last;
    }
  }
} 