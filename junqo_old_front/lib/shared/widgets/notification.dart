import 'package:flutter/material.dart';

class NotificationPopup extends StatelessWidget {
  final VoidCallback onClose;

  const NotificationPopup({
    super.key,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 320,
      constraints: const BoxConstraints(maxHeight: 400),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHeader(),
          Flexible(
            child: _buildNotificationList(),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Notifications',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          IconButton(
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            icon: Icon(
              Icons.close,
              size: 20,
              color: Colors.grey.shade600,
            ),
            onPressed: onClose,
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationList() {
    final notifications = [
      const _NotificationItem(
        title: 'Lorem ipsum dolor',
        message: 'Sit amet consectetur adipiscing elit.',
        time: 'Il y a 5 min',
        isNew: true,
      ),
      const _NotificationItem(
        title: 'Sed do eiusmod tempor',
        message: 'Incididunt ut labore et dolore magna aliqua.',
        time: 'Il y a 15 min',
        isNew: true,
      ),
      const _NotificationItem(
        title: 'Ut enim ad minim',
        message: 'Veniam, quis nostrud exercitation ullamco laboris.',
        time: 'Il y a 1h',
        isNew: false,
      ),
    ];

    if (notifications.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Text(
          'Aucune notification',
          style: TextStyle(
            color: Colors.grey,
            fontSize: 14,
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      shrinkWrap: true,
      itemCount: notifications.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) => _buildNotificationItem(notifications[index]),
    );
  }

  Widget _buildNotificationItem(_NotificationItem notification) {
    return InkWell(
      onTap: () {
        // Action lors du clic sur une notification
        onClose();
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    notification.title,
                    style: TextStyle(
                      fontWeight: notification.isNew ? FontWeight.w600 : FontWeight.normal,
                      fontSize: 14,
                    ),
                  ),
                ),
                Text(
                  notification.time,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              notification.message,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationItem {
  final String title;
  final String message;
  final String time;
  final bool isNew;

  const _NotificationItem({
    required this.title,
    required this.message,
    required this.time,
    required this.isNew,
  });
}