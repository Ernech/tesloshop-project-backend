import { DynamicModule, Global, Module } from '@nestjs/common';
import {  ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';
@Global()
@Module({})
export class StripeModule {
    static forRootAsync():DynamicModule {

       return {
      module: StripeModule,
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
