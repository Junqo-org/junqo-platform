import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/shared/dto/conversation_data.dart';

class MessagingService {
  final RestClient _client;

  MessagingService(this._client);

  /// Get all conversations for the current user
  Future<List<ConversationData>> getConversations({
    String? participantId,
    int limit = 10,
    int offset = 0,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'limit': limit,
        'offset': offset,
      };

      if (participantId != null) {
        queryParams['participantId'] = participantId;
      }

      final response =
          await _client.getQuery('/conversations', query: queryParams);

      if (response is Map<String, dynamic> && response['rows'] != null) {
        final List<dynamic> conversationsJson =
            response['rows'] as List<dynamic>;
        return conversationsJson
            .map((json) =>
                ConversationData.fromJson(json as Map<String, dynamic>))
            .toList();
      } else if (response is List<dynamic>) {
        return response
            .map((json) =>
                ConversationData.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } catch (e) {
      debugPrint('Error fetching conversations: $e');
      rethrow;
    }
  }

  /// Get a specific conversation by ID
  Future<ConversationData> getConversation(String conversationId) async {
    try {
      final response = await _client.get('/conversations/$conversationId');
      return ConversationData.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      debugPrint('Error fetching conversation: $e');
      rethrow;
    }
  }

  /// Create a new conversation
  Future<ConversationData> createConversation(
      CreateConversationData conversationData) async {
    try {
      final response =
          await _client.post('/conversations', body: conversationData.toJson());
      return ConversationData.fromJson(response);
    } catch (e) {
      debugPrint('Error creating conversation: $e');
      rethrow;
    }
  }

  /// Delete a conversation
  Future<void> deleteConversation(String conversationId) async {
    try {
      await _client.delete('/conversations/$conversationId');
    } catch (e) {
      debugPrint('Error deleting conversation: $e');
      rethrow;
    }
  }

  /// Get messages for a specific conversation
  Future<List<MessageData>> getMessages(
    String conversationId, {
    int limit = 50,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'limit': limit,
      };

      final response = await _client.getQuery(
          '/conversations/$conversationId/messages',
          query: queryParams);

      if (response is Map<String, dynamic> && response['rows'] != null) {
        final List<dynamic> messagesJson = response['rows'] as List<dynamic>;
        return messagesJson
            .map((json) => MessageData.fromJson(json as Map<String, dynamic>))
            .toList();
      } else if (response is List<dynamic>) {
        return response
            .map((json) => MessageData.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      return [];
    } catch (e) {
      debugPrint('Error fetching messages: $e');
      rethrow;
    }
  }

  /// Send a message in a conversation
  Future<MessageData> sendMessage(
      String conversationId, String content, String senderId) async {
    try {
      final messageData = {
        'content': content,
      };

      final response = await _client
          .post('/conversations/$conversationId/messages', body: messageData);
      return MessageData.fromJson(response);
    } catch (e) {
      debugPrint('Error sending message: $e');
      rethrow;
    }
  }

  /// Get a specific message by ID
  Future<MessageData> getMessage(String messageId) async {
    try {
      final response = await _client.get('/messages/$messageId');
      return MessageData.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      debugPrint('Error fetching message: $e');
      rethrow;
    }
  }

  /// Update a message
  Future<MessageData> updateMessage(String messageId, String content) async {
    try {
      final response = await _client
          .patch('/messages/$messageId', body: {'content': content});
      return MessageData.fromJson(response);
    } catch (e) {
      debugPrint('Error updating message: $e');
      rethrow;
    }
  }

  /// Delete a message
  Future<void> deleteMessage(String messageId) async {
    try {
      await _client.delete('/messages/$messageId');
    } catch (e) {
      debugPrint('Error deleting message: $e');
      rethrow;
    }
  }

  /// Set a custom title for a conversation
  Future<void> setConversationTitle(String conversationId, String title) async {
    try {
      await _client
          .put('/conversations/$conversationId/title', body: {'title': title});
    } catch (e) {
      debugPrint('Error setting conversation title: $e');
      rethrow;
    }
  }

  /// Get the custom title for a conversation
  Future<String?> getConversationTitle(String conversationId) async {
    try {
      final response =
          await _client.get('/conversations/$conversationId/title');
      return response['title'] as String?;
    } catch (e) {
      debugPrint('Error getting conversation title: $e');
      return null;
    }
  }

  /// Remove the custom title for a conversation
  Future<void> removeConversationTitle(String conversationId) async {
    try {
      await _client.delete('/conversations/$conversationId/title');
    } catch (e) {
      debugPrint('Error removing conversation title: $e');
      rethrow;
    }
  }

  /// Add participants to a conversation
  Future<ConversationData> addParticipants(
      String conversationId, List<String> participantIds) async {
    try {
      final response = await _client.post(
          '/conversations/$conversationId/participants',
          body: {'participantsIds': participantIds});
      return ConversationData.fromJson(response);
    } catch (e) {
      debugPrint('Error adding participants: $e');
      rethrow;
    }
  }

  /// Remove participants from a conversation
  Future<ConversationData> removeParticipants(
      String conversationId, List<String> participantIds) async {
    try {
      final response = await _client.delete(
        '/conversations/$conversationId/participants',
        body: {'participantsIds': participantIds},
      );
      return ConversationData.fromJson(response);
    } catch (e) {
      debugPrint('Error removing participants: $e');
      rethrow;
    }
  }
}
