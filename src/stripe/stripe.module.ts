import { DynamicModule, forwardRef, Global, Module } from '@nestjs/common';
import {  ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeController } from './stripe.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { STRIPE_CLIENT } from './stripe.constants';

@Global()
@Module({})
export class StripeModule {
    static forRootAsync():DynamicModule {

       return {
      module: StripeModule,
      controllers:[StripeController],
      imports: [forwardRef(() => OrdersModule), ConfigModule],
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
