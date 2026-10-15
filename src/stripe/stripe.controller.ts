import { Controller, Inject, Post, Req, Headers, BadRequestException, InternalServerErrorException, HttpCode, HttpStatus } from '@nestjs/common';
import Stripe from 'stripe';

import { OrdersService } from 'src/orders/orders.service';
import { STRIPE_CLIENT } from './stripe.constants';
@Controller('webhooks')
export class StripeController {

    constructor(
        @Inject(STRIPE_CLIENT) private readonly stripe:Stripe,
        private readonly ordersService:OrdersService    
    ){}

    @Post('stripe')
    @HttpCode(HttpStatus.OK) // <-- Fuerza el código 200 OK de forma nativa para Stripe
    async handleStripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: any, // Captura el request con el buffer crudo
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe signature');
        }
        
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!endpointSecret) {
            throw new InternalServerErrorException('STRIPE_WEBHOOK_SECRET is not defined in env variables');
        }

        if (!request.rawBody) {
            throw new InternalServerErrorException(
                'Raw body is undefined. Make sure { rawBody: true } is enabled in main.ts'
            );
        }

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                request.rawBody, 
                signature, 
                endpointSecret
            );
        } catch (error: any) {
            throw new BadRequestException(`Stripe Webhook signature verification failed: ${error.message}`);    
        }

        // BLOQUE DE LÓGICA DE NEGOCIO SEGURO
        try {
            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                
                // Aquí se activa tu QueryRunner, transacción ACID y bloqueo pesimista en PostgreSQL
                await this.ordersService.fulfillOrder(paymentIntent.id);
                console.log(`[Stripe Webhook] Orden procesada y stock actualizado para el PI: ${paymentIntent.id}`);
            }
            
            // Al quitar @Res(), NestJS capturará este return y le enviará el 200 OK 
            // a Stripe de forma automática e inmediata para TODOS los eventos.
            return { received: true };

        } catch (error: any) {
            throw new InternalServerErrorException(`Webhook business logic failed: ${error.message}`);
        }
    }
}
