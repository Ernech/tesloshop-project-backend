export enum OrderStatus {
  // --- FASE DE PAGO ---
  PENDING = 'PENDING',   // La orden se creó en NestJS, esperando que el cliente use Stripe.
  FAILED = 'FAILED',    // El pago fue rechazado por el banco o la sesión de Stripe expiró.
  
  // --- FASE DE LOGÍSTICA (POST-PAGO) ---
  PAID = 'PAID',        // ¡Éxito! El webhook de Stripe confirmó el dinero. Toca preparar el paquete.
  PROCESSING = 'PROCESSING', // (Opcional) El almacén está empacando las prendas de ropa.
  SHIPPED = 'SHIPPED',   // La ropa ya se entregó a la empresa de envíos (Stripe/DHL/FedEx) y tiene tracking.
  DELIVERED = 'DELIVERED', // El cliente ya recibió su ropa. Fin del flujo feliz.
  
  // --- FASE DE EXCEPCIONES ---
  CANCELLED = 'CANCELLED', // El usuario canceló la orden antes de que se enviara.
  REFUNDED = 'REFUNDED',   // (Muy importante para Stripe) Se le devolvió el dinero al cliente.
}