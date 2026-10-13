import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity('transaction')
export class Transaction {

  @PrimaryGeneratedColumn('uuid',{name:'transaction_id',})  
  id: string; 
 
  @Index('IDX_transaction_payment_intent', { unique: true })
  @Column('varchar',{name:'stripe_payment_intent_id', length:350, unique:true})
  stripePaymentIntentId: string; 
  
  @Column('numeric',{name:'amount', precision: 10, scale: 2 })
  amount: number;
  
  @Column('varchar',{name:'currency',length:50})
  currency:string;
  
  @Index('IDX_transaction_status')
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

  @Index('IDX_transaction_order_id')
  @ManyToOne(() => Order, { onDelete: 'RESTRICT' }) 
  @JoinColumn({name:'order_id',referencedColumnName:'id'})
  order: Order; // Relación con tu tabla de órdenes
}