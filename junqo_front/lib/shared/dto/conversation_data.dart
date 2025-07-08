class ConversationData {
  final String id;
  final List<String> participantsIds;
  final MessageData? lastMessage;
  final String? title;
  final DateTime createdAt;
  final DateTime updatedAt;

  ConversationData({
    required this.id,
    required this.participantsIds,
    this.lastMessage,
    this.title,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ConversationData.fromJson(Map<String, dynamic> json) {
    return ConversationData(
      id: json['id'] as String,
      participantsIds: List<String>.from(json['participantsIds'] as List),
      lastMessage: json['lastMessage'] != null 
          ? MessageData.fromJson(json['lastMessage'] as Map<String, dynamic>)
          : null,
      title: json['title'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'participantsIds': participantsIds,
      'lastMessage': lastMessage?.toJson(),
      'title': title,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class MessageData {
  final String id;
  final String senderId;
  final String conversationId;
  final String content;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  MessageData({
    required this.id,
    required this.senderId,
    required this.conversationId,
    required this.content,
    this.createdAt,
    this.updatedAt,
  });

  factory MessageData.fromJson(Map<String, dynamic> json) {
    return MessageData(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      conversationId: json['conversationId'] as String,
      content: json['content'] as String,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'conversationId': conversationId,
      'content': content,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

class CreateConversationData {
  final List<String> participantsIds;
  final String? title;

  CreateConversationData({
    required this.participantsIds,
    this.title,
  });

  Map<String, dynamic> toJson() {
    return {
      'participantsIds': participantsIds,
      'title': title,
    };
  }
}

class CreateMessageData {
  final String senderId;
  final String conversationId;
  final String content;

  CreateMessageData({
    required this.senderId,
    required this.conversationId,
    required this.content,
  });

  Map<String, dynamic> toJson() {
    return {
      'senderId': senderId,
      'conversationId': conversationId,
      'content': content,
    };
  }
} 