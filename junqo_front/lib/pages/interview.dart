import 'package:flutter/material.dart';
import '../widgets/navbar.dart';

class Interview extends StatefulWidget {
  @override
  _InterviewState createState() => _InterviewState();
}

class _InterviewState extends State<Interview> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, String>> _messages = [];
  final FocusNode _focusNode = FocusNode();
  bool _isInterviewStarted = false;

  void _startInterview() {
    setState(() {
      _isInterviewStarted = true;
      _messages.add({
        "sender": "ai",
        "text": "Bonjour ! Je suis ravi de vous accompagner dans cet entretien simulé. N'hésitez pas à me poser des questions, je ferai de mon mieux pour vous aider à vous préparer. C'est parti !"
      });
    });
  }

  void _sendMessage() {
    if (_messageController.text.isNotEmpty) {
      setState(() {
        _messages.add({"sender": "user", "text": _messageController.text});
        _messages.add({"sender": "ai", "text": "Réponse reçue"});
        _messageController.clear();
      });
      _focusNode.requestFocus(); // Redonne le focus au champ de texte
    }
  }

  void _showRemarkPopup() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Remarque"),
          content: const Text(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur orci sed nulla facilisis consequat. Curabitur vel lorem sit amet nulla ullamcorper fermentum.",
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text("Fermer"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Navbar en haut avec l'index 1 pour IA
          const Navbar(currentIndex: 1),

          // Contenu principal
          Expanded(
            child: _isInterviewStarted
                ? _buildInterviewChat()
                : _buildStartInterviewScreen(),
          ),
        ],
      ),
    );
  }

  Widget _buildStartInterviewScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            "assets/images/interview.png",
            width: 220,
          ),
          const SizedBox(height: 24),
          const Text(
            "Entraînez-vous aux entretiens d'embauche",
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              "Notre IA vous accompagne pour améliorer vos compétences en entretien. Posez des questions, recevez des conseils et préparez-vous efficacement.",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _startInterview,
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
              "Commencer l'entretien",
              style: TextStyle(fontSize: 18, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInterviewChat() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isUserMessage = message["sender"] == "user";

                return Column(
                  crossAxisAlignment: isUserMessage
                      ? CrossAxisAlignment.end
                      : CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: isUserMessage
                          ? MainAxisAlignment.end
                          : MainAxisAlignment.start,
                      children: [
                        if (!isUserMessage)
                          CircleAvatar(
                            backgroundImage:
                                AssetImage("images/ai_avatar.png"),
                            radius: 24,
                          ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isUserMessage
                                  ? Colors.blue
                                  : Colors.grey[200],
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              message["text"]!,
                              style: TextStyle(
                                fontSize: 16,
                                color: isUserMessage
                                    ? Colors.white
                                    : Colors.black,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (isUserMessage)
                          CircleAvatar(
                            backgroundImage:
                                AssetImage("images/profile_placeholder.jpg"),
                            radius: 24,
                          ),
                      ],
                    ),
                    const SizedBox(height: 8), // Ajout d'une marge
                    if (isUserMessage)
                      Padding(
                        padding: const EdgeInsets.only(top: 8, right: 56),
                        child: ElevatedButton(
                          onPressed: _showRemarkPopup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey[300],
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 2,
                          ),
                          child: const Text(
                            "Afficher la remarque",
                            style: TextStyle(color: Colors.black, fontSize: 14),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    focusNode: _focusNode, // Ajout du FocusNode
                    decoration: InputDecoration(
                      hintText: "Tapez votre message...",
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: (value) => _sendMessage(), // Envoi sur Entrée
                  ),
                ),
                IconButton(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send, color: Colors.blue),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
