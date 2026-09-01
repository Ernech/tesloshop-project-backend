import { DynamicModule, Global, Module } from '@nestjs/common';
import {  ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeController } from './stripe.controller';
import { OrdersModule } from 'src/orders/orders.module';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';
@Global()
@Module({
  controllers: [StripeController]
})
export class StripeModule {
    static forRootAsync():DynamicModule {

       return {
      module: StripeModule,
       imports: [OrdersModule],
      providers: [
        {
          provide: STRIPE_CLIENT,
          useFactory: (configService: ConfigService) => {
            const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
            
            if (!secretKey) {
              throw new Error('STRIPE_SECRET_KEY not defined in the env variables');
            }

            return new Stripe(secretKey, {
              apiVersion: '2026-07-29.dahlia', 
              typescript: true, 
            });
          },
          inject: [ConfigService],
        },
      ],
      exports: [STRIPE_CLIENT], 
    };
    }
}
