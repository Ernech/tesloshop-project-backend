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
  
  @Column('varchar',{name:'currency',length:50})
  currency:string;
  
  @Column('varchar',{name:'status',length:150})
  status: string; // 'succeeded', 'failed', 'processing' (Stripe status)
  
  @Column('varchar',{name:'customer_id',length:350, nullable:true})
  customerId?:string | null;
  
  @Column('varchar',{name:'',length:350,nullable:true})
  paymentMethodId?: string|null; 
  
  @Column('varchar',{name:'latest_charge_id', length:350,nullable:true})
  latestChargeId?: string;
  
  @Column('jsonb',{name:'metadata',nullable:true})
  metadata: Record<string, any>; // URL del recibo oficial de Stripe
  
  @CreateDateColumn({   default: () => 'CURRENT_TIMESTAMP', type: 'timestamp with time zone', name: 'created_at' })  
  createdAt: Date;

  @CreateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate:'CURRENT_TIMESTAMP'
    }) 
  updatedAt: Date;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' }) 
  @JoinColumn({name:'order_id',referencedColumnName:'id'})
  order: Order; // Relación con tu tabla de órdenes
}