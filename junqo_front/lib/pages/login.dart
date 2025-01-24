  import 'package:flutter/material.dart';
  import 'home_page.dart';
  import 'dart:math' as math;
  import 'type_selection.dart';
  import 'welcome.dart';
  import 'terms_of_use.dart';
  import 'privacy_policy.dart';
  import 'package:flutter/gestures.dart';

  class Login extends StatefulWidget {
    const Login({Key? key}) : super(key: key);

    @override
    State<Login> createState() => _LoginState();
  }

  class _LoginState extends State<Login> with TickerProviderStateMixin {
    // Animation controllers
    late final AnimationController _blob1Controller;
    late final AnimationController _blob2Controller;
    late final AnimationController _blob3Controller;
    late final AnimationController _scaleController;

    // Form controllers
    final TextEditingController _emailController = TextEditingController();
    final TextEditingController _passwordController = TextEditingController();
    
    // Form state
    bool _isPasswordVisible = false;
    bool _isHovered = false;
    String? _emailError;
    String? _passwordError;
    bool _isSubmitHovered = false;
    bool _rememberMe = false;

    bool _validateFields() {
      bool isValid = true;
      setState(() {
        if (_emailController.text.trim().isEmpty) {
          _emailError = 'Ce champ est requis';
          isValid = false;
        } else if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(_emailController.text)) {
          _emailError = 'Adresse email invalide';
          isValid = false;
        } else {
          _emailError = null;
        }

        if (_passwordController.text.isEmpty) {
          _passwordError = 'Ce champ est requis';
          isValid = false;
        } else {
          _passwordError = null;
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
      _emailController.dispose();
      _passwordController.dispose();
      _blob1Controller.dispose();
      _blob2Controller.dispose();
      _blob3Controller.dispose();
      _scaleController.dispose();
      super.dispose();
    }

    @override
    Widget build(BuildContext context) {
      return Scaffold(
        body: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.blue.shade50,
                Colors.white,
              ],
            ),
          ),
          child: Stack(
            children: [
              // Animated blobs
              Positioned(
                left: -100,
                top: -50,
                child: _buildAnimatedBlob(
                  animation: _blob1Controller,
                  scaleAnimation: _scaleController,
                  color: Colors.blue.shade100,
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
                  color: Colors.blue.shade200,
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
                  color: Colors.blue.shade100,
                  size: 400,
                  initialOffset: const Offset(150, 300),
                  floatRadius: 65,
                ),
              ),

              // Main content
              SingleChildScrollView(
                child: Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: MediaQuery.of(context).size.height,
                    ),
                    child: IntrinsicHeight(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Logo header
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
                                  icon: Icon(Icons.arrow_back, color: Colors.blue.shade400),
                                  onPressed: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => const Welcome()),
                                  ),
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
                          Expanded(
                            child: Center(
                              child: Container(
                                constraints: const BoxConstraints(maxWidth: 450),
                                margin: const EdgeInsets.symmetric(vertical: 0, horizontal: 24),
                                padding: const EdgeInsets.all(32),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.08),
                                      blurRadius: 24,
                                      offset: const Offset(0, 8),
                                      spreadRadius: 0,
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Title
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
                                                margin: const EdgeInsets.only(right: 12),
                                                decoration: BoxDecoration(
                                                  color: Colors.blue.shade400,
                                                  borderRadius: BorderRadius.circular(2),
                                                ),
                                              ),
                                              const Text(
                                                'Connexion',
                                                style: TextStyle(
                                                  fontSize: 32,
                                                  fontWeight: FontWeight.w600,
                                                  color: Color(0xFF1A1A1A),
                                                  height: 1.2,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 16),
                                          Text(
                                            'Entrez vos identifiants pour accéder à votre compte',
                                            style: TextStyle(
                                              fontSize: 15,
                                              color: Colors.grey.shade600,
                                              height: 1.5,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Form fields
                                    _buildTextField(
                                      label: 'Adresse e-mail',
                                      controller: _emailController,
                                      prefix: Icons.email_outlined,
                                      keyboardType: TextInputType.emailAddress,
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
                                      onVisibilityChanged: (value) => setState(() => _isPasswordVisible = value),
                                      isError: _passwordError != null,
                                      errorText: _passwordError,
                                    ),
                                    const SizedBox(height: 16),

                                    // Remember me and Forgot password
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        // Remember me checkbox
                                        Row(
                                          children: [
                                            Transform.scale(
                                              scale: 0.9,
                                              child: Checkbox(
                                                value: _rememberMe,
                                                onChanged: (value) {
                                                  setState(() {
                                                    _rememberMe = value ?? false;
                                                  });
                                                },
                                                shape: RoundedRectangleBorder(
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                              ),
                                            ),
                                            Text(
                                              'Se souvenir de moi',
                                              style: TextStyle(
                                                color: Colors.grey.shade700,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ],
                                        ),
                                        // Forgot password link
                                        MouseRegion(
                                          cursor: SystemMouseCursors.click,
                                          child: GestureDetector(
                                            onTap: () {},
                                            child: Text(
                                              'Mot de passe oublié ?',
                                              style: TextStyle(
                                                color: Colors.blue.shade600,
                                                fontSize: 14,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 26),

                                    // Submit button
                                    _buildSubmitButton(),
                                    const SizedBox(height: 24),

                                    // Sign up link
                                    Center(
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            'Vous n\'avez pas de compte ? ',
                                            style: TextStyle(
                                              color: Colors.grey.shade600,
                                              fontSize: 12,
                                            ),
                                          ),
                                          MouseRegion(
                                            cursor: SystemMouseCursors.click,
                                            child: GestureDetector(
                                              onTap: () {
                                                Navigator.push(
                                                  context,
                                                  MaterialPageRoute(builder: (context) => const Selection()),
                                                );
                                              },
                                              child: Text(
                                                'Inscrivez-vous',
                                                style: TextStyle(
                                                  color: Colors.blue.shade600,
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 20),

                                    // Terms
                                    Container(
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade50,
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
                                            const TextSpan(text: 'En créant un compte ou vous identifiant, vous acceptez nos '),
                                            TextSpan(
                                              text: 'conditions d\'utilisation',
                                              style: TextStyle(
                                                color: Colors.blue.shade600,
                                                decoration: TextDecoration.underline,
                                              ),
                                              recognizer: TapGestureRecognizer()
                                                ..onTap = () {
                                                  Navigator.push(
                                                    context,
                                                    MaterialPageRoute(builder: (context) => Terms()),
                                                  );
                                                },
                                            ),
                                            const TextSpan(text: ' et notre '),
                                            TextSpan(
                                              text: 'politique de confidentialité',
                                              style: TextStyle(
                                                color: Colors.blue.shade600,
                                                decoration: TextDecoration.underline,
                                              ),
                                              recognizer: TapGestureRecognizer()
                                                ..onTap = () {
                                                  Navigator.push(
                                                    context,
                                                    MaterialPageRoute(builder: (context) => PrivacyPolicy()),
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
                  ),
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
                    color: isError ? Colors.red.shade400 : Colors.blue.shade400,
                  ),
                  suffixIcon: isPassword ? IconButton(
                    icon: Icon(
                      isPasswordVisible ?? false ? Icons.visibility_off : Icons.visibility,
                      color: Colors.grey.shade500,
                    ),
                    onPressed: () => onVisibilityChanged?.call(!(isPasswordVisible ?? false)),
                  ) : null,
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
                      color: Colors.blue.shade400,
                      width: 1.5,
                    ),
                  ),
                  filled: true,
                  fillColor: _isHovered ? Colors.blue.shade50.withOpacity(0.2) : Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
                style: TextStyle(
                  fontSize: 15,
                  color: isError ? Colors.red.shade400 : const Color(0xFF1A1A1A),
                ),
                cursorColor: Colors.blue.shade400,
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

    Widget _buildSubmitButton() {
      return MouseRegion(
        onEnter: (_) => setState(() => _isSubmitHovered = true),
        onExit: (_) => setState(() => _isSubmitHovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          transform: Matrix4.identity()..scale(_isSubmitHovered ? 1.02 : 1.0),
          child: Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.blue.shade400,
                  Colors.blue.shade600,
                ],
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withOpacity(_isSubmitHovered ? 0.3 : 0.2),
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
                    //_emailController.text
                    //_passwordController.text
                    //_nameController.text
                    //_rememberMe
                    //userType
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const HomePage()),
                    );
                  }
                },
                borderRadius: BorderRadius.circular(12),
                child: Center(
                  child: _isSubmitHovered 
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Se connecter',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.3,
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
                        'Se connecter',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.3,
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
              initialOffset.dx + floatRadius * math.cos(animation.value * 2 * math.pi),
              initialOffset.dy + floatRadius * math.sin(animation.value * 2 * math.pi),
            ),
            child: Transform.scale(
              scale: scaleValue,
              child: Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.7),
                  borderRadius: BorderRadius.circular(size / 2),
                  gradient: RadialGradient(
                    colors: [
                      color.withOpacity(0.7),
                      color.withOpacity(0.3),
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