import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : 22 juin 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <p className="text-muted-foreground leading-relaxed">
              La présente politique de confidentialité a pour objectif de vous informer sur la manière dont Junqo (ci-après « nous », « notre », « la Société ») collecte, utilise, protège et partage vos données personnelles lorsque vous utilisez notre service, à savoir l'application JunqoApp ou le site web <a href="https://junqo.fr/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://junqo.fr/</a>
            </p>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Section 1 */}
            <section>
              <CardTitle className="text-xl mb-4">1. Définitions</CardTitle>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Compte :</strong> compte utilisateur créé pour accéder à certaines fonctionnalités.</li>
                <li><strong className="text-foreground">Données Personnelles :</strong> toute information relative à une personne physique identifiée ou identifiable.</li>
                <li><strong className="text-foreground">Données d'Utilisation :</strong> données collectées automatiquement (IP, pages visitées, etc.).</li>
                <li><strong className="text-foreground">Cookies :</strong> fichiers enregistrés sur votre appareil.</li>
                <li><strong className="text-foreground">Appareil :</strong> tout appareil utilisé pour accéder au service.</li>
                <li><strong className="text-foreground">Service Tiers :</strong> prestataires externes traitant les données pour notre compte.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <CardTitle className="text-xl mb-4">2. Types de données collectées</CardTitle>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">a. Données personnelles :</strong> nom, email, adresse, données de compte, etc.</p>
                <p><strong className="text-foreground">b. Données d'utilisation :</strong> adresse IP, navigateur, interactions, etc.</p>
                <p><strong className="text-foreground">c. Cookies :</strong> pour le bon fonctionnement, préférences, et analyses.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <CardTitle className="text-xl mb-4">3. Finalités de traitement</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons vos données pour fournir le service, gérer les comptes, communiquer avec vous, respecter la loi, et améliorer l'expérience utilisateur.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <CardTitle className="text-xl mb-4">4. Partage de vos données</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Vos données peuvent être partagées avec des prestataires, lors de fusions, ou pour se conformer à la loi. Nous ne vendons jamais vos données.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <CardTitle className="text-xl mb-4">5. Conservation des données</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Les données sont conservées aussi longtemps que nécessaire ou selon la loi.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <CardTitle className="text-xl mb-4">6. Sécurité des données</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Des mesures techniques et organisationnelles sont mises en place pour protéger vos données. En cas de faille, vous serez notifié(e).
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <CardTitle className="text-xl mb-4">7. Vos droits (RGPD)</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez exercer vos droits d'accès, de rectification, d'effacement, d'opposition, de portabilité, ou retirer votre consentement à tout moment via{' '}
                <a href="mailto:junqo-project@junqo.fr" className="text-primary hover:underline">
                  junqo-project@junqo.fr
                </a>
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <CardTitle className="text-xl mb-4">8. Données des mineurs</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Notre Service n'est pas destiné aux enfants de moins de 13 ans.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <CardTitle className="text-xl mb-4">9. Transfert hors de l'UE</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Si des données sont transférées en dehors de l'UE, des garanties juridiques sont mises en œuvre.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <CardTitle className="text-xl mb-4">10. Modifications de la politique</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique. Vous serez notifié(e) en cas de changement important.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <CardTitle className="text-xl mb-4">11. Contact</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question ou réclamation, veuillez nous contacter à :{' '}
                <a href="mailto:junqo-project@junqo.fr" className="text-primary hover:underline">
                  junqo-project@junqo.fr
                </a>
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Pour toute question concernant votre vie privée, veuillez nous contacter à{' '}
            <a href="mailto:junqo-project@junqo.fr" className="text-primary hover:underline">
              junqo-project@junqo.fr
            </a>
          </p>
          <Link to="/">
            <Button>
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
