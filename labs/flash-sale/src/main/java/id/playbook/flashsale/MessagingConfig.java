package id.playbook.flashsale;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class MessagingConfig {
    static final String ORDERS_QUEUE = "orders";
    static final String ORDERS_DLQ = "orders.dlq";

    @Bean
    Queue ordersQueue() {
        // Pesan yang ditolak setelah retry habis pindah ke DLQ, bukan hilang dan bukan berputar selamanya
        return QueueBuilder.durable(ORDERS_QUEUE)
                .deadLetterExchange("")
                .deadLetterRoutingKey(ORDERS_DLQ)
                .build();
    }

    @Bean
    Queue ordersDeadLetterQueue() {
        return QueueBuilder.durable(ORDERS_DLQ).build();
    }

    @Bean
    MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
