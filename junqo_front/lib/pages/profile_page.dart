import 'package:flutter/material.dart';
import '../widgets/navbar.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isEditing = false;

  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _schoolController = TextEditingController();
  final TextEditingController _degreeController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _skillsController = TextEditingController();
  final TextEditingController _bioController = TextEditingController();
  final TextEditingController _linkedinController = TextEditingController();
  final TextEditingController _githubController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: Column(
        children: [
          const Navbar(currentIndex: 4),
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildProfileHeader(),
                    const SizedBox(height: 24),
                    _buildProfileForm(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 60,
                backgroundImage: const AssetImage('images/profile_placeholder.jpg'),
                backgroundColor: Colors.grey[200],
              ),
              if (_isEditing)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.camera_alt,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _nameController.text.isEmpty ? "Votre Nom" : _nameController.text,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _schoolController.text.isEmpty ? "Votre École" : _schoolController.text,
                  style: const TextStyle(
                    fontSize: 18,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 16),
                if (!_isEditing)
                  Wrap(
                    spacing: 8,
                    children: [
                      Chip(
                        label: Text(_degreeController.text.isEmpty ? "Votre Formation" : _degreeController.text),
                        backgroundColor: Colors.blue[50],
                      ),
                      Chip(
                        label: Text(_locationController.text.isEmpty ? "Votre Localisation" : _locationController.text),
                        backgroundColor: Colors.blue[50],
                      ),
                    ],
                  ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              setState(() {
                _isEditing = !_isEditing;
              });
            },
            icon: Icon(
              _isEditing ? Icons.done : Icons.edit,
              color: Colors.blue,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileForm() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Informations personnelles",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                _buildTextField(
                  controller: _nameController,
                  label: "Nom complet",
                  icon: Icons.person,
                ),
                _buildTextField(
                  controller: _emailController,
                  label: "Email",
                  icon: Icons.email,
                ),
                _buildTextField(
                  controller: _phoneController,
                  label: "Téléphone",
                  icon: Icons.phone,
                ),
                _buildTextField(
                  controller: _locationController,
                  label: "Localisation",
                  icon: Icons.location_on,
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text(
              "Formation et compétences",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _schoolController,
              label: "École",
              icon: Icons.school,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _degreeController,
              label: "Formation en cours",
              icon: Icons.grade,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _skillsController,
              label: "Compétences",
              icon: Icons.star,
              maxLines: 3,
            ),
            const SizedBox(height: 24),
            const Text(
              "À propos de moi",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _bioController,
              label: "Bio",
              icon: Icons.info,
              maxLines: 5,
            ),
            const SizedBox(height: 24),
            const Text(
              "Liens",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _linkedinController,
              label: "LinkedIn",
              icon: Icons.link,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _githubController,
              label: "GitHub",
              icon: Icons.code,
            ),
            const SizedBox(height: 24),
            if (_isEditing)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Save profile
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    "Enregistrer",
                    style: TextStyle(fontSize: 18),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      enabled: _isEditing,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: !_isEditing,
        fillColor: Colors.grey[100],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _schoolController.dispose();
    _degreeController.dispose();
    _locationController.dispose();
    _skillsController.dispose();
    _bioController.dispose();
    _linkedinController.dispose();
    _githubController.dispose();
    super.dispose();
  }
}