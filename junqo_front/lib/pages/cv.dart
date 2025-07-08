import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:get_it/get_it.dart';
import 'dart:typed_data';
import '../shared/widgets/navbar.dart';
import '../core/cv_improvement_service.dart';
import '../services/pdf_processing_service.dart';

class CV extends StatefulWidget {
  const CV({super.key});

  @override
  State<CV> createState() => _CVState();
}

class _CVState extends State<CV> {
  final TextEditingController _jobContextController = TextEditingController();
  final CvImprovementService _cvService =
      GetIt.instance<CvImprovementService>();
  final PdfProcessingService _pdfService =
      GetIt.instance<PdfProcessingService>();

  String? _recommendations;
  bool _isLoading = false;
  bool _isDragging = false;
  String? _errorMessage;
  String? _extractedText;

  // Propriétés pour stocker le fichier sélectionné
  Uint8List? _fileBytes;
  String? _fileName;

  // Couleurs inspirées des autres pages
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate800 = Color(0xFF1E293B);
  static const Color indigo50 = Color(0xFFEEF2FF);
  static const Color indigo600 =
      Color(0xFF4F46E5); // Un peu plus vif que 6366F1
  static const Color emerald50 = Color(0xFFECFDF5);
  static const Color emerald500 = Color(0xFF10B981);
  static const Color amber50 = Color(0xFFFFFBEB);
  static const Color amber600 = Color(0xFFD97706);
  static const Color red50 = Color(0xFFFEF2F2);
  static const Color red600 = Color(0xFFDC2626);

  Future<void> _pickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'txt'],
        withData: true,
      );

      if (result != null) {
        setState(() {
          _fileBytes = result.files.single.bytes;
          _fileName = result.files.single.name;
          _errorMessage = null;
          _extractedText = null;
          _recommendations =
              null; // Réinitialiser les recommandations lors du changement de fichier
        });

        // Extraire immédiatement le texte si c'est un PDF
        if (_fileName!.toLowerCase().endsWith('.pdf')) {
          _extractTextFromFile();
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors de la sélection du fichier: $e';
      });
    }
  }

  Future<void> _extractTextFromFile() async {
    if (_fileBytes == null || _fileName == null) {
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final String fileName = _fileName!.toLowerCase();
      String text = '';

      // Traitement des fichiers texte
      if (fileName.endsWith('.txt')) {
        text = String.fromCharCodes(_fileBytes!);
      }
      // Traitement des fichiers PDF avec le service dédié
      else if (fileName.endsWith('.pdf')) {
        text = await _pdfService.extractTextFromPdf(_fileBytes!);
      }
      // Pour les autres formats (non supportés pour l'instant)
      else {
        text =
            "Format de fichier non pris en charge. Veuillez utiliser un fichier PDF ou TXT.";
      }

      setState(() {
        _extractedText = text;
        _isLoading = false;

        if (text.contains("ne contient pas de texte extractible") ||
            text.contains("Format de fichier non pris en charge")) {
          _errorMessage = text;
        }
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors de l\'extraction du texte: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _analyzeCv() async {
    if (_fileBytes == null) {
      setState(() {
        _errorMessage = 'Veuillez d\'abord télécharger un CV';
      });
      return;
    }

    // Si le texte n'est pas encore extrait, le faire maintenant
    if (_extractedText == null) {
      await _extractTextFromFile();
      if (_errorMessage != null) {
        return; // Arrêter si l'extraction a échoué
      }
    }

    // Si toujours pas de texte extrait après tentative, afficher une erreur
    if (_extractedText == null || _extractedText!.trim().isEmpty) {
      setState(() {
        _errorMessage = 'Impossible d\'extraire du texte de ce fichier';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _recommendations = null;
    });

    try {
      // Préparer le texte pour l'analyse IA
      String optimizedText = _pdfService.prepareTextForAI(_extractedText!,
          jobContext: _jobContextController.text.isNotEmpty
              ? _jobContextController.text
              : null);

      // Envoyer à l'API pour analyse
      final recommendations = await _cvService.analyzeCv(
        optimizedText,
        jobContext: _jobContextController.text.isNotEmpty
            ? _jobContextController.text
            : null,
      );

      setState(() {
        _recommendations = recommendations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors de l\'analyse: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    Theme.of(context);
    // Utiliser les couleurs définies pour la cohérence
    // final primaryColor = theme.primaryColor; // Remplacé par indigo600
    // final accentColor = theme.colorScheme.secondary; // Remplacé par indigo600 ou autre couleur d'accent

    return Scaffold(
      backgroundColor: slate50, // Fond plus doux
      body: Column(
        children: [
          const Navbar(currentIndex: 1),
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 32), // Augmentation du padding vertical
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 900),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Titre et description
                      Text(
                        "Améliorez votre CV avec l'IA",
                        style: TextStyle(
                          fontSize: 36, // Augmenté
                          fontWeight: FontWeight.bold,
                          color: slate800, // Couleur plus foncée
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        "Téléchargez votre CV, ajoutez le contexte du poste souhaité, et laissez notre IA vous fournir des pistes d'amélioration.",
                        style: TextStyle(fontSize: 18, color: slate600),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: indigo50, // Couleur de fond douce
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: slate200),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.info_outline_rounded,
                                color: indigo600, size: 28),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                "Notre outil analyse votre CV et vous propose des recommandations personnalisées pour améliorer son impact auprès des recruteurs.",
                                style: TextStyle(
                                    fontSize: 16, color: slate800, height: 1.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Zone de drop pour le CV
                      GestureDetector(
                        onTap: _pickFile,
                        child: DragTarget<Object>(
                          onAcceptWithDetails: (details) {
                            // Sur la version web, le drop peut ne pas fonctionner aussi bien que _pickFile
                            // Il est préférable de toujours appeler _pickFile
                            _pickFile();
                          },
                          onWillAccept: (data) {
                            setState(() => _isDragging = true);
                            return true;
                          },
                          onLeave: (data) {
                            setState(() => _isDragging = false);
                          },
                          builder: (context, candidateData, rejectedData) {
                            bool isFileSuccessfullyProcessed = _extractedText !=
                                    null &&
                                !_extractedText!.contains(
                                    "ne contient pas de texte extractible") &&
                                !_extractedText!.contains(
                                    "Format de fichier non pris en charge");

                            Color borderColor = slate300;
                            if (_isDragging) {
                              borderColor = indigo600;
                            } else if (_fileName != null) {
                              borderColor = isFileSuccessfullyProcessed
                                  ? emerald500
                                  : amber600;
                            }

                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              height: 270, // Augmenté pour corriger l'overflow
                              decoration: BoxDecoration(
                                color: _isDragging
                                    ? indigo50.withOpacity(0.5)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: borderColor,
                                  width: _isDragging || _fileName != null
                                      ? 2.5
                                      : 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.07),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: Center(
                                // Centrer le contenu
                                child: Padding(
                                  // Ajouter un padding interne
                                  padding: const EdgeInsets.all(20.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      if (_fileName == null) ...[
                                        Container(
                                          padding: const EdgeInsets.all(24),
                                          decoration: BoxDecoration(
                                              color: slate50,
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                  color: slate200, width: 1.5)),
                                          child: Icon(
                                            Icons.cloud_upload_rounded,
                                            size: 50,
                                            color: indigo600,
                                          ),
                                        ),
                                        const SizedBox(height: 24),
                                        Text(
                                          "Glissez votre CV ici ou cliquez pour importer",
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontSize: 18, // Augmenté
                                            fontWeight: FontWeight
                                                .w600, // Plus de poids
                                            color: slate800,
                                          ),
                                        ),
                                        const SizedBox(height: 10),
                                        Text(
                                          "Formats acceptés: PDF, TXT",
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: slate500,
                                          ),
                                        ),
                                      ] else ...[
                                        Container(
                                          padding: const EdgeInsets.all(20),
                                          decoration: BoxDecoration(
                                              color: isFileSuccessfullyProcessed
                                                  ? emerald50
                                                  : amber50,
                                              shape: BoxShape.circle,
                                              border: Border.all(
                                                  color:
                                                      isFileSuccessfullyProcessed
                                                          ? emerald500
                                                              .withOpacity(0.3)
                                                          : amber600
                                                              .withOpacity(0.3),
                                                  width: 2)),
                                          child: isFileSuccessfullyProcessed
                                              ? Icon(
                                                  Icons
                                                      .check_circle_outline_rounded,
                                                  size: 48, // Augmenté
                                                  color: emerald500,
                                                )
                                              : Icon(
                                                  // Pourrait être une icône de "processing" ou d'alerte si erreur d'extraction
                                                  _isLoading &&
                                                          _extractedText == null
                                                      ? Icons
                                                          .hourglass_empty_rounded
                                                      : Icons
                                                          .warning_amber_rounded,
                                                  size: 48, // Augmenté
                                                  color: amber600,
                                                ),
                                        ),
                                        const SizedBox(height: 20),
                                        Text(
                                          isFileSuccessfullyProcessed
                                              ? "CV importé et traité !"
                                              : (_isLoading &&
                                                      _extractedText == null
                                                  ? "Traitement du CV en cours..."
                                                  : "Vérification du CV"),
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontSize: 18, // Augmenté
                                            fontWeight: FontWeight
                                                .w600, // Plus de poids
                                            color: slate800,
                                          ),
                                        ),
                                        const SizedBox(height: 10),
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.description_outlined,
                                                size: 18, color: slate500),
                                            const SizedBox(width: 8),
                                            Flexible(
                                              // Pour éviter overflow si nom de fichier long
                                              child: Text(
                                                _fileName!,
                                                textAlign: TextAlign.center,
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontSize: 15, // Augmenté
                                                  color: slate600,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 24),
                                        Semantics(
                                          button: true,
                                          label:
                                              'TODO: Replace with a meaningful label',
                                          child: ElevatedButton.icon(
                                              onPressed: _pickFile,
                                              icon: const Icon(
                                                  Icons.refresh_rounded,
                                                  size: 20),
                                              label: const Text(
                                                  "Changer de fichier"),
                                              style: ElevatedButton.styleFrom(
                                                  backgroundColor: indigo600,
                                                  foregroundColor: Colors.white,
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 24,
                                                      vertical: 12),
                                                  textStyle: const TextStyle(
                                                      fontSize: 16,
                                                      fontWeight:
                                                          FontWeight.w500),
                                                  shape: RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              12)))),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                      const SizedBox(height: 40), // Espace augmenté

                      // Contexte du poste - Style Card
                      Container(
                        padding: const EdgeInsets.all(24), // Padding augmenté
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black
                                  .withOpacity(0.06), // Ombre plus subtile
                              blurRadius: 15,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.work_outline_rounded,
                                    color: indigo600, size: 28),
                                const SizedBox(width: 12),
                                Text(
                                  "Poste ciblé (Optionnel)",
                                  style: TextStyle(
                                    fontSize: 20, // Augmenté
                                    fontWeight: FontWeight.bold,
                                    color: slate800,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "Spécifiez le poste que vous visez pour obtenir des recommandations encore plus pertinentes et personnalisées.",
                              style: TextStyle(
                                fontSize: 15, // Augmenté
                                color: slate600,
                                height: 1.5,
                              ),
                            ),
                            const SizedBox(height: 20),
                            TextField(
                              controller: _jobContextController,
                              decoration: InputDecoration(
                                hintText:
                                    'Ex: Développeur Fullstack Python/Vue.js Senior', // Changé en hintText
                                hintStyle: TextStyle(
                                    color: slate500), // Style pour hintText
                                filled: true,
                                fillColor: slate50, // Fond légèrement différent
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(
                                      color: slate200), // Bordure plus claire
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(color: slate300),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(
                                      color: indigo600,
                                      width: 2), // Bordure focus plus visible
                                ),
                                prefixIcon: Icon(Icons.search,
                                    color: slate500, size: 22),
                              ),
                              style: TextStyle(
                                  color: slate800,
                                  fontSize: 16), // Style pour le texte saisi
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 40), // Espace augmenté

                      // Bouton d'analyse
                      SizedBox(
                        width: double.infinity,
                        height: 60, // Hauteur augmentée
                        child: Semantics(
                          button: true,
                          label: 'TODO: Replace with a meaningful label',
                          child: ElevatedButton(
                              onPressed: _isLoading ? null : _analyzeCv,
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: indigo600,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16)),
                                  elevation: _isLoading ? 0 : 3,
                                  disabledBackgroundColor: slate300,
                                  textStyle: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600)),
                              child: _isLoading
                                  ? Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                          SizedBox(
                                              width: 24,
                                              height: 24,
                                              child: CircularProgressIndicator(
                                                  color: Colors.white,
                                                  strokeWidth: 3.5)),
                                          const SizedBox(width: 20),
                                          const Text("Analyse en cours...")
                                        ])
                                  : const Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                          Icon(Icons.auto_awesome_rounded,
                                              size: 26),
                                          SizedBox(width: 12),
                                          Text("Analyser mon CV")
                                        ])),
                        ),
                      ),

                      // Affichage des erreurs
                      if (_errorMessage != null) ...[
                        const SizedBox(height: 30),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 20), // Padding ajusté
                          decoration: BoxDecoration(
                            color: red50, // Fond d'erreur plus doux
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: red600
                                    .withOpacity(0.5)), // Bordure plus subtile
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(
                                    top: 3), // Ajustement pour alignement icône
                                child: Icon(Icons.error_outline_rounded,
                                    color: red600,
                                    size: 24), // Icône plus grande
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: TextStyle(
                                    color: red600,
                                    fontSize: 15, // Augmenté
                                    fontWeight:
                                        FontWeight.w500, // Un peu plus de poids
                                    height: 1.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      // Affichage des recommandations
                      if (_recommendations != null) ...[
                        const SizedBox(height: 40),
                        AnimatedOpacity(
                          // Ajout d'une animation d'opacité
                          opacity: _recommendations != null ? 1.0 : 0.0,
                          duration: const Duration(milliseconds: 500),
                          child: Container(
                            padding:
                                const EdgeInsets.all(28), // Padding augmenté
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black
                                      .withOpacity(0.07), // Ombre plus subtile
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                          color:
                                              amber50, // Couleur d'accent pour l'icône
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                              color:
                                                  amber600.withOpacity(0.3))),
                                      child: Icon(
                                        Icons.lightbulb_outline_rounded,
                                        color: amber600, // Couleur d'accent
                                        size: 28, // Augmenté
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Text(
                                        "Recommandations d'amélioration",
                                        style: TextStyle(
                                          fontSize: 22, // Augmenté
                                          fontWeight: FontWeight.bold,
                                          color: slate800,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),
                                Divider(
                                    color: slate200,
                                    thickness: 1), // Séparateur plus subtil
                                const SizedBox(height: 20),
                                SelectableText(
                                  _recommendations!,
                                  style: TextStyle(
                                    fontSize: 16, // Maintenu
                                    height: 1.7, // Augmenté pour lisibilité
                                    color:
                                        slate600, // Couleur de texte plus douce
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 40),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _jobContextController.dispose();
    super.dispose();
  }
}
