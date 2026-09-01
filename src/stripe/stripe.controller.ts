import { Controller, Inject, Post, RawBodyRequest, Req, Headers, BadRequestException, Res } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './stripe.module';
import { Response } from 'express';
import { OrdersService } from 'src/orders/orders.service';
@Controller('webhooks')
export class StripeController {

    constructor(
        @Inject(STRIPE_CLIENT) private readonly stripe:Stripe,
        private readonly ordersService:OrdersService    
    ){}

    @Post('stripe')
    async handleStripeWebhook(
        @Headers('stripe-signature') signature:string,
        @Req() request:RawBodyRequest<Request>,
        @Res() response:Response
        
    ){
        if(!signature) throw new BadRequestException('MIssing stripe signature')
        
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
            let event: Stripe.Event;

            try {
                event = this.stripe.webhooks.constructEvent(request.rawBody,signature,endpointSecret);
            } catch (error) {
                throw new BadRequestException(`Stripe Webhook error ${error}`)    
            }
            //Listent to stripe event
            if(event.type==='payment_intent.succeeded'){
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await this.ordersService.fulfillOrder(paymentIntent.id);
            }
            return response.status(200).json({received:true})
            
    }

}
