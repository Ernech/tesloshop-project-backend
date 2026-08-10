import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { User } from "src/auth/entities/user.entity";
import { OrderStatus } from "../enums/order-status.enum";

@Entity('order')
export class Order{

    @PrimaryGeneratedColumn('uuid',{name:'order_id'})
    id:string;

    @Column('numeric', { name:'total', precision: 10, scale: 2 })
    total: number;

    @Column({type:"enum",enum:OrderStatus, default: OrderStatus.PENDING }) 
    status: OrderStatus;

    @Column('text',{name:'shipping_address'}) 
    shippingAddress: string;

    @Column('text', { nullable: true, name: 'stripe_charge_id' }) // ID de transacción de Stripe
    stripeChargeId: string;

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;


    @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
    user: User;

    // Relación con los productos comprados
    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];


}