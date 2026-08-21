import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { User } from "src/auth/entities/user.entity";
import { OrderStatus } from "../enums/order-status.enum";
import { Transaction } from "./transaction.entity";

@Entity('order')
export class Order{

    @PrimaryGeneratedColumn('uuid',{name:'order_id'})
    id:string;

    @Column('numeric', { name:'total', precision: 10, scale: 2 })
    total: number;

    @Column({type:"enum",enum:OrderStatus, default: OrderStatus.PENDING }) 
    status: OrderStatus;

    @Column('jsonb', { name: 'shipping_address' })
    shippingAddress: {
        streetAddress: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };


    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;


    @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' ,referencedColumnName:"id"}) 
    user: User;

    // Relación con los productos comprados
    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @OneToMany(()=>Transaction,(transaction)=>transaction.order)
    transactions:Transaction[]

}