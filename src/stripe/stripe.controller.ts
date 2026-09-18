import { Controller, Inject, Post, Req, Headers, BadRequestException, Res, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

import { Response } from 'express';
import { OrdersService } from 'src/orders/orders.service';
import { STRIPE_CLIENT } from './stripe.constants';
@Controller('webhooks')
export class StripeController {

    constructor(
        @Inject(STRIPE_CLIENT) private readonly stripe:Stripe,
        private readonly ordersService:OrdersService    
    ){}

     @Post('stripe')
    async handleStripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: any, 
        @Res() response: Response
    ){
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

        
        try {
            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                
             
                await this.ordersService.fulfillOrder(paymentIntent.id);
            }
            
          
            return response.status(200).json({ received: true });

        } catch (error: any) {
          
            throw new InternalServerErrorException(`Webhook business logic failed: ${error.message}`);
        }
    }
}
