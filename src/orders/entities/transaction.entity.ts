import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity('transaction')
export class Transaction {

  @PrimaryGeneratedColumn('uuid',{name:'transaction_id',})  
  id: string; 
 
  @Column('varchar',{name:'stripe_payment_intent_id', length:350})
  stripePaymentIntentId: string; 
  
  @Column('numeric',{name:'amount', precision: 10, scale: 2 })
  amount: number; 
  
  @Column('varchar',{name:'status',length:150})
  status: string; // 'succeeded', 'failed', 'processing' (Stripe status)
  
  @Column('varchar',{name:'card_brand',length:150, nullable:true})
  cardBrand?: string; // 'visa', 'mastercard', 'amex'
  
  @Column('varchar',{name:'card_last_4',length:25,nullable:true})
  cardLast4?: string; // '4242'
  
  @Column('varchar',{name:'card_country', length:50,nullable:true})
  cardCountry?: string; // 'US', 'MX', 'ES'
  
  @Column('varchar',{name:'receip_url',nullable:true})
  receiptUrl?: string; // URL del recibo oficial de Stripe
  
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })  
  createdAt: Date;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' }) 
  @JoinColumn({name:'order_id',referencedColumnName:'id'})
  order: Order; // Relación con tu tabla de órdenes
}