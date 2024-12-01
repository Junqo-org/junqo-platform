import 'package:flutter/material.dart';
import 'widget/bottom_bar.dart';

class SimulatorPage extends StatefulWidget {
  const SimulatorPage({super.key});

  @override
  State<SimulatorPage> createState() => _SimulatorPageState();
}

class _SimulatorPageState extends State<SimulatorPage> {
  int _currentIndex = 2;
  final TextEditingController _chatController = TextEditingController();
  final List<String> _messages = [];

  void _onNavBarTap(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _sendMessage() {
    String message = _chatController.text.trim();
    if (message.isNotEmpty) {
      setState(() {
        _messages.add(message);
      });
      _chatController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 134, 159, 241),
        title: const Text(
          "Simulateur d'entretien",
          style: TextStyle(color: Colors.black),
        ),
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return _buildMessageBubble(_messages[index], index);
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _chatController,
                    decoration: InputDecoration(
                      hintText: "Taper un message",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(color: Colors.grey),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send, color: Color.fromARGB(255, 134, 159, 241)),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: _onNavBarTap,
      ),
    );
  }

  Widget _buildMessageBubble(String message, int index) {
    bool isUserMessage = index % 2 == 0;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: isUserMessage ? MainAxisAlignment.end : MainAxisAlignment.start,
      children: [
        if (!isUserMessage)
          const CircleAvatar(
            radius: 20,
            backgroundColor: Colors.grey,
            child: Icon(Icons.person, color: Colors.white),
          ),
        if (!isUserMessage) const SizedBox(width: 8),
        Flexible(
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isUserMessage
                  ? const Color.fromARGB(255, 134, 159, 241)
                  : Colors.grey[200],
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(12),
                topRight: const Radius.circular(12),
                bottomLeft: isUserMessage ? const Radius.circular(12) : Radius.zero,
                bottomRight: isUserMessage ? Radius.zero : const Radius.circular(12),
              ),
            ),
            child: Text(
              message,
              style: TextStyle(
                color: isUserMessage ? Colors.white : Colors.black,
                fontSize: 16,
              ),
            ),
          ),
        ),
        if (isUserMessage) const SizedBox(width: 8),
        if (isUserMessage)
          const CircleAvatar(
            radius: 20,
            backgroundColor: Colors.grey,
            child: Icon(Icons.person, color: Colors.white),
          ),
      ],
    );
  }
}
