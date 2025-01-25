import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'login.dart';
import 'terms_of_use.dart';
import 'privacy_policy.dart';
import 'package:flutter/gestures.dart';

class Register extends StatefulWidget {
  final String userType;

  const Register({
    Key? key,
    required this.userType,
  }) : super(key: key);

  @override
  State<Register> createState() => _RegisterState();
}

class _RegisterState extends State<Register> with TickerProviderStateMixin {
  // Animation controllers
  late final AnimationController _blob1Controller;
  late final AnimationController _blob2Controller;
  late final AnimationController _blob3Controller;
  late final AnimationController _scaleController;

  // Form controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  // Form state
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  bool _isHovered = false;
  bool _passwordsMatch = true;
  String? _passwordError;
  String? _emailError;
  String? _nameError;
  bool _isSubmitHovered = false;

  // Validation des champs
  bool _validateFields() {
    bool isValid = true;
    setState(() {
      // Validation du nom
      if (_nameController.text.trim().isEmpty) {
        _nameError = 'Ce champ est requis';
        isValid = false;
      } else {
        _nameError = null;
      }

      // Validation de l'email

      if (_emailController.text.trim().isEmpty) {
        _emailError = 'Ce champ est requis';
        isValid = false;
      } else if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
          .hasMatch(_emailController.text)) {
        _emailError = 'Adresse email invalide';
        isValid = false;
      } else {
        _emailError = null;
      }

      // Validation du mot de passe
      if (_passwordController.text.isEmpty) {
        _passwordError = 'Ce champ est requis';
        isValid = false;
      } else if (_passwordController.text != _confirmPasswordController.text) {
        _passwordError = 'Les mots de passe ne correspondent pas';
        _passwordsMatch = false;
        isValid = false;
      } else {
        _passwordError = null;
        _passwordsMatch = true;
      }
      if (_passwordController.text.length < 8) {
        _passwordError = 'Le mot de passe doit contenir au moins 8 caractères';
        isValid = false;
      }
      if (!RegExp(r'[A-Z]').hasMatch(_passwordController.text)) {
        _passwordError = 'Le mot de passe doit contenir au moins une majuscule';
        isValid = false;
      }
    });
    return isValid;
  }

  @override
  void initState() {
    super.initState();
    _blob1Controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat();

    _blob2Controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    )..repeat();

    _blob3Controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();

    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _blob1Controller.dispose();
    _blob2Controller.dispose();
    _blob3Controller.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  void _validatePasswords() {
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() {
        _passwordsMatch = false;
        _passwordError = 'Les mots de passe ne correspondent pas';
      });
    } else {
      setState(() {
        _passwordsMatch = true;
        _passwordError = null;
      });
    }
  }

  String getUserTypeText() {
    switch (widget.userType) {
      case 'school':
        return 'école';
      case 'company':
        return 'entreprise';
      case 'student':
        return 'étudiant';
      default:
        return '';
    }
  }

  Color getTypeColor() {
    switch (widget.userType) {
      case 'school':
        return Colors.blue;
      case 'company':
        return Colors.purple;
      case 'student':
        return Colors.green;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final mainColor = getTypeColor();

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              mainColor.withOpacity(0.1),
              Colors.white,
            ],
          ),
        ),
        child: Stack(
          children: [
            // Animated blobs with adjusted colors
            Positioned(
              left: -100,
              top: -50,
              child: _buildAnimatedBlob(
                animation: _blob1Controller,
                scaleAnimation: _scaleController,
                color: mainColor,
                size: 400,
                initialOffset: const Offset(50, 100),
                floatRadius: 60,
              ),
            ),
            Positioned(
              right: -100,
              top: -50,
              child: _buildAnimatedBlob(
                animation: _blob2Controller,
                scaleAnimation: _scaleController,
                color: mainColor.withBlue(200),
                size: 380,
                initialOffset: const Offset(250, 150),
                floatRadius: 70,
              ),
            ),
            Positioned(
              bottom: -100,
              left: MediaQuery.of(context).size.width / 2 - 200,
              child: _buildAnimatedBlob(
                animation: _blob3Controller,
                scaleAnimation: _scaleController,
                color: mainColor.withGreen(200),
                size: 400,
                initialOffset: const Offset(150, 300),
                floatRadius: 65,
              ),
            ),

            // Main content
            SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo and back button with glass effect
                  Container(
                    padding: const EdgeInsets.fromLTRB(16, 24, 40, 16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.8),
                      border: Border(
                        bottom: BorderSide(
                          color: Colors.grey.shade200,
                          width: 1,
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          icon: Icon(Icons.arrow_back, color: mainColor),
                          onPressed: () => Navigator.pop(context),
                        ),
                        const SizedBox(width: 16),
                        SizedBox(
                          height: 35,
                          child: Image.asset(
                            'assets/images/template_logo.png',
                            fit: BoxFit.contain,
                            alignment: Alignment.centerLeft,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Form content
                  Center(
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 450),
                      margin: const EdgeInsets.symmetric(
                          vertical: 32, horizontal: 24),
                      child: Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: mainColor.withOpacity(0.08),
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                              spreadRadius: 0,
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Title with accent
                            Container(
                              margin: const EdgeInsets.only(bottom: 32),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 4,
                                        height: 24,
                                        margin:
                                            const EdgeInsets.only(right: 12),
                                        decoration: BoxDecoration(
                                          color: mainColor,
                                          borderRadius:
                                              BorderRadius.circular(2),
                                        ),
                                      ),
                                      const Text(
                                        'Inscription',
                                        style: TextStyle(
                                          fontSize: 32,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF1A1A1A),
                                          height: 1.2,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Padding(
                                    padding: const EdgeInsets.only(left: 16),
                                    child: Text(
                                      'en tant qu\'${getUserTypeText()}',
                                      style: const TextStyle(
                                        fontSize: 26,
                                        fontWeight: FontWeight.w300,
                                        color: Color(0xFF1A1A1A),
                                        height: 1.2,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Padding(
                                    padding: const EdgeInsets.only(left: 16),
                                    child: Text(
                                      'Remplissez le formulaire pour créer votre compte',
                                      style: TextStyle(
                                        fontSize: 15,
                                        color: Colors.grey.shade600,
                                        height: 1.5,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Form fields
                            Container(
                              margin: const EdgeInsets.only(bottom: 32),
                              child: Column(
                                children: [
                                  _buildTextField(
                                    label: widget.userType == 'student'
                                        ? 'Nom complet'
                                        : widget.userType == 'school'
                                            ? 'Nom de l\'école'
                                            : 'Nom de l\'entreprise',
                                    controller: _nameController,
                                    prefix: Icons.account_circle_outlined,
                                    mainColor: mainColor,
                                    isError: _nameError != null,
                                    errorText: _nameError,
                                  ),
                                  const SizedBox(height: 24),
                                  _buildTextField(
                                    label: 'Adresse e-mail',
                                    controller: _emailController,
                                    prefix: Icons.email_outlined,
                                    keyboardType: TextInputType.emailAddress,
                                    mainColor: mainColor,
                                    isError: _emailError != null,
                                    errorText: _emailError,
                                  ),
                                  const SizedBox(height: 24),
                                  _buildTextField(
                                    label: 'Mot de passe',
                                    controller: _passwordController,
                                    prefix: Icons.lock_outline,
                                    isPassword: true,
                                    isPasswordVisible: _isPasswordVisible,
                                    onVisibilityChanged: (value) => setState(
                                        () => _isPasswordVisible = value),
                                    mainColor: mainColor,
                                    isError: _passwordError != null,
                                    errorText: _passwordError,
                                  ),
                                  const SizedBox(height: 24),
                                  _buildTextField(
                                    label: 'Confirmer le mot de passe',
                                    controller: _confirmPasswordController,
                                    prefix: Icons.lock_outline,
                                    isPassword: true,
                                    isPasswordVisible:
                                        _isConfirmPasswordVisible,
                                    onVisibilityChanged: (value) => setState(
                                        () =>
                                            _isConfirmPasswordVisible = value),
                                    isError: !_passwordsMatch ||
                                        _passwordError != null,
                                    errorText: _passwordError,
                                    mainColor: mainColor,
                                  ),
                                ],
                              ),
                            ),

                            // Submit button
                            _buildSubmitButton(mainColor),
                            const SizedBox(height: 24),

                            // Login link
                            Center(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Vous avez déjà un compte ? ',
                                    style: TextStyle(
                                      color: Colors.grey.shade600,
                                      fontSize: 14,
                                    ),
                                  ),
                                  MouseRegion(
                                    cursor: SystemMouseCursors.click,
                                    child: GestureDetector(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                              builder: (context) =>
                                                  const Login()),
                                        );
                                      },
                                      child: Text(
                                        'Connectez-vous',
                                        style: TextStyle(
                                          color: mainColor,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Terms
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: mainColor.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: RichText(
                                textAlign: TextAlign.center,
                                text: TextSpan(
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey.shade600,
                                    height: 1.5,
                                  ),
                                  children: [
                                    const TextSpan(
                                        text:
                                            'En créant un compte ou vous identifiant, vous acceptez nos '),
                                    TextSpan(
                                      text: 'conditions d\'utilisation',
                                      style: TextStyle(
                                        color: mainColor,
                                        decoration: TextDecoration.underline,
                                      ),
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                                builder: (context) => Terms()),
                                          );
                                        },
                                    ),
                                    const TextSpan(text: ' et notre '),
                                    TextSpan(
                                      text: 'politique de confidentialité',
                                      style: TextStyle(
                                        color: mainColor,
                                        decoration: TextDecoration.underline,
                                      ),
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                                builder: (context) =>
                                                    PrivacyPolicy()),
                                          );
                                        },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData prefix,
    required Color mainColor,
    bool isPassword = false,
    bool? isPasswordVisible,
    Function(bool)? onVisibilityChanged,
    TextInputType? keyboardType,
    bool isError = false,
    String? errorText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isError ? Colors.red.shade400 : Colors.grey.shade200,
              width: 1.5,
            ),
          ),
          child: MouseRegion(
            onEnter: (_) => setState(() => _isHovered = true),
            onExit: (_) => setState(() => _isHovered = false),
            child: TextField(
              controller: controller,
              obscureText: isPassword && !(isPasswordVisible ?? false),
              keyboardType: keyboardType,
              decoration: InputDecoration(
                labelText: label,
                labelStyle: TextStyle(
                  color: isError ? Colors.red.shade400 : Colors.grey.shade600,
                ),
                prefixIcon: Icon(
                  prefix,
                  color: isError
                      ? Colors.red.shade400
                      : mainColor.withOpacity(0.7),
                ),
                suffixIcon: isPassword
                    ? IconButton(
                        icon: Icon(
                          isPasswordVisible ?? false
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: Colors.grey.shade500,
                        ),
                        onPressed: () => onVisibilityChanged
                            ?.call(!(isPasswordVisible ?? false)),
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: mainColor.withOpacity(0.5),
                    width: 1.5,
                  ),
                ),
                filled: true,
                fillColor:
                    _isHovered ? mainColor.withOpacity(0.02) : Colors.white,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              ),
              style: TextStyle(
                fontSize: 15,
                color: isError ? Colors.red.shade400 : const Color(0xFF1A1A1A),
              ),
              cursorColor: mainColor,
            ),
          ),
        ),
        if (isError && errorText != null)
          Padding(
            padding: const EdgeInsets.only(top: 8, left: 16),
            child: Text(
              errorText,
              style: TextStyle(
                color: Colors.red.shade400,
                fontSize: 12,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildSubmitButton(Color mainColor) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isSubmitHovered = true),
      onExit: (_) => setState(() => _isSubmitHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        transform: Matrix4.identity()..scale(_isSubmitHovered ? 1.02 : 1.0),
        child: Container(
          width: double.infinity,
          height: 50,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                mainColor,
                mainColor.withOpacity(0.8),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: mainColor.withOpacity(_isSubmitHovered ? 0.3 : 0.2),
                blurRadius: _isSubmitHovered ? 16 : 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                if (_validateFields()) {
                  // Implement form submission
                  print('UserType: ${widget.userType}');
                  print('Name: ${_nameController.text}');
                  print('Email: ${_emailController.text}');
                  print('Password: ${_passwordController.text}');
                }
              },
              borderRadius: BorderRadius.circular(12),
              child: Center(
                child: _isSubmitHovered
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Créer mon compte',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            Icons.arrow_forward,
                            color: Colors.white.withOpacity(0.9),
                            size: 18,
                          ),
                        ],
                      )
                    : const Text(
                        'Créer mon compte',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAnimatedBlob({
    required AnimationController animation,
    required AnimationController scaleAnimation,
    required Color color,
    required double size,
    required Offset initialOffset,
    required double floatRadius,
  }) {
    return AnimatedBuilder(
      animation: Listenable.merge([animation, scaleAnimation]),
      builder: (context, child) {
        final scaleValue = 0.9 + (scaleAnimation.value * 0.2);
        return Transform.translate(
          offset: Offset(
            initialOffset.dx +
                floatRadius * math.cos(animation.value * 2 * math.pi),
            initialOffset.dy +
                floatRadius * math.sin(animation.value * 2 * math.pi),
          ),
          child: Transform.scale(
            scale: scaleValue,
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: color.withOpacity(0.3),
                borderRadius: BorderRadius.circular(size / 2),
                gradient: RadialGradient(
                  colors: [
                    color.withOpacity(0.3),
                    color.withOpacity(0.1),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
