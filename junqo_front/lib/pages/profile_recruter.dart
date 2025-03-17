import 'package:flutter/material.dart';

class CompanyProfile extends StatefulWidget {
  const CompanyProfile({super.key});

  @override
  CompanyProfileState createState() => CompanyProfileState();
}

class CompanyProfileState extends State<CompanyProfile> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _industryController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();

  void _saveProfile() {
    if (_nameController.text.isEmpty ||
        _industryController.text.isEmpty ||
        _locationController.text.isEmpty ||
        _descriptionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tous les champs sont obligatoires')),
      );
      return;
    }
    try {
      // final companyData = {
      //   'name': _nameController.text,
      //   'industry': _industryController.text,
      //   'location': _locationController.text,
      //   'description': _descriptionController.text,
      // };
      // TODO: Implement API call
      // await companyService.updateProfile(companyData);

      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text("Profil mis à jour"),
            content: const Text(
              "Le profil de l'entreprise a été mis à jour avec succès !",
              style: TextStyle(fontSize: 16),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text("Fermer"),
              ),
            ],
          );
        },
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Erreur lors de la mise à jour: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            "Profil de l'Entreprise",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          _buildCompanyLogo(),
          const SizedBox(height: 24),
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: "Nom de l'entreprise",
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _industryController,
            decoration: const InputDecoration(
              labelText: "Secteur d'activité",
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _locationController,
            decoration: const InputDecoration(
              labelText: "Localisation",
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _descriptionController,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: "Description",
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _saveProfile,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              elevation: 5,
              shadowColor: Colors.blueAccent,
            ),
            child: const Text(
              "Enregistrer",
              style: TextStyle(fontSize: 18, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompanyLogo() {
    return Center(
      child: Stack(
        children: [
          const CircleAvatar(
            backgroundImage:
                AssetImage("assets/images/profile_placeholder.jpg"),
            radius: 60,
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: IconButton(
              onPressed: () async {
                // Add image picker and upload functionality
                // final ImagePicker picker = ImagePicker();
                // final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                // if (image != null) {
                //   await companyService.uploadLogo(image);
                // }
              },
              icon: const Icon(Icons.camera_alt, color: Colors.blue),
            ),
          ),
        ],
      ),
    );
  }
}
