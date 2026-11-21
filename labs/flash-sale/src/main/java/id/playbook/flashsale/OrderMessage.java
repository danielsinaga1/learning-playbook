package id.playbook.flashsale;

public record OrderMessage(String orderId, String userId, long productId, int qty) {}
