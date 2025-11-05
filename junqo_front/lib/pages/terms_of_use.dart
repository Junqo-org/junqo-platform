import 'package:flutter/material.dart';

const String variable_of_our = '''
Conditions Générales d'Utilisation (CGU)

1. Objet du service
La présente plateforme propose divers services numériques à vocation informative, éducative et de préparation professionnelle. Ces services incluent notamment la génération assistée par intelligence artificielle de contenus simulés (comme des entretiens fictifs), des outils d’analyse, et la gestion de profils utilisateurs.

2. Acceptation des conditions
L’accès et l’utilisation du service impliquent l’acceptation pleine et entière des présentes Conditions Générales d’Utilisation. Si vous n’acceptez pas ces conditions, vous ne devez pas utiliser le service.

3. Accès au service
Le service est accessible 24h/24, 7j/7, sauf interruption pour maintenance ou cas de force majeure. L’éditeur se réserve le droit de suspendre ou de modifier tout ou partie du service à tout moment, sans préavis.

4. Utilisation autorisée
L’utilisateur s’engage à utiliser le service conformément à sa finalité, dans le respect de la législation en vigueur et des présentes CGU. Sont notamment interdits :
- L’utilisation frauduleuse ou abusive du service,
- La tentative d’intrusion dans les systèmes,
- L’exploitation commerciale non autorisée du contenu.

5. Propriété intellectuelle
Tous les contenus, marques, logos, textes, images, interfaces et éléments techniques présents sur la plateforme sont protégés par le droit de la propriété intellectuelle. Toute reproduction, distribution ou utilisation sans autorisation est interdite.

6. Responsabilités
L’éditeur met tout en œuvre pour assurer la fiabilité des services, mais ne peut garantir l’exactitude, l’exhaustivité ou l’actualité des contenus générés, notamment ceux produits par l’IA. L’utilisateur est seul responsable de l’usage qu’il fait des résultats fournis.

7. Modifications du service
L’éditeur se réserve le droit de modifier à tout moment les fonctionnalités proposées, les présentes conditions ou les modalités d’accès au service. Ces modifications prendront effet dès leur mise en ligne. L’utilisation continue du service vaut acceptation des nouvelles CGU.

8. Suspension et suppression de compte
En cas de non-respect des présentes CGU ou de comportement abusif, l’éditeur se réserve le droit de suspendre ou supprimer l’accès de l’utilisateur, sans préavis ni indemnité.

9. Droit applicable
Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social de l’éditeur.

Date de dernière mise à jour : 8 Juin 2025.
''';

class Terms extends StatelessWidget {
  const Terms({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Conditions d\'utilisation'),
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
            variable_of_our,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      ),
    );
  }
}
