import 'package:flutter/material.dart';

const String privacy_policy_content = '''
Politique de Confidentialité

Dernière mise à jour : 22 juin 2025

La présente politique de confidentialité a pour objectif de vous informer sur la manière dont Junqo (ci-après « nous », « notre », « la Société ») collecte, utilise, protège et partage vos données personnelles lorsque vous utilisez notre service, à savoir l’application JunqoApp ou le site web https://junqo.fr/

1. Définitions
- Compte : compte utilisateur créé pour accéder à certaines fonctionnalités.
- Données Personnelles : toute information relative à une personne physique identifiée ou identifiable.
- Données d’Utilisation : données collectées automatiquement (IP, pages visitées, etc.).
- Cookies : fichiers enregistrés sur votre appareil.
- Appareil : tout appareil utilisé pour accéder au service.
- Service Tiers : prestataires externes traitant les données pour notre compte.

2. Types de données collectées
a. Données personnelles : nom, email, adresse, données de compte, etc.
b. Données d’utilisation : adresse IP, navigateur, interactions, etc.
c. Cookies : pour le bon fonctionnement, préférences, et analyses.

3. Finalités de traitement
Nous utilisons vos données pour fournir le service, gérer les comptes, communiquer avec vous, respecter la loi, et améliorer l’expérience utilisateur.

4. Partage de vos données
Vos données peuvent être partagées avec des prestataires, lors de fusions, ou pour se conformer à la loi. Nous ne vendons jamais vos données.

5. Conservation des données
Les données sont conservées aussi longtemps que nécessaire ou selon la loi.

6. Sécurité des données
Des mesures techniques et organisationnelles sont mises en place pour protéger vos données. En cas de faille, vous serez notifié(e).

7. Vos droits (RGPD)
Vous pouvez exercer vos droits d’accès, de rectification, d’effacement, d’opposition, de portabilité, ou retirer votre consentement à tout moment via junqo-project@junqo.fr

8. Données des mineurs
Notre Service n’est pas destiné aux enfants de moins de 13 ans.

9. Transfert hors de l’UE
Si des données sont transférées en dehors de l’UE, des garanties juridiques sont mises en œuvre.

10. Modifications de la politique
Nous nous réservons le droit de modifier cette politique. Vous serez notifié(e) en cas de changement important.

11. Contact
Pour toute question ou réclamation, veuillez nous contacter à : junqo-project@junqo.fr
''';

class PrivacyPolicy extends StatelessWidget {
  const PrivacyPolicy({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Politique de confidentialité'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: const Padding(
        padding: EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Text(
            privacy_policy_content,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      ),
    );
  }
}
