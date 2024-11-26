import 'package:flutter/material.dart';

class BusinessOfferForm extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Créer une Offre de Stage'),
        backgroundColor: Colors.deepPurple,
      ),
      body: Container(
        color: Color(0xFF82C8D7), 
        padding: EdgeInsets.all(16.0), 
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'Créez votre offre de stage',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.deepPurple,
              ),
            ),
            SizedBox(height: 20),
            
            Center(
              child: Container(
                width: MediaQuery.of(context).size.width * 0.5, 
                child: TextField(
                  decoration: InputDecoration(
                    labelText: 'Intitulé de votre offre',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
            ),
            SizedBox(height: 20),

            Center(
              child: Container(
                width: MediaQuery.of(context).size.width * 0.5, 
                child: TextField(
                  decoration: InputDecoration(
                    labelText: 'Mots clefs',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
            ),
            SizedBox(height: 20),

            Center(
              child: Container(
                width: MediaQuery.of(context).size.width * 0.5, 
                child: TextField(
                  decoration: InputDecoration(
                    labelText: 'Description de l\'offre',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 4,
                ),
              ),
            ),
            SizedBox(height: 20),

            Center(
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Y\'a pas de DB mais c\'est ok')),
                  );
                },
                child: Text('Soumettre'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
