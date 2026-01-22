import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function CGUPage() {
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
            Conditions Générales d'Utilisation (CGU)
          </h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : 8 juin 2025
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Section 1 */}
            <section>
              <CardTitle className="text-xl mb-4">1. Objet du service</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                La présente plateforme propose divers services numériques à vocation informative, éducative et de préparation professionnelle. Ces services incluent notamment la génération assistée par intelligence artificielle de contenus simulés (comme des entretiens fictifs), des outils d'analyse, et la gestion de profils utilisateurs.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <CardTitle className="text-xl mb-4">2. Acceptation des conditions</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                L'accès et l'utilisation du service impliquent l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <CardTitle className="text-xl mb-4">3. Accès au service</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Le service est accessible 24h/24, 7j/7, sauf interruption pour maintenance ou cas de force majeure. L'éditeur se réserve le droit de suspendre ou de modifier tout ou partie du service à tout moment, sans préavis.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <CardTitle className="text-xl mb-4">4. Utilisation autorisée</CardTitle>
              <p className="text-muted-foreground leading-relaxed mb-3">
                L'utilisateur s'engage à utiliser le service conformément à sa finalité, dans le respect de la législation en vigueur et des présentes CGU. Sont notamment interdits :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>L'utilisation frauduleuse ou abusive du service,</li>
                <li>La tentative d'intrusion dans les systèmes,</li>
                <li>L'exploitation commerciale non autorisée du contenu.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <CardTitle className="text-xl mb-4">5. Propriété intellectuelle</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Tous les contenus, marques, logos, textes, images, interfaces et éléments techniques présents sur la plateforme sont protégés par le droit de la propriété intellectuelle. Toute reproduction, distribution ou utilisation sans autorisation est interdite.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <CardTitle className="text-xl mb-4">6. Responsabilités</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                L'éditeur met tout en œuvre pour assurer la fiabilité des services, mais ne peut garantir l'exactitude, l'exhaustivité ou l'actualité des contenus générés, notamment ceux produits par l'IA. L'utilisateur est seul responsable de l'usage qu'il fait des résultats fournis.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <CardTitle className="text-xl mb-4">7. Modifications du service</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                L'éditeur se réserve le droit de modifier à tout moment les fonctionnalités proposées, les présentes conditions ou les modalités d'accès au service. Ces modifications prendront effet dès leur mise en ligne. L'utilisation continue du service vaut acceptation des nouvelles CGU.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <CardTitle className="text-xl mb-4">8. Suspension et suppression de compte</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                En cas de non-respect des présentes CGU ou de comportement abusif, l'éditeur se réserve le droit de suspendre ou supprimer l'accès de l'utilisateur, sans préavis ni indemnité.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <CardTitle className="text-xl mb-4">9. Droit applicable</CardTitle>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social de l'éditeur.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Pour toute question concernant ces conditions, veuillez nous contacter à{' '}
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
